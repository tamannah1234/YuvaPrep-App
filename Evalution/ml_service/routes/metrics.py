from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import re
import httpx
import os
from dotenv import load_dotenv

# ---------------------------
# Load API key
# ---------------------------
load_dotenv("../../yuva-prep-app/server/.env")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("Please set GROQ_API_KEY in the .env file")

# ---------------------------
# Router
# ---------------------------
router = APIRouter(prefix="/metrics", tags=["Metrics"])

# Load model once
bert_model = SentenceTransformer("all-MiniLM-L6-v2")

FILLER_WORDS = {"um", "uh", "like", "you know"}

# ---------------------------
# Request Schema
# ---------------------------
class EvalRequest(BaseModel):
    question: str
    answer: str

# ---------------------------
# Helper Functions
# ---------------------------
def clean_text(text: str) -> str:
    """Remove markdown, code blocks, extra spaces."""
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"(\*|_|\\)", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

async def get_ideal_answer(question: str) -> str:
    """Fetch concise ideal answer from Groq API"""
    url = "https://api.groq.com/openai/v1/responses"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openai/gpt-oss-20b",
        "input": (
            "Provide a concise, plain-text ideal interview answer "
            "(no bullet points, no headings) for the question below:\n\n"
            f"{question}\n\nAnswer:"
        )
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, json=payload)
        data = response.json()

    texts = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                texts.append(clean_text(content.get("text", "")))

    return " ".join(texts) if texts else "No ideal answer generated."

def keyword_coverage(answer: str, ideal: str) -> float:
    answer_words = set(re.findall(r"\w+", answer.lower()))
    ideal_words = set(re.findall(r"\w+", ideal.lower()))
    if not ideal_words:
        return 0.0
    matched = answer_words & ideal_words
    return round((len(matched) / len(ideal_words)) * 100, 2)

def semantic_density(answer: str) -> float:
    words = re.findall(r"\w+", answer)
    if not words:
        return 0.0
    meaningful = [w for w in words if w.lower() not in FILLER_WORDS]
    return round((len(meaningful) / len(words)) * 100, 2)

# ---------------------------
# Evaluation Endpoint
# ---------------------------
@router.post("/evaluate")
async def evaluate(req: EvalRequest):
    # 1. Get ideal answer
    ideal = await get_ideal_answer(req.question)

    # 2. Semantic similarity
    emb_user = bert_model.encode(req.answer, convert_to_tensor=True)
    emb_ideal = bert_model.encode(ideal, convert_to_tensor=True)
    similarity = util.cos_sim(emb_user, emb_ideal).item()
    similarity = max(0.0, min(similarity, 1.0))

    semantic_score = round(similarity * 100, 2)

    # 3. Other metrics
    coverage = keyword_coverage(req.answer, ideal)
    density = semantic_density(req.answer)

    # 4. FINAL SCORE (Weighted & Normalized)
    final_score = (
        0.6 * semantic_score +
        0.3 * coverage +
        0.1 * density
    )
    final_score = round(min(final_score, 100), 2)

    # 5. Feedback
    if final_score >= 80:
        feedback = "Great answer! Clear, relevant, and well-aligned."
    elif final_score >= 60:
        feedback = "Good answer, but try adding more key concepts."
    else:
        feedback = "Answer needs improvement. Focus on core concepts."

    return {
        "question": req.question,
        "user_answer": req.answer,
        "ideal_answer": ideal,
        "scores": {
            "semantic_score": semantic_score,
            "keyword_coverage": coverage,
            "semantic_density": density,
            "final_score": final_score
        },
        "feedback": feedback
    }

# ---------------------------
# Health Check
# ---------------------------
@router.get("/health")
def health():
    return {"status": "ok", "message": "Metrics API is running"}
