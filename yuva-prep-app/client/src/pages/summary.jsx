import React from "react";
import { useLocation } from "react-router-dom";
import { analyzeSession } from "../firebase/sessionAnalytics";

const COLOR = {
  bg: "#0f0718",
  bgDeep: "#0a010f",
  purple: "#AD49E1",
  purpleDark: "#7A1CAC",
  purpleLight: "#D68FFF",
  surface: "#1a0828",
  border: "rgba(173,73,225,0.22)",
  text: "#f0e8ff",
  muted: "rgba(240,232,255,0.45)",
};

function ScoreCard({ title, value }) {
  return (
    <div style={{
      background: COLOR.surface,
      border: `1px solid ${COLOR.border}`,
      borderRadius: 14,
      padding: "18px 20px"
    }}>
      <div style={{ fontSize: 11, color: COLOR.muted, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{
        fontSize: 26,
        fontWeight: 700,
        marginTop: 8,
        color: COLOR.purpleLight
      }}>
        {value}
      </div>
    </div>
  );
}

export default function Summary() {
  const { state } = useLocation();
  const sessionScores = state?.sessionScores || [];

  const analysis = analyzeSession(sessionScores);

  if (!sessionScores.length) {
    return (
      <div style={{
        minHeight: "100vh",
        background: COLOR.bg,
        color: COLOR.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        No interview data found.
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: COLOR.bg,
      color: COLOR.text,
      fontFamily: "'Sora', sans-serif",
      padding: "40px 24px"
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>
          AI Interview <span style={{ color: COLOR.purple }}>Summary</span>
        </div>
        <div style={{ fontSize: 13, color: COLOR.muted, marginTop: 6 }}>
          Performance breakdown & insights
        </div>
      </div>

      {/* SCORE CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 30
      }}>
        <ScoreCard
          title="Overall Score"
          value={`${analysis.avgScore.toFixed(2)} / 10`}
        />
        <ScoreCard
          title="Questions Attempted"
          value={sessionScores.length}
        />
        <ScoreCard
          title="Strong Areas"
          value={analysis.skillWise?.length || 0}
        />
      </div>

      {/* SKILL BREAKDOWN */}
      <div style={{
        background: COLOR.surface,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
          color: COLOR.purpleLight
        }}>
          Skill Breakdown
        </div>

        {analysis.skillWise.map((s, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i !== analysis.skillWise.length - 1
              ? `1px solid ${COLOR.border}`
              : "none"
          }}>
            <span>{s.skill}</span>
            <span style={{ color: COLOR.purpleLight, fontWeight: 600 }}>
              {s.avg.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* QUESTION DETAILS */}
      <div style={{
        background: COLOR.surface,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 16,
        padding: 20
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 16,
          color: COLOR.purpleLight
        }}>
          Question Analysis
        </div>

        {sessionScores.map((q, i) => (
          <div key={i} style={{
            padding: 14,
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${COLOR.border}`,
            marginBottom: 12
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Q{i + 1}: {q.question}
            </div>

            <div style={{ fontSize: 13, color: COLOR.muted }}>
              Score: <span style={{ color: COLOR.purpleLight }}>
                {q.score}/10
              </span>
            </div>

            <div style={{ fontSize: 12, marginTop: 6, color: COLOR.muted }}>
              {q.feedback}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}