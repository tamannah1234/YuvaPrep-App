import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getIdealAnswer, saveIdealAnswer } from "../firebase/cacheService";
import { getQuestionId } from "../utils/questionId";
import { saveSession } from "../firebase/sessionService";
import { useUser } from "@clerk/clerk-react";

export default function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = location.state || {};
  const { user } = useUser();

  const [questions, setQuestions] = useState([]);
  const [chat, setChat] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loadingEval, setLoadingEval] = useState(false);

  const chatEndRef = useRef(null);
  const sessionScoresRef = useRef([]);

  /* AUTO SCROLL */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  /* LOAD QUESTIONS */
  useEffect(() => {
    if (!userData) return navigate("/form");

    const fetchQuestions = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/questions", {
          role: userData.desired_role,
          experience: userData.experience_years,
          job_description: userData.job_description,
          count: 10,
        });

        const fetched = res.data.questions || [];

        setQuestions(fetched);

        if (fetched.length > 0) {
          setChat([
            {
              sender: "system",
              text: fetched[0].question,
            },
          ]);
        }
      } catch (err) {
        navigate("/form");
      }
    };

    fetchQuestions();
  }, [userData, navigate]);

  /* NEXT QUESTION */
  const moveNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setChat((prev) => [
        ...prev,
        {
          sender: "system",
          text: questions[nextIndex].question,
        },
      ]);
      setCurrentIndex(nextIndex);
    } else {
      handleEnd();
    }
  };

  /* SEND ANSWER */
  const handleSend = async () => {
    if (!answer.trim() || loadingEval) return;

    const currentQObj = questions[currentIndex];
    const currentQuestion = currentQObj.question;
    const skill = currentQObj.skill;

    setChat((prev) => [...prev, { sender: "user", text: answer }]);
    setAnswer("");
    setLoadingEval(true);

    try {
      const questionId = getQuestionId(currentQuestion);

      /* CACHE CHECK */
      let idealAnswer = await getIdealAnswer(questionId);

      if (!idealAnswer) {
        const evalRes = await axios.post(
          "http://localhost:8000/metrics/evaluate",
          {
            answer,
            question: currentQuestion,
          }
        );

        idealAnswer = evalRes.data.ideal_answer;

        await saveIdealAnswer({
          questionId,
          question: currentQuestion,
          idealAnswer,
          model: "llama-3",
          createdAt: new Date(),
        });
      }

      /* FINAL EVALUATION */
      const evalRes = await axios.post(
        "http://localhost:8000/metrics/evaluate",
        {
          answer,
          question: currentQuestion,
        }
      );

      const score = evalRes.data.scores.final_score;

      /* STORE PER QUESTION RESULT */
      sessionScoresRef.current.push({
        questionId,
        question: currentQuestion,
        skill,
        answer,
        score,
        keywords: evalRes.data.scores.keyword_coverage,
        feedback: evalRes.data.feedback,
      });

      setChat((prev) => [
        ...prev,
        {
          sender: "system",
          text:
            "Ideal Answer:\n" +
            idealAnswer +
            "\n\nScore: " +
            score +
            "/10\nKeywords: " +
            evalRes.data.scores.keyword_coverage +
            "\n\n" +
            evalRes.data.feedback,
        },
      ]);

      moveNext();
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "system", text: "Failed to evaluate answer." },
      ]);
    } finally {
      setLoadingEval(false);
    }
  };

  /* END INTERVIEW + SAVE SESSION */
  const handleEnd = async () => {
    try {
      const total = sessionScoresRef.current.reduce(
        (sum, q) => sum + q.score,
        0
      );

      const scoreAvg =
        sessionScoresRef.current.length > 0
          ? total / sessionScoresRef.current.length
          : 0;

      await saveSession({
        userId: user?.id,
        role: userData.desired_role,
        experience: userData.experience_years,
        scoreAvg: Number(scoreAvg.toFixed(2)),
        questions: sessionScoresRef.current,
      });

      navigate("/summary", {
        state: { chat, sessionScores: sessionScoresRef.current },
      });
    } catch (err) {
      navigate("/summary", {
        state: { chat, sessionScores: sessionScoresRef.current },
      });
    }
  };

  /* PROGRESS */
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-[#0f0718] text-white flex flex-col items-center py-6 px-4">

      {/* HEADER */}
      <div className="w-full max-w-3xl mb-4">
        <h1 className="text-xl font-semibold">
          AI <span className="text-[#AD49E1]">Mock Interview</span>
        </h1>

        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AD49E1]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-white/50 mt-1">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* CHAT */}
      <div className="w-full max-w-3xl bg-[#0a0112]/80 border border-[#AD49E1]/20 rounded-2xl flex flex-col overflow-hidden">

        <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {chat.map((msg, idx) => (
            <div key={idx} className="flex justify-start">
              <div className="max-w-lg bg-white/5 border border-white/10 p-3 rounded-xl text-sm whitespace-pre-line">
                {msg.text}
              </div>
            </div>
          ))}

          {loadingEval && (
            <div className="text-sm text-white/50">
              Evaluating answer...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 flex gap-3 border-t border-white/10 bg-[#0a0112]">

          <input
            value={answer}
            disabled={loadingEval}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={handleSend}
            className="p-3 bg-[#AD49E1] rounded-xl"
          >
            SEND
          </button>

          <button
            onClick={handleEnd}
            className="p-3 bg-red-600 rounded-xl"
          >
            END
          </button>

        </div>
      </div>
    </div>
  );
}