from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="NextHire AI Service",
    description="AI-powered career readiness and skill gap analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nexthire-oliw.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "nexthire-ai", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routers
from routers import readiness, roadmap, resume

app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(readiness.router, prefix="/api/readiness", tags=["Readiness"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])