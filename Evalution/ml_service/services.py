import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def clean_text(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"(\*\*|\*|__|_)", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


async def get_ideal_answer(question: str) -> str:
    if not GROQ_API_KEY:
        return "GROQ_API_KEY missing"

    url = "https://api.groq.com/openai/v1/responses"

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "openai/gpt-oss-20b",
        "input": f"Provide a structured interview answer:\n\n{question}"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        return "Failed to generate ideal answer"

    data = response.json()

    texts = []
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                texts.append(clean_text(content.get("text", "")))

    return " ".join(texts) if texts else "No answer generated"


def keyword_coverage(answer: str, ideal: str) -> float:
    answer_words = set(re.findall(r"\w+", answer.lower()))
    ideal_words = set(re.findall(r"\w+", ideal.lower()))

    if not ideal_words:
        return 0

    return round(len(answer_words & ideal_words) / len(ideal_words) * 10, 2)


def semantic_density(answer: str) -> float:
    words = re.findall(r"\w+", answer)
    if not words:
        return 0

    meaningful = [w for w in words if len(w) > 3]
    return round((len(meaningful) / len(words)) * 10, 2)