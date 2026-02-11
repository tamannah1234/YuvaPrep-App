import express from "express";
import multer from "multer";
import path from "path";
import db from "../db.js"; // mysql2 connection pool

const router = express.Router();

// Multer config → saves files in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where resumes go
  },
  filename: (req, file, cb) => {
    // unique filename: timestamp + original name
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Save candidate
router.post("/candidates", upload.single("resume"), async (req, res) => {
  try {
    const {
      user_id,
      desired_role,
      experience_years,
      experience_level,
      job_description,
    } = req.body;

    const resumePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO candidates 
        (user_id, desired_role, experience_years, experience_level, job_description, resume_path) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        desired_role,
        experience_years,
        experience_level,
        job_description,
        resumePath,
      ]
    );

    const [rows] = await db.query(
      "SELECT * FROM candidates WHERE candidate_id = ?",
      [result.insertId]
    );

    res.json({ success: true, candidate: rows[0] });
  } catch (err) {
    console.error("Candidate insert error:", err);
    res.status(500).json({ error: "Failed to save candidate" });
  }
});

export default router;
