from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv
import httpx
import whisper
import tempfile
import os
import re
from pydub import AudioSegment

# ---------------------------
# Load Environment Variables
# ---------------------------
load_dotenv(".env")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env file")

# ---------------------------
# Initialize FastAPI
# ---------------------------
app = FastAPI(title="Yuva-Prep-App Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Load ML Models (Load Once)
# ---------------------------
bert_model = SentenceTransformer("all-MiniLM-L6-v2")
whisper_model = whisper.load_model("base")

# ---------------------------
# Constants
# ---------------------------
FILLER_WORDS = {"um", "uh", "like", "you know"}

STOPWORDS = {
    "the","is","a","an","and","or","in","on","at","to","for","of",
    "with","that","this","it","as","by","from","be","are","was","were",
    "i","you","he","she","they","we"
}

# ---------------------------
# Request Model
# ---------------------------
class EvalRequest(BaseModel):
    question: str
    answer: str

# ---------------------------
# Utility Functions
# ---------------------------
def clean_text(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"(\\|\*|_)", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def keyword_coverage(answer: str, ideal: str) -> float:
    answer_words = {
        w for w in re.findall(r"\w+", answer.lower())
        if w not in STOPWORDS and len(w) > 3
    }

    ideal_words = {
        w for w in re.findall(r"\w+", ideal.lower())
        if w not in STOPWORDS and len(w) > 3
    }

    if not ideal_words:
        return 0.0

    coverage_ratio = len(answer_words & ideal_words) / len(ideal_words)
    return round(min(coverage_ratio * 10, 10), 2)


def semantic_density(answer: str) -> float:
    words = re.findall(r"\w+", answer)
    if not words:
        return 0.0

    meaningful = [w for w in words if w.lower() not in FILLER_WORDS]
    density = (len(meaningful) / len(words)) * 100
    return round(density, 2)


async def get_ideal_answer(question: str) -> str:
    try:
        url = "https://api.groq.com/openai/v1/responses"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "openai/gpt-oss-20b",
            "input": f"Provide a concise, structured interview answer:\n\n{question}\n\nAnswer:"
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            return "Unable to generate ideal answer."

        data = response.json()

        texts = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    texts.append(clean_text(content.get("text", "")))

        return " ".join(texts) if texts else "No ideal answer generated."

    except Exception:
        return "Ideal answer generation failed."


# ---------------------------
# Evaluation Endpoint
# ---------------------------
@app.post("/metrics/evaluate")
async def evaluate(req: EvalRequest):

    question = clean_text(req.question)
    answer = clean_text(req.answer)

    if not answer:
        return {
            "scores": {
                "semantic_score": "0/10",
                "keyword_coverage": "0/10",
                "semantic_density": "0/10",
                "final_score": "0/10"
            },
            "feedback": "Answer cannot be empty."
        }

    ideal = await get_ideal_answer(question)

    # Generate embeddings
    emb_q = bert_model.encode(question, convert_to_tensor=True)
    emb_a = bert_model.encode(answer, convert_to_tensor=True)
    emb_i = bert_model.encode(ideal, convert_to_tensor=True)

    # Copy detection
    question_words = set(re.findall(r"\w+", question.lower()))
    answer_words = set(re.findall(r"\w+", answer.lower()))

    overlap_ratio = (
        len(question_words & answer_words) / len(question_words)
        if question_words else 0
    )

    semantic_q_similarity = util.cos_sim(emb_a, emb_q).item()

    if overlap_ratio > 0.8 or semantic_q_similarity > 0.92:
        return {
            "scores": {
                "semantic_score": "0/10",
                "keyword_coverage": "0/10",
                "semantic_density": "0/10",
                "final_score": "0/10"
            },
            "feedback": "Answer appears copied. Please provide an original response."
        }

    # Scoring
    semantic_raw = util.cos_sim(emb_a, emb_i).item()
    semantic_score = round(max(0, semantic_raw) * 10, 2)

    coverage_score = keyword_coverage(answer, ideal)

    density_percent = semantic_density(answer)
    density_score = round((density_percent / 100) * 10, 2)

    final_score = round(
        min(
            0.6 * semantic_score +
            0.25 * coverage_score +
            0.15 * density_score,
            10
        ),
        2
    )

    # Feedback
    if final_score >= 8:
        feedback = "Excellent answer. Strong clarity and coverage."
    elif final_score >= 6:
        feedback = "Good answer. Add more depth and structure."
    elif final_score >= 4:
        feedback = "Fair attempt. Expand key concepts."
    else:
        feedback = "Needs significant improvement."

    return {
        "scores": {
            "semantic_score": f"{semantic_score}/10",
            "keyword_coverage": f"{coverage_score}/10",
            "semantic_density": f"{density_score}/10",
            "final_score": f"{final_score}/10"
        },
        "feedback": feedback,
        "ideal_answer": ideal
    }


# ---------------------------
# Audio Transcription
# ---------------------------
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            webm_path = tmp.name

        wav_path = webm_path.replace(".webm", ".wav")

        audio = AudioSegment.from_file(webm_path)
        audio = audio.set_channels(1).set_frame_rate(16000)
        audio.export(wav_path, format="wav")

        result = whisper_model.transcribe(wav_path)
        transcript = result.get("text", "").strip()

        words = re.findall(r"\w+", transcript)
        duration = len(audio) / 1000

        wpm = round((len(words) / duration) * 60, 2) if duration > 0 else 0
        fillers = sum(1 for w in words if w.lower() in FILLER_WORDS)

        os.remove(webm_path)
        os.remove(wav_path)

        return {
            "transcript": transcript,
            "metrics": {
                "duration_seconds": round(duration, 2),
                "word_count": len(words),
                "wpm": wpm,
                "fillers": fillers
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Health Check
# ---------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "Yuva-Prep-App API is running"
    }
