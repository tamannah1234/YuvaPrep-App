import React, { useState, useEffect } from "react";
import axios from "axios";

// Sidebar items
const sidebarItems = [
  { id: "sessions", label: "Previous Sessions" },
  { id: "active", label: "Performance Metrics" },
  { id: "challenges", label: "Daily Challenges" },
  { id: "suggestions", label: "Suggestions" },
];

export default function Dashboard({ candidateId }) {
  const [selected, setSelected] = useState("sessions");
  const [sessionsData, setSessionsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId) return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/metrics/dashboard/${candidateId}`
        );
        const data = response.data.sessions || [];

        // Fill default values for metrics if null
        const processedData = data.map((s) => ({
          ...s,
          semantic_score: s.semantic_score ?? 0,
          keyword_coverage: s.keyword_coverage ?? 0,
          fillers: s.fillers ?? 0,
          wpm: s.wpm ?? 0,
          feedback: s.feedback ?? "No feedback yet",
          suggestions: s.suggestions ?? "No suggestions yet",
        }));

        setSessionsData(processedData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [candidateId]);

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#EBD3F8] to-[#F5E0FF]">
      {/* Left Sidebar */}
      <div className="w-1/4 bg-gradient-to-b from-[#7A1CAC] to-[#4A0072] text-white flex flex-col p-6 space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 tracking-wide">Dashboard</h2>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`text-left px-4 py-3 rounded-lg transition-colors font-medium text-lg ${
              selected === item.id
                ? "bg-white text-[#7A1CAC] shadow-lg"
                : "hover:bg-[#AD49E180]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-[#4A0072] mb-6">
          {sidebarItems.find((item) => item.id === selected)?.label}
        </h2>

        <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[70vh] border border-[#E6D6F1]">
          {loading && <p>Loading data...</p>}

          {/* Previous Sessions */}
          {selected === "sessions" && !loading && (
            <div>
              {sessionsData.length > 0 ? (
                <ul className="space-y-4">
                  {sessionsData.map((s) => (
                    <li
                      key={s.session_id}
                      className="p-4 border rounded-lg shadow-sm"
                    >
                      <p>
                        <strong>Start Time:</strong> {s.start_time}
                      </p>
                      <p>
                        <strong>End Time:</strong> {s.end_time}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No previous sessions available.</p>
              )}
            </div>
          )}

          {/* Performance Metrics */}
          {selected === "active" && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sessionsData.length > 0 ? (
                sessionsData.map((s) => (
                  <div
                    key={s.session_id}
                    className="bg-gradient-to-r from-[#AD49E1] to-[#7A1CAC] text-white p-4 rounded-xl shadow-md"
                  >
                    <h4 className="font-semibold text-lg mb-2">
                      Session {s.session_id}
                    </h4>
                    <p>
                      <strong>Semantic Score:</strong> {s.semantic_score}%
                    </p>
                    <p>
                      <strong>Keyword Coverage:</strong> {s.keyword_coverage}%
                    </p>
                    <p>
                      <strong>WPM:</strong> {s.wpm}
                    </p>
                    <p>
                      <strong>Fillers:</strong> {s.fillers}
                    </p>
                    <p>
                      <strong>Feedback:</strong> {s.feedback}
                    </p>
                    <p>
                      <strong>Suggestions:</strong> {s.suggestions}
                    </p>
                  </div>
                ))
              ) : (
                <p>No performance metrics available.</p>
              )}
            </div>
          )}

          {/* Daily Challenges */}
          {selected === "challenges" && (
            <div className="text-[#4A0072] text-lg">
              Daily challenges to improve your skills: coding, reasoning, and communication.
            </div>
          )}

          {/* Suggestions */}
          {selected === "suggestions" && (
            <div className="text-[#4A0072] text-lg">
              Personalized suggestions based on your performance and areas of improvement.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
