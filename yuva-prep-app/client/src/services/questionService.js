import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getQuestions = async (role) => {

const ref = doc(db,"questions",role)

const snap = await getDoc(ref)

if(snap.exists()){
return snap.data()
}

const response = await fetch("/api/questions")

const data = await response.json()

await setDoc(ref,data)

return data

}