import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AuthPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
  const [formData, setFormData] = useState({ name: "", email: "", otp: "" });
  const [loading, setLoading] = useState(false);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const sendOtp = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        name: formData.name,
        email: formData.email,
      });
      toast.success("OTP sent to email");
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    if (!formData.otp) {
      toast.error("Enter OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {step === 1 ? "Login / Signup" : "Enter OTP"}
        </h2>

        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter OTP"
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
