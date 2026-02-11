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

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Load questions
  useEffect(() => {
    if (!userData) return navigate("/form");

    const fetchQuestions = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/questions", {
          role: userData.desired_role,
          experience: userData.experience_years,
          job_description: userData.job_description,
        });

        const fetchedQuestions = res.data.questions || [];
        setQuestions(fetchedQuestions);

        if (fetchedQuestions.length > 0) {
          setChat([{ sender: "system", text: fetchedQuestions[0] }]);
        }
      } catch (err) {
        console.error(err);
        navigate("/form");
      }
    };

    fetchQuestions();
  }, [userData, navigate]);

  // -----------------------------
  // Send text answer
  // -----------------------------
  const handleSend = async () => {
    if (!answer.trim()) return;

    const currentQuestion = questions[currentIndex] || "default question";
    let updatedChat = [...chat, { sender: "user", text: answer }];

    try {
      const evalRes = await axios.post(
        "http://localhost:8000/metrics/evaluate",
        {
          answer,
          question: currentQuestion,
        }
      );

      updatedChat.push({
        sender: "system",
        text: `Ideal Answer:
${evalRes.data.ideal_answer}

Feedback →
Score: ${evalRes.data.scores.final_score}%
Keywords: ${evalRes.data.scores.keyword_coverage}%
Comment: ${evalRes.data.feedback}`,
      });
    } catch (err) {
      console.error("Evaluation error:", err);
      updatedChat.push({
        sender: "system",
        text: "Failed to evaluate answer.",
      });
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      updatedChat.push({
        sender: "system",
        text: questions[nextIndex],
      });
      setCurrentIndex(nextIndex);
    } else {
      navigate("/summary", { state: { chat: updatedChat } });
      return;
    }

    setChat(updatedChat);
    setAnswer("");
  };

  // -----------------------------
  // Mic input (FIXED)
  // -----------------------------
  const handleMic = async () => {
    if (recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        // 🔥 stop mic immediately
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const currentQuestion = questions[currentIndex] || "default question";

        try {
          const transRes = await axios.post(
            "http://localhost:8000/transcribe",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 60000, // 🔥 REQUIRED FOR WHISPER
            }
          );

          const transcript = transRes.data.transcript;
          let updatedChat = [...chat, { sender: "user", text: transcript }];

          const evalRes = await axios.post(
            "http://localhost:8000/metrics/evaluate",
            {
              answer: transcript,
              question: currentQuestion,
            }
          );

          updatedChat.push({
            sender: "system",
            text: `Ideal Answer:
${evalRes.data.ideal_answer}

Feedback →
Score: ${evalRes.data.scores.final_score}%
Comment: ${evalRes.data.feedback}`,
          });

          const nextIndex = currentIndex + 1;
          if (nextIndex < questions.length) {
            updatedChat.push({
              sender: "system",
              text: questions[nextIndex],
            });
            setCurrentIndex(nextIndex);
          } else {
            navigate("/summary", { state: { chat: updatedChat } });
            return;
          }

          setChat(updatedChat);
        } catch (err) {
          console.error("Mic processing error:", err);
          alert("Failed to process microphone input.");
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic permission error:", err);
      alert("Microphone access denied!");
    }
  };

  // End interview
  const handleEnd = () => {
    navigate("/summary", { state: { chat } });
  };

  return (
    <div className="min-h-screen bg-[#EBD3F8] flex flex-col items-center py-6 px-4">
      <h1 className="text-2xl font-bold text-[#4A0072] mb-6">
        AI Mock Interview
      </h1>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex-1 p-6 space-y-5 bg-[#FDFBFF] overflow-y-auto max-h-[60vh]">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "system" ? (
                <div className="flex items-start gap-2 max-w-lg">
                  <Bot className="w-6 h-6 text-[#7A1CAC] mt-1" />
                  <div className="bg-[#F3E8FF] p-3 rounded-xl shadow-md whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 max-w-lg">
                  <div className="bg-[#DCFCE7] p-3 rounded-xl shadow-md">
                    {msg.text}
                  </div>
                  <User className="w-6 h-6 text-green-600 mt-1" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 flex items-center gap-3 border-t bg-gray-50">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your answer..."
            className="flex-1 border p-3 rounded-xl"
          />
          <button
            onClick={handleMic}
            className={`p-3 rounded-xl ${
              recording ? "bg-red-600" : "bg-[#7A1CAC]"
            } text-white`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            className="p-3 bg-[#4A0072] text-white rounded-xl"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            onClick={handleEnd}
            className="p-3 bg-red-600 text-white rounded-xl"
          >
            End
          </button>
        </div>
      </div>
    </div>
  );
}
