# NextHire AI

An AI-powered career platform that helps students find jobs they're actually ready for.

## What it does

- Aggregates jobs from LinkedIn, Indeed, Glassdoor, Remotive, Internshala and Wellfound
- Analyzes your profile against job descriptions and gives a readiness score
- Shows exactly which skills you have and which you're missing
- Generates a personalized learning roadmap to close skill gaps
- Upload resume or answer questions to build your profile

## Tech Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Node.js + Express + MongoDB
- **AI Service** — Python + FastAPI + Groq
- **Auth** — JWT + Firebase Google OAuth
- **Job Data** — JSearch API + Remotive API + Apify

## Setup

### Backend
```bash
cd backend && npm install && npm run dev
```

### AI Service
```bash
cd ai-service && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend && npm install && npm run dev
```

## Environment Variables

Create `.env` files in `backend/` and `ai-service/` — see `.env.example` for reference.

---

Built for students. Free forever.