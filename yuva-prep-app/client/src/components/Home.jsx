import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Mic, BarChart3, Zap, BrainCircuit, BadgeCheck, CalendarClock, ChevronDown, ChevronUp } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const toggleAccordion = (index) => setOpenIndex(openIndex === index ? null : index);

  const handleStartSession = () => {
    if (!user) {
      navigate("/login"); // redirect if not logged in
    } else {
      navigate("/form"); // start session
    }
  };

  const features = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-[#AD49E1]" />,
      title: "AI-Driven Feedback",
      content: "Get instant and intelligent feedback on your mock interviews, improving your responses in real-time.",
    },
    {
      icon: <BadgeCheck className="h-6 w-6 text-[#AD49E1]" />,
      title: "Industry Expert Panel",
      content: "Be evaluated by interviewers from top companies like Google, Microsoft, and Amazon.",
    },
    {
      icon: <CalendarClock className="h-6 w-6 text-[#AD49E1]" />,
      title: "Flexible Scheduling",
      content: "Book interview slots based on your availability and convenience.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E073F] to-[#AD49E1] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-[#2E073F] shadow-md">
        <div className="flex-1 text-center">
          <Link to="/" className="text-3xl font-bold text-white">YuvaPrep</Link>
        </div>
        <div className="absolute right-8 flex items-center space-x-6 text-lg text-[#EBD3F8]">
          <ScrollLink to="about" smooth duration={800} offset={-80} className="hover:text-white cursor-pointer text-xl font-medium">About</ScrollLink>

          {user ? (
            <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#7A1CAC] text-white hover:bg-[#9A4DFF] transition">
              <span>Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#AD49E1] text-white hover:bg-[#D68FFF] transition">
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center h-[90vh] px-4">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/banner3.jpg')" }} />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4 text-white">Ace Your Next Interview</h1>
          <p className="text-lg text-[#EBD3F8] mb-6">Practice with real experts, get AI-driven feedback, and boost your confidence.</p>

          <button
            onClick={handleStartSession}
            className="bg-[#7A1CAC] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            {user ? "Start Mock Interview" : "Login to Start"}
          </button>
        </div>
      </section>

      {/* Product Highlights Section */}
      <section className="py-16 px-4 bg-white text-black text-center">
        <h2 className="text-3xl font-bold mb-10">Your Interview Prep Hub</h2>
        <div className="grid md:grid-cols-3 gap-8">

          {/* Start Interview Session Card */}
          <div
            onClick={handleStartSession}
            className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          >
            <div className="flex justify-center mb-4">
              <Mic className="h-12 w-12 text-[#7A1CAC]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Interview Practice</h3>
            <p className="mb-4">Generate questions based on your role, experience & resume.</p>
            <button className="bg-[#7A1CAC] text-white px-4 py-2 rounded hover:opacity-90 transition">
              {user ? "Start Session" : "Login to Start"}
            </button>
          </div>

          {/* Previous Sessions */}
          <div className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-[#7A1CAC]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">View Previous Sessions</h3>
            <p className="mb-4">Review your past practice interviews and track progress.</p>
            <button onClick={() => navigate("/sessions")} className="bg-[#7A1CAC] text-white px-4 py-2 rounded hover:opacity-90 transition">View Sessions</button>
          </div>

          {/* Daily Challenge */}
          <div className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-[#7A1CAC]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Daily Challenge</h3>
            <p className="mb-4">Answer a random interview question every day & stay sharp.</p>
            <button onClick={() => navigate("/daily-challenge")} className="bg-[#7A1CAC] text-white px-4 py-2 rounded hover:opacity-90 transition">Try Now</button>
          </div>
        </div>
      </section>

      {/* Features Accordion */}
      <section className="py-16 px-6 bg-[#F5EBF7] text-black">
        <h2 className="text-3xl font-bold mb-8 text-center">Key Features</h2>
        <div className="max-w-3xl mx-auto">
          {features.map((item, index) => (
            <div key={index} className="mb-4 bg-white border border-gray-200 rounded-lg shadow">
              <button onClick={() => toggleAccordion(index)} className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium text-[#2E073F]">
                <div className="flex items-center space-x-3">{item.icon}<span>{item.title}</span></div>
                {openIndex === index ? <ChevronUp /> : <ChevronDown />}
              </button>
              {openIndex === index && <div className="px-6 pb-4 text-sm text-gray-600">{item.content}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 px-6 bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#2E073F]">About YuvaPrep</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            YuvaPrep is dedicated to helping students and professionals prepare for the most competitive
            technical interviews. Through our <span className="font-semibold text-[#7A1CAC]">expert-led mock interviews</span>,
            <span className="font-semibold text-[#7A1CAC]"> AI-powered feedback system</span>,
            and <span className="font-semibold text-[#7A1CAC]">professional resume reviews</span>,
            we bridge the gap between preparation and success.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2E073F] py-8 text-center text-[#EBD3F8]">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Linkedin</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} YuvaPrep. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
