import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  getUserSessions,
  getSkillBreakdown
} from "../firebase/sessionAnalytics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function Dashboard() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const data = await getUserSessions(user.id);
      setSessions(data);

      const breakdown = getSkillBreakdown(data);
      setSkills(breakdown);
    };

    load();
  }, [user]);

  //  Format data for graph
  const progressData = sessions.map((s, i) => ({
    name: `Test ${i + 1}`,
    score: s.scoreAvg || 0
  }));

  return (
    <div className="min-h-screen bg-[#0f0718] text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        Career Analytics Dashboard
      </h1>

      {/* TOTAL INTERVIEWS */}
      <div className="bg-white/5 p-4 rounded-xl mb-6">
        <h2>Total Interviews</h2>
        <p className="text-xl">{sessions.length}</p>
      </div>

      {/* PROGRESS GRAPH */}
      <div className="bg-white/5 p-4 rounded-xl mb-6">
        <h2 className="mb-3">Performance Over Time</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#AD49E1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SKILL BREAKDOWN */}
      <div className="bg-white/5 p-4 rounded-xl">
        <h2 className="mb-3">Skill Performance</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={skills}>
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avg" fill="#AD49E1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}