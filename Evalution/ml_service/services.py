# services.py
import os
import re
import httpx
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv

# --------------------------
# Load BERT model for semantic similarity
# --------------------------
bert_model = SentenceTransformer("all-MiniLM-L6-v2")

# --------------------------
# Helpers
# --------------------------
def clean_text(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"(\*\*|\*|__|_)", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

async def get_ideal_answer(question: str) -> str:
    """Generate ideal answer using GROQ API."""
    load_dotenv("../../yuva-prep-app/server/.env")  # adjust path to your .env
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        return "GROQ_API_KEY not set."

    url = "https://api.groq.com/openai/v1/responses"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "openai/gpt-oss-20b",
        "input": f"Provide a concise ideal answer for the following question:\n\n{question}"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, json=payload)
        data = response.json()
        output_list = data.get("output", [])
        texts = []
        for item in output_list:
            for content in item.get("content", []):
                if content.get("type") == "output_text" and "text" in content:
                    texts.append(clean_text(content["text"]))
        return "\n".join(texts) if texts else "No ideal answer generated."

def keyword_coverage(answer: str, ideal: str) -> float:
    """Compute keyword coverage between answer & ideal."""
    answer_words = set(re.findall(r"\w+", answer.lower()))
    ideal_words = set(re.findall(r"\w+", ideal.lower()))
    matched = answer_words & ideal_words
    return round(len(matched) / len(ideal_words) * 100, 2) if ideal_words else 0
