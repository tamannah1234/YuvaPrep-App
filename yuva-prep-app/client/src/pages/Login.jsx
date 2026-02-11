import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, User } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
        name,
        email,
      });

      toast.success(res.data.message);
      navigate("/verify", { state: { email, name } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2E073F] px-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20 w-full max-w-md transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-bold text-center text-[#EBD3F8] mb-6">
          Welcome to YuvaPrep 👋
        </h2>

        {/* Name Input */}
        <div className="mb-4">
          <label className="text-white text-sm mb-2 flex items-center gap-2">
            <User size={18} /> Enter your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#AD49E1] transition-all duration-300"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="text-white text-sm mb-2 flex items-center gap-2">
            <Mail size={18} /> Enter your email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#AD49E1] transition-all duration-300"
          />
        </div>

        {/* Send OTP Button */}
        <button
          onClick={handleSendOtp}
          disabled={loading || !name || !email}
          className={`w-full mt-4 py-3 rounded-lg font-semibold transition duration-300
            ${loading || !name || !email ? "bg-[#AD49E1]/50 cursor-not-allowed" : "bg-[#AD49E1] hover:bg-[#7A1CAC] text-white"}`}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default Login;
