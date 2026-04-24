import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Fetch all sessions of a user
 */
export const getUserSessions = async (userId) => {
  const q = query(
    collection(db, "sessions"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * SINGLE SESSION ANALYSIS
 */
export const analyzeSession = (questions = []) => {
  let totalScore = 0;

  const skillMap = {};

  questions.forEach((q) => {
    totalScore += q.score || 0;

    const skill = q.skill || "Unknown";

    if (!skillMap[skill]) {
      skillMap[skill] = { total: 0, count: 0 };
    }

    skillMap[skill].total += q.score || 0;
    skillMap[skill].count += 1;
  });

  const skillWise = Object.keys(skillMap).map((skill) => ({
    skill,
    avg: skillMap[skill].total / skillMap[skill].count,
  }));

  return {
    avgScore: questions.length ? totalScore / questions.length : 0,
    skillWise,
  };
};

/**
 * MULTI SESSION SKILL BREAKDOWN (GLOBAL ANALYTICS)
 */
export const getSkillBreakdown = (sessions) => {
  const skillMap = {};

  sessions.forEach((session) => {
    (session.questions || []).forEach((q) => {
      const skill = q.skill || "Unknown";

      if (!skillMap[skill]) {
        skillMap[skill] = { total: 0, count: 0 };
      }

      skillMap[skill].total += q.score || 0;
      skillMap[skill].count += 1;
    });
  });

  return Object.keys(skillMap).map((skill) => ({
    skill,
    avg: skillMap[skill].total / skillMap[skill].count,
  }));
};