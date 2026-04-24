from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from starlette.middleware.cors import CORSMiddleware
from .roles import ROLE_KEYWORDS
from .scoring import coverage_score, combine

app = FastAPI(title="AI Interview API", version="0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load models once ----
qg = pipeline("text-generation", model="google/flan-t5-small", do_sample=True)
summarizer = pipeline("text-generation", model="google/flan-t5-small", do_sample=True)
sentiment = pipeline("sentiment-analysis")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ---------- Schemas ----------
class QuestionReq(BaseModel):
    role: str
    count: int = 5

class EvalReq(BaseModel):
    role: str
    question: str
    answer: str
    reference_answer: Optional[str] = None

class FeedbackReq(BaseModel):
    role: str
    qa: List[dict]


# ---------- Helper: Skill Extractor ----------
def extract_skill(question: str, role: str):
    q = question.lower()

    if "react" in q or "hook" in q or "useeffect" in q:
        return "React"
    elif "javascript" in q or "event loop" in q or "promise" in q:
        return "JavaScript"
    elif "css" in q or "html" in q:
        return "Frontend"
    elif "system design" in q:
        return "System Design"
    elif "api" in q or "backend" in q:
        return "Backend"

    return role


# ---------- Endpoints ----------
@app.get("/health")
def health():
    return {"ok": True}


# ---------- UPDATED QUESTIONS ENDPOINT ----------
@app.post("/questions")
def generate_questions(req: QuestionReq):

    prompt = (
        f"Generate {req.count} interview questions for a {req.role} developer. "
        f"Each question should be clear and concise."
    )

    out = qg(prompt, max_length=256, num_return_sequences=1)[0]["generated_text"]

    raw_qs = [q.strip() for q in out.split("\n") if q.strip()]

    questions = []

    for q in raw_qs[:req.count]:
        clean_q = q.strip(" -•0123456789.").strip()
        if clean_q:
            questions.append({
                "question": clean_q,
                "skill": extract_skill(clean_q, req.role)
            })

    return {
        "role": req.role,
        "questions": questions[:req.count]
    }


# ---------- EVALUATION ----------
@app.post("/evaluate")
def evaluate(req: EvalReq):

    if req.reference_answer:
        ref_text = req.reference_answer
    else:
        gen_prompt = f"Provide a strong interview answer (5-8 sentences) to: {req.question}"
        ref_text = qg(gen_prompt, max_length=192, num_return_sequences=1)[0]["generated_text"]

    # semantic similarity
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
        f"Candidate answer: {req.answer}\n"
        f"Reference: {ref_text}\n"
        f"Scores -> similarity:{scores['similarity']}, coverage:{scores['coverage']}, sentiment:{scores['sentiment_pos']}.\n"
        "Give 3 strengths and 3 improvements in bullet points."
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

    lines = []
    for i, item in enumerate(req.qa, 1):
        lines.append(
            f"Q{i}: {item.get('q')}\nA{i}: {item.get('a')}\nScore: {item.get('score')}"
        )

    body = "\n\n".join(lines) + "\n\nProvide a concise, motivational summary with next steps."

    summary = summarizer(body, max_length=180, num_return_sequences=1)[0]["generated_text"]

    return {"summary": summary}