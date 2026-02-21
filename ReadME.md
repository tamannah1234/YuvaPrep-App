# 🚀 YuvaPrep-App

**YuvaPrep** is an AI-powered interview preparation platform that helps learners practice, evaluate, and improve their interview responses. The platform uses NLP and transformer-based models to generate interview questions, evaluate answers, provide explainable feedback, and track performance over time — all on a **0–10 scoring scale**.

---

## 📌 Key Features

- 🔹 Role-based interview question generation  
- 🔹 AI-driven answer evaluation  
- 🔹 Scoring on a 0–10 scale based on semantic similarity, keyword coverage, and sentiment  
- 🔹 Personalized feedback using summarization models  
- 🔹 Session-level performance analysis  
- 🔹 Audio transcription & speech metrics  
- 🔹 Modular, scalable microservices architecture  

---

## 🧠 Technical Overview

The project is divided into three main components:


YUVA-PREP
│

├── client/ # React Frontend

├── server/ # Node.js Backend

├── evaluation/ # Python AI / ML Service

└── ml_service/ # FastAPI, NLP models & scoring logic


---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Firebase Auth |
| Backend | Node.js, Express, MySQL |
| ML Service | Python, FastAPI, HuggingFace, SentenceTransformers |
| Authentication | Firebase (Google OAuth) |
| Deployment | Vercel, Render / Railway / AWS |

---

## 🧠 Model & Evaluation Logic

### **1. Question Generation (FastAPI)**
- Based on transformer model `flan-t5-small`
- Generates role-based interview questions
- Uses MySQL fixed dataset with fallback model generation

### **2. Answer Evaluation Scoring**
Hybrid model using:

| Metric | Purpose | Weight |
|--------|---------|--------|
| Semantic Similarity | Meaning overlap with reference answer | 60% |
| Keyword Coverage | Role-specific word match count | 25% |
| Sentiment Confidence | Confidence of answer tone | 15% |

Final score converted to **0–10 scale**:

```python
final_score = round(weighted_score * 10, 2)
3. Feedback Generation

Uses summarization models to produce:

Strengths

Weaknesses

Suggested improvements

📦 How It All Works
👇 Request Flow

1️⃣ Frontend (React)
User selects a role and answers questions.

2️⃣ Backend (Node.js)
Handles APIs, user sessions, DB storage, and forwards evaluation requests to ML service.

3️⃣ ML Service (Python FastAPI)
Performs:

Question generation

Answer evaluation

Scoring

Audio transcription

Session feedback summarization

📄 API Endpoints (ML Service)
🔹 Health Check
GET /health
🔹 Generate Questions
POST /questions

Request

{
  "role": "java",
  "count": 5
}
🔹 Evaluate Answer
POST /evaluate

Request

{
  "role": "java",
  "question": "Explain OOP concepts",
  "answer": "OOP stands for object oriented programming..."
}
🔹 Session Feedback
POST /session/feedback

Aggregates session responses and returns motivational summary.

🔍 Audio Evaluation

Uses whisper for audio → text transcription.

Returns:

Transcribed text

Duration

Words per minute

Filler word count

🔐 Authentication

Firebase Authentication

Google OAuth

Token based auth

Secure protected routes

📊 Database Design

MySQL used to store:

Users

Interview sessions

Questions

Answers

Score metrics

Performance history

🧪 Local Setup
1️⃣ Frontend
cd client
npm install
npm run dev
2️⃣ Backend
cd server
npm install
npm start
3️⃣ ML Service
cd evaluation/ml_service
pip install -r requirements.txt
uvicorn app.main:app --reload
⚙️ Environment Setup

Create .env files in relevant folders:

Backend .env
PORT=5000
DB_HOST=...
DB_USER=...
DB_PASS=...
DB_NAME=...
JWT_SECRET=...
ML Service .env
GROQ_API_KEY=your_api_key_here
🚀 Future Enhancements

Coding evaluation module

System design interview module

Adaptive difficulty levels

Real-time interview simulator

Tech stack mapper based on job trends

📁 Folder Structure
YUVA-PREP/
├── client/                # React App
├── server/                # Node.js API
├── evaluation/
│   └── ml_service/        # Python AI/ML Microservice
├── .gitignore
├── README.md
📌 Why This Project Matters

This platform bridges the gap between interview preparation and AI-based evaluation. With its modular design and modern tech stack, YuvaPrep is:

Scalable

Explainable

Research-ready

Production-ready

❤️ Contributors & License

Built by tamannah1234
Open-source and community-driven.