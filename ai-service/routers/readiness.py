
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from groq import Groq
import os
import re

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ReadinessRequest(BaseModel):
    resumeText: str
    jobDescription: str
    jobTitle: str = ""

def extract_skills(text: str):
    SKILLS = [
        "html", "css", "javascript", "typescript", "react", "nextjs", "vue",
        "angular", "tailwind", "nodejs", "express", "python", "django", "fastapi",
        "mongodb", "mysql", "postgresql", "redis", "git", "docker", "aws",
        "dsa", "data structures", "algorithms", "rest api", "graphql", "redux",
        "react native", "flutter", "java", "spring", "php", "firebase"
    ]
    text_lower = text.lower()
    found = []
    for skill in SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

@router.post("/check")
async def check_readiness(data: ReadinessRequest):
    try:
        resume_skills = extract_skills(data.resumeText)
        jd_skills = extract_skills(data.jobDescription)

        matching = [s for s in jd_skills if s in resume_skills]
        missing = [s for s in jd_skills if s not in resume_skills]

        if len(jd_skills) == 0:
            score = 50
        else:
            score = round((len(matching) / len(jd_skills)) * 100)

        if score >= 70:
            verdict = "Ready to Apply"
            verdict_color = "green"
        elif score >= 45:
            verdict = "Almost Ready"
            verdict_color = "yellow"
        else:
            verdict = "Build First"
            verdict_color = "red"

        prompt = f"""You are a career advisor. Analyze this candidate's fit for a job.

Job Title: {data.jobTitle}
Readiness Score: {score}/100
Verdict: {verdict}
Matching Skills: {', '.join(matching) if matching else 'None'}
Missing Skills: {', '.join(missing) if missing else 'None'}

Give a 3-4 line honest, specific explanation of:
1. Why they got this score
2. What is holding them back (if anything)
3. What they should do next

Be direct and specific. No generic advice."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        explanation = response.choices[0].message.content

        return {
            "success": True,
            "data": {
                "score": score,
                "verdict": verdict,
                "verdictColor": verdict_color,
                "matchingSkills": matching,
                "missingSkills": missing,
                "explanation": explanation,
                "totalJdSkills": len(jd_skills),
                "totalResumeSkills": len(resume_skills)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


