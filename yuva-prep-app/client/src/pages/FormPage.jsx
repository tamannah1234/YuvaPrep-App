import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { saveCandidate } from "../firebase/candidateService";

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
      // ONLY LOGIC CHANGE (NO UI CHANGE)
      const candidateData = {
        user_id: user.user_id,
        desired_role: formData.desired_role,
        experience_years: Number(formData.experience_years),
        experience_level: formData.experience_level,
        job_description: formData.job_description,
      };

      // Firebase save (NO BACKEND)
      await saveCandidate(candidateData);

      toast.success("Candidate info saved!", { autoClose: 1000 });

      // IMPORTANT: send clean data (no API dependency)
      navigate("/interview", {
        state: {
          userData: candidateData,
        },
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to save candidate info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0718] text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(173,73,225,0.18),transparent)] pointer-events-none" />

      <div className="absolute w-[500px] h-[500px] bg-[#AD49E1]/20 blur-[120px] rounded-full top-1/4 left-1/2 -translate-x-1/2" />

      {/* FORM CARD (UNCHANGED) */}
      <div className="relative w-full max-w-lg">

        <div className="bg-[#0a0112]/80 backdrop-blur-2xl border border-[#AD49E1]/20 rounded-3xl p-8 shadow-[0_10px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_0_80px_rgba(173,73,225,0.25)] transition-all duration-500">

          <h2 className="text-3xl font-medium text-center mb-1 tracking-tight">
            Candidate <span className="text-[#AD49E1]">Profile</span>
          </h2>

          <p className="text-center text-white/50 text-sm mb-8">
            Start your personalized interview session
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="flex flex-col gap-2 group">
              <label className="text-xs text-white/40 group-focus-within:text-[#AD49E1] transition">
                Desired Role
              </label>
              <select
                name="desired_role"
                value={formData.desired_role}
                onChange={handleChange}
                className="bg-white/5 border border-white/10 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/40 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 hover:border-white/20"
                required
              >
                <option className="text-black">Select Role</option>
                <option style={{ color: "black" }}>Full Stack Developer </option>
                <option style={{ color: "black" }}>Frontend Developer </option>
                <option style={{ color: "black" }}>Backend Developer </option>
                <option style={{ color: "black" }}>Data Scientist</option>
                <option style={{ color: "black" }}>DevOps Engineer </option>
              </select>
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs text-white/40 group-focus-within:text-[#AD49E1] transition">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                className="bg-white/5 border border-white/10 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/40 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 hover:border-white/20"
                required
              />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs text-white/40 group-focus-within:text-[#AD49E1] transition">
                Experience Level
              </label>

              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="bg-white/5 text-white border border-white/10 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/40 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 hover:border-white/20"
              >
                <option value="fresher" style={{ color: "black" }}>Fresher</option>
                <option value="junior" style={{ color: "black" }}>Junior</option>
                <option value="mid" style={{ color: "black" }}>Mid</option>
                <option value="senior" style={{ color: "black" }}>Senior</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs text-white/40 group-focus-within:text-[#AD49E1] transition">
                Skills / Description
              </label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                rows="4"
                className="bg-white/5 border border-white/10 focus:border-[#AD49E1] focus:ring-2 focus:ring-[#AD49E1]/40 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 resize-none hover:border-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                loading
                  ? "bg-gray-500"
                  : "bg-gradient-to-r from-[#7A1CAC] to-[#AD49E1] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#AD49E1]/30"
              }`}
            >
              {loading ? "Processing..." : "Start Interview"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default FormPage;