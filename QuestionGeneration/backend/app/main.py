from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from starlette.middleware.cors import CORSMiddleware

from .roles import ROLE_KEYWORDS
from .scoring import coverage_score, combine
from .firebase import db   # 🔥 NEW FIREBASE IMPORT

app = FastAPI(title="AI Interview API", version="0.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ML Models ----
qg = pipeline("text-generation", model="google/flan-t5-small", do_sample=True)
summarizer = pipeline("text-generation", model="google/flan-t5-small", do_sample=True)
sentiment = pipeline("sentiment-analysis")
embedder = SentenceTransformer("all-MiniLM-L6-v2")


# ---------- Schemas ----------
class QuestionReq(BaseModel):
    role: str
    experience_level: str = "fresher"
    count: int = 5


class EvalReq(BaseModel):
    role: str
    question: str
    answer: str
    reference_answer: Optional[str] = None


class FeedbackReq(BaseModel):
    role: str
    qa: List[dict]


# ---------- Helper ----------
def extract_skill(question: str, role: str):
    q = question.lower()

    if "react" in q or "hook" in q or "useeffect" in q:
        return "React"
    elif "javascript" in q or "promise" in q:
        return "JavaScript"
    elif "css" in q or "html" in q:
        return "Frontend"
    elif "system design" in q:
        return "System Design"
    elif "api" in q or "backend" in q:
        return "Backend"

    return role


# ---------- FIREBASE QUESTION FETCH ----------
def fetch_questions_from_firestore(role: str, level: str, limit: int):

    docs = (
        db.collection("questions_bank")
        .where("role", "==", role)
        .where("experience_level", "==", level)
        .limit(limit)
        .stream()
    )

    questions = []

    for doc in docs:
        data = doc.to_dict()
        questions.append({
            "question": data.get("question"),
            "question_id": data.get("question_id"),
            "difficulty": data.get("difficulty"),
            "skill": data.get("topic", role)
        })

    return questions


# ---------- HEALTH ----------
@app.get("/health")
def health():
    return {"ok": True}


# ---------- QUESTIONS ENDPOINT (FIREBASE FIRST) ----------
@app.post("/questions")
def generate_questions(req: QuestionReq):

    # 1️⃣ Try Firestore first
    questions = fetch_questions_from_firestore(
        req.role,
        req.experience_level,
        req.count
    )

    # 2️⃣ If not enough questions → fallback AI
    if len(questions) < req.count:

        prompt = (
            f"Generate {req.count} interview questions for a {req.role} developer "
            f"with experience level {req.experience_level}."
        )

        out = qg(prompt, max_length=256, num_return_sequences=1)[0]["generated_text"]

        raw_qs = [q.strip() for q in out.split("\n") if q.strip()]

        for q in raw_qs:
            clean_q = q.strip(" -•0123456789.").strip()
            if clean_q:
                questions.append({
                    "question": clean_q,
                    "skill": extract_skill(clean_q, req.role)
                })

            if len(questions) >= req.count:
                break

    return {
        "role": req.role,
        "experience_level": req.experience_level,
        "questions": questions[:req.count]
    }


# ---------- EVALUATION ----------
@app.post("/metrics/evaluate")
def evaluate(req: EvalReq):

    if req.reference_answer:
        ref_text = req.reference_answer
    else:
        gen_prompt = f"Provide a strong interview answer (5-8 sentences) to: {req.question}"
        ref_text = qg(gen_prompt, max_length=192, num_return_sequences=1)[0]["generated_text"]

    a_emb = embedder.encode(req.answer, convert_to_tensor=True)
    r_emb = embedder.encode(ref_text, convert_to_tensor=True)

    sim = float(util.cos_sim(a_emb, r_emb).item())
    sim = max(0.0, min(1.0, (sim + 1) / 2))

    kws = ROLE_KEYWORDS.get(req.role.lower(), [])
    cov = coverage_score(req.answer, kws)

    s = sentiment(req.answer)[0]
    pos_prob = s["score"] if s["label"].upper() == "POSITIVE" else 1 - s["score"]

    scores = combine(sim, cov, pos_prob)

    feedback_input = (
        f"Question: {req.question}\n"
        f"Answer: {req.answer}\n"
        f"Reference: {ref_text}\n"
        "Give 3 strengths and 3 improvements."
    )

    fb = summarizer(feedback_input, max_length=120, num_return_sequences=1)[0]["generated_text"]

    return {
        "scores": scores,
        "reference_answer": ref_text,
        "feedback": fb
    }


# ---------- SESSION FEEDBACK ----------
@app.post("/session/feedback")
def session_feedback(req: FeedbackReq):

    body = "\n\n".join([
        f"Q: {x.get('q')}\nA: {x.get('a')}\nScore: {x.get('score')}"
        for x in req.qa
    ])

    summary = summarizer(
        body + "\nGive motivational feedback and improvement plan.",
        max_length=180,
        num_return_sequences=1
    )[0]["generated_text"]

    return {"summary": summary}