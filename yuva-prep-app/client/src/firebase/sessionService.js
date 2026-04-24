import { db } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Save interview session
 */
export const saveSession = async ({
  userId,
  role,
  experience,
  questions,
  scoreAvg,
}) => {
  await addDoc(collection(db, "sessions"), {
    userId,
    role,
    experience,
    scoreAvg,
    questions,
    createdAt: serverTimestamp(),
  });
};