# # app/scoring.py
# from typing import List, Dict

# def coverage_score(answer: str, required_keywords: List[str]) -> float:
#     a = answer.lower()
#     hits = sum(1 for k in required_keywords if k in a)
#     if not required_keywords: 
#         return 0.0
#         # 🔥 Limit keywords to top 10 (prevents unfair low score)
#     required_keywords = required_keywords[:10]
#     return min(1.0, hits / max(4, len(required_keywords)//3 or 1))  # generous for MVP

# def combine(similarity: float, coverage: float, sentiment_pos_prob: float) -> Dict:
#     # weights: similarity 0.6, coverage 0.25, sentiment 0.15
#     final = 0.6*similarity + 0.25*coverage + 0.15*sentiment_pos_prob
#     return {
#         "similarity": round(similarity, 3),
#         "coverage": round(coverage, 3),
#         "sentiment_pos": round(sentiment_pos_prob, 3),
#         "final_score": round(final, 3)
#     }



# # app/scoring.py

# import re
# from typing import List, Dict


# # ---------------------------
# # Keyword Coverage (0–1 scale)
# # ---------------------------
# def coverage_score(answer: str, required_keywords: List[str]) -> float:
#     """
#     Calculates how many important keywords from the ideal answer
#     are present in the user's answer.
#     Returns value between 0 and 1.
#     """

#     if not required_keywords:
#         return 0.0

#     # 🔥 Limit keywords to top 10 (prevents unfair low scoring)
#     required_keywords = required_keywords[:10]

#     answer_clean = answer.lower()

#     hits = 0

#     for keyword in required_keywords:
#         keyword_clean = keyword.lower()

#         # Match full word only (avoids partial false matches)
#         pattern = rf"\b{re.escape(keyword_clean)}\b"

#         if re.search(pattern, answer_clean):
#             hits += 1

#     # Better denominator logic
#     denominator = max(3, len(required_keywords))

#     coverage = hits / denominator

#     return round(min(1.0, coverage), 3)


# # ---------------------------
# # Final Score Combination
# # ---------------------------
# def combine(similarity: float, coverage: float, sentiment_pos_prob: float) -> Dict:
#     """
#     Combines all metrics into final score (0–10 scale)
#     similarity, coverage, sentiment must be in 0–1 range
#     """

#     # Safety clamp
#     similarity = max(0, min(1, similarity))
#     coverage = max(0, min(1, coverage))
#     sentiment_pos_prob = max(0, min(1, sentiment_pos_prob))

#     # Balanced weights (less similarity dominance)
#     weighted = (
#         0.55 * similarity +
#         0.30 * coverage +
#         0.15 * sentiment_pos_prob
#     )

#     # Convert to 0–10 scale
#     final_score = round(weighted * 10, 2)

#     return {
#         "similarity": round(similarity, 3),
#         "coverage": round(coverage, 3),
#         "sentiment_pos": round(sentiment_pos_prob, 3),
#         "final_score": final_score
#     }


# app/scoring.py

import re
from typing import List, Dict


MAX_KEYWORDS = 25  # Dynamic cap for fairness


# ---------------------------
# Keyword Coverage (0–1 scale)
# ---------------------------
def coverage_score(answer: str, required_keywords: List[str]) -> float:
    """
    Calculates keyword coverage using percentage match.
    Caps keyword list to avoid unfair low scores.
    """

    if not required_keywords:
        return 0.0

    # 🔥 Dynamic cap (only if too many keywords)
    if len(required_keywords) > MAX_KEYWORDS:
        required_keywords = required_keywords[:MAX_KEYWORDS]

    answer_clean = answer.lower()

    hits = 0

    for keyword in required_keywords:
        keyword_clean = keyword.lower()
        pattern = rf"\b{re.escape(keyword_clean)}\b"

        if re.search(pattern, answer_clean):
            hits += 1

    coverage = hits / len(required_keywords)

    # Soft boost if decent coverage
    if coverage >= 0.5:
        coverage = min(1.0, coverage + 0.1)

    return round(coverage, 3)


# ---------------------------
# Final Score Combination
# ---------------------------
def combine(similarity: float, coverage: float, sentiment_pos_prob: float) -> Dict:
    """
    Final score out of 10
    """

    similarity = max(0, min(1, similarity))
    coverage = max(0, min(1, coverage))
    sentiment_pos_prob = max(0, min(1, sentiment_pos_prob))

    weighted = (
        0.55 * similarity +
        0.30 * coverage +
        0.15 * sentiment_pos_prob
    )

    final_score = round(weighted * 10, 2)

    return {
        "similarity": round(similarity, 3),
        "coverage": round(coverage, 3),
        "sentiment_pos": round(sentiment_pos_prob, 3),
        "final_score": final_score
    }
