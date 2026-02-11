# app/scoring.py
from typing import List, Dict

def coverage_score(answer: str, required_keywords: List[str]) -> float:
    a = answer.lower()
    hits = sum(1 for k in required_keywords if k in a)
    if not required_keywords: 
        return 0.0
    return min(1.0, hits / max(4, len(required_keywords)//3 or 1))  # generous for MVP

def combine(similarity: float, coverage: float, sentiment_pos_prob: float) -> Dict:
    # weights: similarity 0.6, coverage 0.25, sentiment 0.15
    final = 0.6*similarity + 0.25*coverage + 0.15*sentiment_pos_prob
    return {
        "similarity": round(similarity, 3),
        "coverage": round(coverage, 3),
        "sentiment_pos": round(sentiment_pos_prob, 3),
        "final_score": round(final, 3)
    }
