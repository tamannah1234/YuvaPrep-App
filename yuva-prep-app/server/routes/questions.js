import express from "express";
import db from "../db.js"; // MySQL pool

const router = express.Router();

// POST /api/questions
router.post("/", async (req, res) => {
  try {
    let { role, experience, job_description } = req.body;

    if (!role || experience == null) {
      return res.status(400).json({ message: "Role and experience required" });
    }

    experience = Number(experience); // ensure numeric

    // Fetch questions matching role & experience
    let [rows] = await db.execute(
      `SELECT question_id, question_text, job_description_keywords
       FROM questions
       WHERE role = ?
         AND (? BETWEEN min_experience AND max_experience)
       LIMIT 20`,
      [role, experience]
    );

    // If no rows, fallback to generic questions for that role
    if (rows.length === 0) {
      [rows] = await db.execute(
        `SELECT question_id, question_text FROM questions WHERE role = ? LIMIT 10`,
        [role]
      );
    }

    let questions = rows.map(q => q.question_text);

    // Optional: filter by job description keywords
    if (job_description && job_description.trim().length > 0) {
      const inputKeywords = job_description.match(/\w+/g)?.map(k => k.toLowerCase()) || [];
      if (inputKeywords.length > 0) {
        questions = questions.filter(q => {
          // check if any keyword appears in question text
          return inputKeywords.some(kw => q.toLowerCase().includes(kw));
        });
      }
    }

    // Fallback if filtering removed all questions
    if (questions.length === 0) {
      questions = rows.map(q => q.question_text);
    }

    res.json({ questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: "Server error fetching questions" });
  }
});

export default router;
