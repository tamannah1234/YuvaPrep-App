import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveCandidate = async (data) => {
  const docRef = await addDoc(collection(db, "candidates"), {
    ...data,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data };
};