from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv
import httpx
import whisper
import tempfile
import os
import re
import time
from pydub import AudioSegment

# ---------------------------
# Load environment
# ---------------------------
load_dotenv(".env")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("Please set GROQ_API_KEY in the .env file")

# ---------------------------
# FastAPI app
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
# Load ML Models (ONCE)
# ---------------------------
bert_model = SentenceTransformer("all-MiniLM-L6-v2")
whisper_model = whisper.load_model("base")

FILLER_WORDS = {"um", "uh", "like", "you know"}

# ---------------------------
# Request Models
# ---------------------------
class EvalRequest(BaseModel):
    question: str
    answer: str

# ---------------------------
# Helper Functions
# ---------------------------
def clean_text(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"(\\|\*|_)", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

def keyword_coverage(answer: str, ideal: str) -> float:
    answer_words = set(re.findall(r"\w+", answer.lower()))
    ideal_words = set(re.findall(r"\w+", ideal.lower()))
    return round(len(answer_words & ideal_words) / len(ideal_words) * 100, 2) if ideal_words else 0.0

def semantic_density(answer: str) -> float:
    words = re.findall(r"\w+", answer)
    meaningful = [w for w in words if w.lower() not in FILLER_WORDS]
    return round(len(meaningful) / len(words) * 100, 2) if words else 0.0

async def get_ideal_answer(question: str) -> str:
    url = "https://api.groq.com/openai/v1/responses"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "openai/gpt-oss-20b",
        "input": f"Provide a concise, plain-text ideal interview answer:\n\n{question}\n\nAnswer:"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(url, headers=headers, json=payload)
        data = res.json()

    texts = []
    for item in data.get("output", []):
        for c in item.get("content", []):
            if c.get("type") == "output_text":
                texts.append(clean_text(c.get("text", "")))

    return " ".join(texts) if texts else "No ideal answer generated."

# ---------------------------
# Evaluation Endpoint
# ---------------------------
@app.post("/metrics/evaluate")
async def evaluate(req: EvalRequest):
    question = clean_text(req.question)
    answer = clean_text(req.answer)

    ideal = await get_ideal_answer(question)

    emb_q = bert_model.encode(question, convert_to_tensor=True)
    emb_a = bert_model.encode(answer, convert_to_tensor=True)

    if util.cos_sim(emb_a, emb_q).item() > 0.9:
        return {
            "question": req.question,
            "user_answer": req.answer,
            "ideal_answer": ideal,
            "scores": {
                "semantic_score": 0,
                "keyword_coverage": 0,
                "semantic_density": 0,
                "final_score": 0
            },
            "feedback": "Your answer appears to be copied from the question."
        }

    emb_i = bert_model.encode(ideal, convert_to_tensor=True)
    semantic_score = round(util.cos_sim(emb_a, emb_i).item() * 100, 2)

    coverage = keyword_coverage(answer, ideal)
    density = semantic_density(answer)

    final_score = round(
        min(0.6 * semantic_score + 0.3 * coverage + 0.1 * density, 100), 2
    )

    feedback = (
        "Great answer! Clear and accurate."
        if final_score >= 80 else
        "Good answer, but add more key concepts."
        if final_score >= 60 else
        "Needs improvement. Focus on core ideas."
    )

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
# 🎤 Audio Transcription (FIXED)
# ---------------------------
@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        # 1. Save browser mic audio (webm)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            webm_path = tmp.name

        # 2. Convert to WAV (16kHz mono)
        wav_path = webm_path.replace(".webm", ".wav")
        audio = AudioSegment.from_file(webm_path)
        audio = audio.set_channels(1).set_frame_rate(16000)
        audio.export(wav_path, format="wav")

        # 3. Transcribe
        result = whisper_model.transcribe(wav_path)
        transcript = result["text"].strip()

        # 4. Metrics
        words = re.findall(r"\w+", transcript)
        duration = len(audio) / 1000
        wpm = round((len(words) / duration) * 60, 2) if duration > 0 else 0

        fillers = sum(1 for w in words if w.lower() in FILLER_WORDS)

        # 5. Cleanup
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
        print("TRANSCRIPTION ERROR:", e)
        return {
            "error": "Transcription failed",
            "details": str(e)
        }

# ---------------------------
# Health Check
# ---------------------------
@app.get("/health")
def health():
    return {"status": "ok", "message": "Yuva-Prep-App API is running"}
