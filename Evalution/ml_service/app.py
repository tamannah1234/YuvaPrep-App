from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

from models import get_bert_model
from services import (
    clean_text,
    get_ideal_answer,
    keyword_coverage,
    semantic_density
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bert_model = get_bert_model()


# ✅ REQUEST MODEL
class EvalRequest(BaseModel):
    question: str
    answer: str


# ✅ FIXED ENDPOINT
@app.post("/metrics/evaluate")
async def evaluate(req: EvalRequest):

    question = clean_text(req.question)
    answer = clean_text(req.answer)

    if not question or not answer:
        raise HTTPException(status_code=422, detail="Question & Answer required")

    ideal = await get_ideal_answer(question)

    emb_a = bert_model.encode(answer, convert_to_tensor=True)
    emb_i = bert_model.encode(ideal, convert_to_tensor=True)

    from sentence_transformers import util

    similarity = util.cos_sim(emb_a, emb_i).item()
    similarity_score = round(max(0, similarity) * 10, 2)

    coverage = keyword_coverage(answer, ideal)
    density = semantic_density(answer)

    final_score = round(
        min(0.6 * similarity_score + 0.25 * coverage + 0.15 * density, 10),
        2
    )

    return {
        "scores": {
            "semantic_score": f"{similarity_score}/10",
            "keyword_coverage": f"{coverage}/10",
            "semantic_density": f"{density}/10",
            "final_score": final_score
        },
        "feedback": "Auto-generated feedback",
        "ideal_answer": ideal
    }


@app.get("/health")
def health():
    return {"status": "ok"}