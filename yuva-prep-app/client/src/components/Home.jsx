import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

import {
  Mic,
  BarChart3,
  Zap,
  BrainCircuit,
  BadgeCheck,
  CalendarClock,
  FileText,
  TrendingUp,
} from "lucide-react";

/* ---------------- Stats ---------------- */

const stats = [
  { num: "12,000+", label: "mock interviews completed" },
  { num: "94%", label: "users felt more confident" },
  { num: "500+", label: "expert interviewers" },
  { num: "50+", label: "companies represented" },
];

/* ---------------- Features ---------------- */

const features = [
  {
    num: "01",
    icon: <BrainCircuit className="h-5 w-5 text-[#AD49E1]" />,
    title: "AI-driven feedback",
    content:
      "Get instant, intelligent analysis of your responses — covering clarity, technical depth, and communication style.",
  },
  {
    num: "02",
    icon: <BadgeCheck className="h-5 w-5 text-[#AD49E1]" />,
    title: "Industry expert panel",
    content:
      "Be evaluated by experienced interviewers from top companies like Google, Microsoft, and Amazon.",
  },
  {
    num: "03",
    icon: <FileText className="h-5 w-5 text-[#AD49E1]" />,
    title: "Resume-aware questions",
    content:
      "Upload your resume and our AI crafts interview questions specifically relevant to your background.",
  },
  {
    num: "04",
    icon: <CalendarClock className="h-5 w-5 text-[#AD49E1]" />,
    title: "Flexible scheduling",
    content:
      "Book live mock interview slots around your calendar, or practice with the AI anytime, 24/7.",
  },
];

/* ---------------- Testimonials ---------------- */

const testimonials = [
  {
    initials: "RK",
    name: "Rahul K.",
    role: "SDE-1, Bengaluru",
    stars: 5,
    text:
      "YuvaPrep's AI feedback helped me understand exactly where I was losing points. Landed my first SDE role.",
  },
  {
    initials: "PS",
    name: "Priya S.",
    role: "Product Manager, Pune",
    stars: 5,
    text:
      "The expert panel interviews felt just like the real thing.",
  },
  {
    initials: "AM",
    name: "Aryan M.",
    role: "Data Analyst, Mumbai",
    stars: 4,
    text:
      "Daily challenges kept me in practice mode.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleStartSession = () => {
    navigate(user ? "/form" : "/login");
  };

  return (
    <div className="min-h-screen bg-[#0f0718] text-white font-sans">

      {/* ---------------- Navbar ---------------- */}

      <nav className="sticky top-0 z-20 flex items-center justify-between px-10 py-4 bg-[#0a010f]/90 backdrop-blur border-b border-[#AD49E1]/20">
        <Link to="/" className="text-2xl font-medium tracking-tight">
          Yuva<span className="text-[#AD49E1]">Prep</span>
        </Link>

        <div className="flex items-center gap-8 text-sm text-white/60">
          <ScrollLink to="about" smooth duration={800} offset={-80} className="hover:text-white cursor-pointer transition">
            About
          </ScrollLink>

          <ScrollLink to="features" smooth duration={800} offset={-80} className="hover:text-white cursor-pointer transition">
            Features
          </ScrollLink>

          <button
            onClick={() => navigate("/sessions")}
            className="hover:text-white transition"
          >
            Sessions
          </button>

          {user ? (
            <Link
              to="/profile"
              className="px-4 py-2 rounded-lg bg-[#7A1CAC] text-white hover:bg-[#9A4DFF] transition text-sm"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-[#7A1CAC] text-white hover:bg-[#9A4DFF] transition text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* ---------------- Hero ---------------- */}

      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-28 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,rgba(173,73,225,0.18),transparent)] pointer-events-none" />

        <h1 className="text-5xl md:text-6xl font-medium leading-[1.08] tracking-tight mb-5">
          Ace your next <br />
          <span className="text-[#AD49E1]">technical interview</span>
        </h1>

        <p className="text-white/55 text-lg max-w-md mb-10">
          Practice with real experts, get AI-driven feedback
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartSession}
            className="bg-[#7A1CAC] text-white px-7 py-3.5 rounded-xl text-sm hover:bg-[#9A4DFF] transition"
          >
            {user ? "Start mock interview" : "Get started free"}
          </button>

          <button
            onClick={() => navigate("/sessions")}
            className="border border-white/20 text-white/70 px-6 py-3.5 rounded-xl text-sm hover:bg-white/5 transition"
          >
            View past sessions
          </button>
        </div>
      </section>

      {/* ---------------- Stats ---------------- */}

      <div className="border-y border-[#AD49E1]/20 grid grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="py-6 text-center">
            <div className="text-2xl text-[#D68FFF]">{s.num}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ---------------- Cards ---------------- */}

      <section className="py-20 px-10 bg-[#f8f5fc] text-[#1a0828]">

        <div className="grid md:grid-cols-3 gap-5">

          {/* Start Interview */}

          <Card
            icon={<Mic />}
            title="Start interview practice"
            desc="Generate tailored questions"
            onClick={handleStartSession}
          />

          <Card
            icon={<BarChart3 />}
            title="View previous sessions"
            desc="Review transcripts"
            onClick={() => navigate("/sessions")}
          />

          <Card
            icon={<Zap />}
            title="Daily challenge"
            desc="Practice daily"
            onClick={() => navigate("/daily-challenge")}
          />

        </div>

      </section>

    </div>
  );
};

/* ---------------- Card Component ---------------- */

const Card = ({ icon, title, desc, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-7 border border-[#e8dff4] cursor-pointer hover:border-[#AD49E1]/50 transition flex flex-col gap-3"
    >
      <div className="w-11 h-11 rounded-xl bg-[#f3e8fc] flex items-center justify-center">
        {icon}
      </div>

      <h3 className="text-base font-medium">
        {title}
      </h3>

      <p className="text-sm text-[#7a6890]">
        {desc}
      </p>

      <button className="bg-[#7A1CAC] text-white px-4 py-2 rounded-lg">
        Start
      </button>

    </div>
  );
};

export default Home;