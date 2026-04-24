import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SessionPage from "./pages/SessionPage";

import FormPage from "./pages/FormPage";
import InterviewPage from "./pages/InterviewPage";
import Summary from "./pages/Summary";

function App() {
  return (

    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/sessions" element={<SessionPage />} />

      <Route path="/form" element={<FormPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/summary" element={<Summary />} />

    </Routes>

  );
}

export default App;