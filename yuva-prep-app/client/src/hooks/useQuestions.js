import { useState } from "react";
import { getQuestions } from "../services/questionService";

export const useQuestions = () => {

const [loading,setLoading]=useState(false)
const [questions,setQuestions]=useState([])

const fetchQuestions = async (role)=>{

setLoading(true)

const data = await getQuestions(role)

setQuestions(data)

setLoading(false)

}

return {
loading,
questions,
fetchQuestions
}

}