import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/login'); // if no email, redirect back
    }
  }, [location, navigate]);

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      toast.success(res.data.message || "OTP Verified!");

      // ✅ Store the whole user object (id, email, name)
      if (res.data.user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Redirect to home page
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[#2E073F] min-h-screen flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded shadow w-full max-w-sm border border-white/30 transition-transform duration-500 transform hover:scale-[1.02]">
        <h2 className="text-2xl font-bold text-center text-[#7A1CAC] mb-4">Verify OTP</h2>

        <p className="text-white text-center mb-4">OTP sent to: <strong>{email}</strong></p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full p-2 border rounded mb-4 bg-white/20 text-white placeholder-white/70 transition-all duration-300 focus:ring focus:ring-[#7A1CAC]"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerify}
          className="w-full bg-[#7A1CAC] text-white py-2 rounded mb-3 hover:bg-[#6a1999] transition-colors duration-300"
        >
          Verify
        </button>

        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="w-full text-sm text-white hover:underline hover:text-[#d3bdf0] transition"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
