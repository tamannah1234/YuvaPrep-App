import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Bot, Send, Mic } from "lucide-react";
import axios from "axios";

export default function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [chat, setChat] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);

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
          count: 10, // ✅ enforce 10 questions
        });

        const fetched = (res.data.questions || []).slice(0, 10);

        setQuestions(fetched);

        if (fetched.length > 0) {
          setChat([{ sender: "system", text: fetched[0] }]);
        }
      } catch (err) {
        console.error(err);
        navigate("/form");
      }
    };

    fetchQuestions();
  }, [userData, navigate]);

  /* SEND ANSWER */
  const handleSend = async () => {
    if (!answer.trim() || loadingEval) return;

    const currentQuestion = questions[currentIndex];
    const userMsg = { sender: "user", text: answer };

    setChat((prev) => [...prev, userMsg]);
    setAnswer("");
    setLoadingEval(true);

    try {
      const evalRes = await axios.post(
        "http://localhost:8000/metrics/evaluate",
        {
          answer,
          question: currentQuestion,
        }
      );

      const systemMsg = {
        sender: "system",
        text: `💡 Ideal Answer:
${evalRes.data.ideal_answer}

📊 Score: ${evalRes.data.scores.final_score}/10
🧠 Keywords: ${evalRes.data.scores.keyword_coverage}
💬 ${evalRes.data.feedback}`,
      };

      setChat((prev) => [...prev, systemMsg]);

      moveNext(systemMsg);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "system", text: "❌ Failed to evaluate answer." },
      ]);
    } finally {
      setLoadingEval(false);
    }
  };

  /* MOVE NEXT QUESTION (FIXED CENTRAL LOGIC) */
  const moveNext = (lastMsg) => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      const nextQ = { sender: "system", text: questions[nextIndex] };

      setChat((prev) => [...prev, nextQ]);
      setCurrentIndex(nextIndex);
    } else {
      navigate("/summary", { state: { chat } });
    }
  };

  /* MIC INPUT */
  const handleMic = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = recorder;
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob);

        try {
          setLoadingEval(true);

          const transRes = await axios.post(
            "http://localhost:8000/transcribe",
            formData,
            { timeout: 60000 }
          );

          const transcript = transRes.data.transcript;

          setChat((prev) => [...prev, { sender: "user", text: transcript }]);

          const evalRes = await axios.post(
            "http://localhost:8000/metrics/evaluate",
            {
              answer: transcript,
              question: questions[currentIndex],
            }
          );

          const systemMsg = {
            sender: "system",
            text: `💡 Ideal Answer:
${evalRes.data.ideal_answer}

📊 Score: ${evalRes.data.scores.final_score}/10
💬 ${evalRes.data.feedback}`,
          };

          setChat((prev) => [...prev, systemMsg]);

          moveNext(systemMsg);
        } catch (err) {
          alert("Mic processing failed");
        } finally {
          setLoadingEval(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert("Microphone permission denied");
    }
  };

  const handleEnd = () => {
    navigate("/summary", { state: { chat } });
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
            className="h-full bg-[#AD49E1] transition-all"
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
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "system" ? (
                <div className="flex gap-2 max-w-lg">
                  <Bot className="w-5 h-5 text-[#AD49E1] mt-1" />
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl whitespace-pre-line text-sm">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 max-w-lg">
                  <div className="bg-[#AD49E1]/20 border border-[#AD49E1]/30 p-3 rounded-xl text-sm">
                    {msg.text}
                  </div>
                  <User className="w-5 h-5 text-[#AD49E1] mt-1" />
                </div>
              )}
            </div>
          ))}

          {loadingEval && (
            <div className="text-sm text-white/50 animate-pulse">
              🤖 Evaluating answer...
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
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#AD49E1]"
          />

          <button
            onClick={handleMic}
            className={`p-3 rounded-xl ${
              recording ? "bg-red-600" : "bg-[#7A1CAC]"
            }`}
          >
            <Mic className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={handleSend}
            disabled={loadingEval}
            className="p-3 bg-[#AD49E1] rounded-xl"
          >
            <Send className="w-5 h-5 text-white" />
          </button>

          <button onClick={handleEnd} className="p-3 bg-red-600 rounded-xl">
            End
          </button>
        </div>
      </div>
    </div>
  );
}