import React from "react";
import { useLocation } from "react-router-dom";
import { analyzeSession } from "../firebase/sessionAnalytics";

export default function Summary() {
  const { state } = useLocation();

  // data coming from InterviewPage
  const sessionScores = state?.sessionScores || [];

  const analysis = analyzeSession(sessionScores);

  if (!sessionScores.length) {
    return (
      <div className="text-white p-6">
        No interview data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0718] text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        AI Interview Summary
      </h1>

      {/* OVERALL SCORE */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <h2 className="text-lg">Overall Score</h2>
        <p className="text-2xl mt-2">
          {analysis.avgScore.toFixed(2)} / 10
        </p>
      </div>

      {/* SKILL BREAKDOWN */}
      <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10">
        <h2 className="text-lg mb-3">Skill Breakdown</h2>

        {analysis.skillWise.map((s, i) => (
          <div key={i} className="flex justify-between py-2 border-b border-white/10">
            <span>{s.skill}</span>
            <span>{s.avg.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* QUESTION DETAILS */}
      <div className="mt-6">
        <h2 className="text-lg mb-3">Question Performance</h2>

        {sessionScores.map((q, i) => (
          <div key={i} className="bg-white/5 p-3 rounded-lg mb-3">
            <p className="font-semibold">{q.question}</p>
            <p>Score: {q.score}/10</p>
            <p className="text-sm text-white/60">{q.feedback}</p>
          </div>
        ))}
      </div>

    </div>
  );
}