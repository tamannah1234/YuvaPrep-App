import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./components/Home";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Profile from "./pages/Profile";

import FormPage from "./pages/FormPage";
import InterviewPage from "./pages/InterviewPage";
import SummaryPage from "./pages/SummaryPage";

function App() {
  const [userData, setUserData] = useState({});
  const [questions, setQuestions] = useState([]);
  const [chat, setChat] = useState([]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* App Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/profile" element={<Profile />} />

        {/* AI Mock Interview */}
        <Route
          path="/form"
          element={
            <FormPage
              setUserData={setUserData}
              setQuestions={setQuestions}
              setChat={setChat}
            />
          }

        />
        <Route
          path="/interview"
          element={
            <InterviewPage
              userData={userData}
              questions={questions}
              chat={chat}
              setChat={setChat}
            />
          }
        />
        <Route path="/summary" element={<SummaryPage chat={chat} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
