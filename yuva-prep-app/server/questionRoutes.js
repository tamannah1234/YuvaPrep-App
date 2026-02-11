// questionRoutes.js
const express = require("express");
const router = express.Router();
const db = require("./db"); // your MySQL pool from db.js

// ------------------- Generate Questions Dynamically -------------------
router.post("/generate-questions", async (req, res) => {
  const { role, experience, jobDescription } = req.body;

  if (!role || !experience || !jobDescription) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exp = parseInt(experience, 10);

    // Split job description into keywords
    const keywords = jobDescription
      .split(/\s|,|\.|-/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    // Fetch questions matching role and experience
    const [rows] = await db.execute(
      `SELECT question_text, job_description_keywords
       FROM questions
       WHERE role LIKE ?
         AND min_experience <= ?
         AND max_experience >= ?`,
      [`%${role}%`, exp, exp]
    );

    // Filter by keywords
    const filteredQuestions = rows.filter((q) => {
      if (!q.job_description_keywords) return true;
      const qKeywords = q.job_description_keywords
        .split(",")
        .map((k) => k.trim().toLowerCase());
      return qKeywords.some((k) => keywords.includes(k));
    });

    res.json({
      questions: filteredQuestions.map((q) => q.question_text),
    });
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
