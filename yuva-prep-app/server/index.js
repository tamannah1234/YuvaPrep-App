// ------------------- Required Packages -------------------
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import path from "path";

// Routes
import candidateRoutes from "./routes/candidate.js";
import questionsRouter from "./routes/questions.js"; // also convert this file to export default router

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------- Middleware -------------------
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------- Database Setup -------------------
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ------------------- OTP Store -------------------
const otpStore = {}; // { email: { otp, expiresAt, name } }
// ------------------- Mailer -------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});


// ------------------- Send OTP -------------------
app.post("/api/auth/send-otp", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and Email are required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000, name };

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code - YuvaPrep",
      html: `
        <div style="font-family: Arial; background:#EBD3F8; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            <div style="background:#2E073F; padding:15px; text-align:center;">
              <h1 style="color:#EBD3F8; margin:0;">YuvaPrep</h1>
            </div>
            <div style="padding:20px; color:#2E073F;">
              <h2 style="color:#7A1CAC;">Hello ${name},</h2>
              <p>Welcome to <strong>YuvaPrep</strong> 🎉</p>
              <p>Your OTP code is:</p>
              <div style="text-align:center; margin:20px 0;">
                <span style="display:inline-block; background:#AD49E1; color:white; font-size:24px; font-weight:bold; padding:12px 24px; border-radius:8px; letter-spacing:4px;">
                  ${otp}
                </span>
              </div>
              <p style="font-size:14px; color:#555;">This OTP is valid for 5 minutes.</p>
            </div>
            <div style="background:#7A1CAC; padding:10px; text-align:center; color:white; font-size:12px;">
              © ${new Date().getFullYear()} YuvaPrep. All rights reserved.
            </div>
          </div>
        </div>
      `,
    });

    console.log(`📧 OTP sent to ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ------------------- Verify OTP -------------------
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "No OTP found or OTP expired" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  try {
    await db.execute(
      `INSERT INTO users (name, email) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE name=?`,
      [record.name, email, record.name]
    );

    const [rows] = await db.execute(`SELECT user_id, name, email FROM users WHERE email=?`, [email]);
    const user = rows[0];

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    delete otpStore[email];

    console.log(`✅ OTP verified for ${email}, user_id=${user.user_id}`);
    res.json({ message: "OTP verified successfully", token, user });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ------------------- Signup (Password-based) -------------------
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name=?, password=?`,
      [name, email, hashedPassword, name, hashedPassword]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ------------------- Login (Password-based) -------------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email=?`, [email]);
    if (rows.length === 0) return res.status(400).json({ message: "User not found" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ------------------- Mount Candidate Routes -------------------
app.use("/api", candidateRoutes);

// ------------------- Start Candidate Session -------------------
app.post("/api/candidate/start", async (req, res) => {
  const { token, desired_role, experience_level, job_description } = req.body;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = payload.user_id;

    const [result] = await db.execute(
      `INSERT INTO candidates (user_id, desired_role, experience_level, job_description) VALUES (?, ?, ?, ?)`,
      [user_id, desired_role, experience_level, job_description]
    );

    res.json({ message: "Candidate session created", candidate_id: result.insertId });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Failed to create candidate session" });
  }
});

// ------------------- Interview Question Routes -------------------
app.use("/api/questions", questionsRouter);

// ------------------- Start Server -------------------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
