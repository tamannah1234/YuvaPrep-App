import { db } from "../services/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

/* GET ALL QUESTIONS */
export const getQuestions = async () => {
  const snapshot = await getDocs(collection(db, "questions_bank"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ADD QUESTION (optional admin use) */
export const addQuestion = async (data) => {
  await addDoc(collection(db, "questions_bank"), data);
};