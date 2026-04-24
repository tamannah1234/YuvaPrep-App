import { db } from "../services/firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save or update skill analytics per user session
 */
export const saveSkillAnalytics = async ({ userId, role, skillScores }) => {
  const ref = doc(db, "skill_analytics", userId);

  const existing = await getDoc(ref);

  if (existing.exists()) {
    await updateDoc(ref, {
      ...skillScores,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      userId,
      role,
      ...skillScores,
      createdAt: serverTimestamp(),
    });
  }
};