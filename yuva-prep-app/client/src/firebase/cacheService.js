import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { getQuestionId } from "../utils/questionId";

/* -------------------------------
   GET IDEAL ANSWER (CACHE FIRST)
-------------------------------- */
export const getIdealAnswer = async (question) => {
  const questionId = getQuestionId(question);

  const ref = doc(db, "ideal_answers", questionId);
  const snap = await getDoc(ref);

  // ✅ CACHE HIT
  if (snap.exists()) {
    return snap.data().idealAnswer;
  }

  // ❌ CACHE MISS → CALL GROQ (you will pass function later)
  return null;
};

/* -------------------------------
   SAVE IDEAL ANSWER (GROQ RESULT)
-------------------------------- */
export const saveIdealAnswer = async (question, idealAnswer, model = "llama-3") => {
  const questionId = getQuestionId(question);

  const ref = doc(db, "ideal_answers", questionId);

  await setDoc(ref, {
    question,
    idealAnswer,
    model,
    createdAt: serverTimestamp(),
    usageCount: 1
  });
};