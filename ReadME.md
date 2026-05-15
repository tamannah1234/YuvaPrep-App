# YuvaPrep – AI-Powered Interview Preparation Platform

YuvaPrep is an AI-powered interview preparation platform designed to help students and job seekers improve their interview skills through intelligent evaluation and personalized feedback.

The platform enables users to generate role-specific interview questions, submit text or audio responses, and receive AI-generated scores with detailed feedback using Natural Language Processing and transformer-based machine learning models.

---

# Project Overview

YuvaPrep provides an end-to-end interview preparation experience by combining full-stack web technologies with Artificial Intelligence and NLP-based evaluation systems.

Users can:

- Generate interview questions based on job roles
- Submit responses through text or audio
- Receive AI-generated evaluation scores
- Analyze strengths and areas for improvement
- Track interview performance across sessions

The platform is designed using a scalable microservice architecture to support modular AI services and real-world deployment scenarios.

---

# Key Features

- Role-based interview question generation
- AI-driven answer evaluation and scoring
- Semantic similarity and keyword-based analysis
- Sentiment-aware response evaluation
- Audio interview support with speech transcription
- Session-wise performance tracking and analytics
- Secure authentication using Firebase Google Authentication
- Scalable microservice-based architecture
- AI-generated personalized feedback reports

---

# Tech Stack

| Layer | Technologies |
|------|---------------|
| Frontend | React.js, Tailwind CSS, Firebase Authentication |
| Backend | Node.js, Express.js |
| Database | MySQL |
| AI/ML Services | Python, FastAPI |
| NLP Models | HuggingFace Transformers, SentenceTransformers |
| Speech Processing | OpenAI Whisper |
| LLM Integration | GROQ API |

---

# System Architecture

```text
Frontend (React.js)
        ↓
Node.js Backend (Express API Layer)
        ↓
------------------------------------------------
|                                              |
Question Generation Service        Evaluation / ML Service
(FastAPI + NLP Models)             (FastAPI + ML Models)
------------------------------------------------
        ↓
      MySQL
```

---

# Project Structure

```bash
YuvaPrep-App/
│
├── client/                         # React Frontend
├── server/                         # Node.js Backend
│
├── QuestionGeneration/
│   └── backend/app/                # Question Generation Service
│
├── evaluation/
│   └── ml_service/                 # Evaluation & Speech Service
│
└── README.md
```

---

# Core Modules

## Frontend (`client/`)

Built using React.js and Tailwind CSS.

### Features

- User Authentication
- Candidate Dashboard
- Interview Session Interface
- AI Score and Feedback Visualization
- Responsive User Interface
- Protected Routes using Firebase Authentication

---

## Backend (`server/`)

The Node.js backend acts as the central API gateway.

### Responsibilities

- API Routing and Middleware Handling
- Firebase Token Verification
- MySQL Database Management
- Session and Evaluation Storage
- Integration with AI/ML Services

---

## Question Generation Service

**Location:** `QuestionGeneration/backend/app/`

Responsible for generating role-specific interview questions and lightweight evaluation tasks.

### Models Used

- google/flan-t5-small
- SentenceTransformers
- DistilBERT
- DistilBART

### Capabilities

- AI-based question generation
- Basic semantic analysis
- Feedback summarization

---

## Evaluation / ML Service

**Location:** `evaluation/ml_service/`

Responsible for advanced answer evaluation and speech analysis.

### Features

- Semantic similarity scoring
- Keyword coverage analysis
- Speech-to-text transcription
- AI-generated ideal answers
- Confidence-based scoring system

### Models Used

- SentenceTransformer("all-MiniLM-L6-v2")
- OpenAI Whisper
- GROQ LLM API

---

# AI Scoring Logic

Candidate responses are evaluated using a weighted hybrid scoring model.

| Metric | Description | Weight |
|--------|-------------|--------|
| Semantic Similarity | Measures conceptual alignment with ideal answer | 60% |
| Keyword Coverage | Evaluates important domain-specific terms | 25% |
| Sentiment Confidence | Measures clarity and confidence of response | 15% |

## Final Score Formula

```python
final = (
    0.6 * similarity +
    0.25 * coverage +
    0.15 * sentiment
)

final_score = round(final * 10, 2)
```

### Example

```python
0.78 → 7.8 / 10
```

The platform also generates AI-powered feedback summaries based on candidate responses, ideal answers, and evaluation metrics.

---

# API Endpoints

## Health Check

```http
GET /health
```

---

## Generate Questions

```http
POST /questions
```

### Request

```json
{
  "role": "java",
  "count": 5
}
```

---

## Evaluate Answer

```http
POST /evaluate
```

### Request

```json
{
  "role": "java",
  "question": "...",
  "answer": "..."
}
```

---

## Session Feedback

```http
POST /session/feedback
```

Returns overall session analysis and performance summary.

---

## ML Evaluation Service

```http
POST /metrics/evaluate
```

### Response Includes

- Ideal Answer
- Semantic Similarity Score
- Keyword Coverage
- Final Score (0–10)
- AI Feedback

---

## Audio Transcription

```http
POST /transcribe
```

### Returns

- Transcript
- Word Count
- Words Per Minute (WPM)
- Filler Word Detection

---

# Installation and Setup

## Prerequisites

- Node.js
- Python 3.9+
- MySQL
- npm / pip

---

## Clone Repository

```bash
git clone https://github.com/tamannah1234/YuvaPrep-App
cd YuvaPrep-App
```

---

## Configure Environment Variables

### Backend `.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=yuvaprep
JWT_SECRET=your_secret
```

### ML Services `.env`

```env
GROQ_API_KEY=your_api_key
```

---

## Run Frontend

```bash
cd client
npm install
npm run dev
```

---

## Run Backend

```bash
cd server
npm install
npm run dev
```

---

## Run Question Generation Service

```bash
cd QuestionGeneration/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Run Evaluation Service

```bash
cd evaluation/ml_service
pip install -r requirements.txt
uvicorn app:app --reload
```

---

# Learning Outcomes

Through this project, I gained practical experience in:

- AI-powered application development
- Natural Language Processing
- Transformer-based semantic analysis
- Speech processing and transcription
- Full-stack microservice architecture
- REST API development
- Authentication and database integration
- Scalable backend system design

---

# Future Enhancements

- Coding interview evaluator
- Real-time AI mock interviewer
- System design interview module
- AI-based career recommendation engine
- Multi-language interview support
- Market trend-based skill analysis

---

# Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request for improvements.

---

# License

This project is licensed under the MIT License.

---

# Author

Tamanna Singh

GitHub: https://github.com/tamannah1234/YuvaPrep-App
