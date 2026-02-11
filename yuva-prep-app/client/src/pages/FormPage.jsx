// src/pages/FormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function FormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    desired_role: "",
    experience_years: "",
    experience_level: "fresher",
    job_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return navigate("/login");
    setUser(storedUser);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/candidates", {
        user_id: user.user_id,
        ...formData,
      });

      toast.success("Candidate info saved!", { autoClose: 1000 });
      const candidate = res.data.candidate;
      navigate("/interview", { state: { userData: candidate } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save candidate info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#EBD3F8] p-6 animate-fadeIn">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg transform transition-transform duration-500 hover:scale-105">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#2E073F]">Candidate Information</h2>
        <form onSubmit={handleSubmit} className="space-y-5">

          <select
            name="desired_role"
            value={formData.desired_role}
            onChange={handleChange}
            className="w-full border-2 border-[#7A1CAC] focus:border-[#EBD3F8] focus:ring-2 focus:ring-[#7A1CAC] rounded-lg px-4 py-2 transition-all duration-300 shadow-sm"
            required
          >
            <option value="">Select Desired Role</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="Machine Learning Engineer">Machine Learning Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Business Analyst">Business Analyst</option>
            <option value="Cloud Engineer">Cloud Engineer</option>
            <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Software Engineer">Software Engineer</option>
          </select>


          <input
            type="number"
            name="experience_years"
            placeholder="Experience (Years)"
            value={formData.experience_years}
            onChange={handleChange}
            min="0"
            className="w-full border-2 border-[#7A1CAC] focus:border-[#EBD3F8] focus:ring-2 focus:ring-[#7A1CAC] rounded-lg px-4 py-2 transition-all duration-300 shadow-sm"
            required
          />

          <select
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="w-full border-2 border-[#7A1CAC] focus:border-[#EBD3F8] focus:ring-2 focus:ring-[#7A1CAC] rounded-lg px-4 py-2 transition-all duration-300 shadow-sm"
          >
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>

          <textarea
            name="job_description"
            placeholder="Job Description / Skills"
            value={formData.job_description}
            onChange={handleChange}
            rows="4"
            className="w-full border-2 border-[#7A1CAC] focus:border-[#EBD3F8] focus:ring-2 focus:ring-[#7A1CAC] rounded-lg px-4 py-2 transition-all duration-300 shadow-sm resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 transform ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#7A1CAC] hover:bg-[#5C128C] hover:scale-105"
              }`}
          >
            {loading ? "Processing..." : "Start Interview"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormPage;
