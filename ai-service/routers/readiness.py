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
        "react native", "flutter", "java", "spring", "php", "firebase",
        "dart", "kotlin", "swift", "ios", "android",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "keras",
        "machine learning", "deep learning", "nlp", "data science",
        "kubernetes", "linux", "ci/cd", "azure", "gcp",
        "sass", "webpack", "vite", "jest", "testing"
    ]
    text_lower = text.lower()
    found = []
    for skill in SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def infer_skills_from_title(title: str) -> list:
    title_lower = title.lower()
    if 'flutter' in title_lower:
        return ['flutter', 'dart', 'android', 'firebase']
    elif 'android' in title_lower or 'kotlin' in title_lower:
        return ['android', 'kotlin', 'java', 'firebase']
    elif 'ios' in title_lower or 'swift' in title_lower:
        return ['ios', 'swift', 'xcode', 'firebase']
    elif 'react native' in title_lower:
        return ['react native', 'javascript', 'react', 'firebase']
    elif 'react' in title_lower or 'frontend' in title_lower or 'front end' in title_lower:
        return ['react', 'javascript', 'html', 'css', 'typescript']
    elif 'node' in title_lower or 'backend' in title_lower or 'back end' in title_lower:
        return ['nodejs', 'express', 'mongodb', 'rest api', 'javascript']
    elif 'full stack' in title_lower or 'mern' in title_lower:
        return ['react', 'nodejs', 'mongodb', 'express', 'javascript']
    elif 'python' in title_lower or 'django' in title_lower:
        return ['python', 'django', 'rest api', 'sql', 'postgresql']
    elif 'data science' in title_lower or 'data analyst' in title_lower:
        return ['python', 'pandas', 'numpy', 'sql', 'machine learning', 'matplotlib']
    elif 'machine learning' in title_lower or ' ml ' in title_lower:
        return ['python', 'tensorflow', 'scikit-learn', 'pandas', 'numpy']
    elif 'ai' in title_lower and ('engineer' in title_lower or 'intern' in title_lower):
        return ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp']
    elif 'devops' in title_lower or 'cloud' in title_lower:
        return ['docker', 'linux', 'aws', 'git', 'kubernetes', 'ci/cd']
    elif 'java' in title_lower and 'javascript' not in title_lower:
        return ['java', 'spring', 'rest api', 'sql', 'maven']
    elif 'php' in title_lower or 'laravel' in title_lower:
        return ['php', 'laravel', 'mysql', 'rest api', 'javascript']
    elif 'vue' in title_lower or 'angular' in title_lower:
        return ['vue', 'javascript', 'html', 'css', 'typescript']
    else:
        return []

@router.post("/check")
async def check_readiness(data: ReadinessRequest):
    try:
        resume_skills = extract_skills(data.resumeText)

        # Combine title + description for better skill extraction
        combined_jd = f"{data.jobTitle} {data.jobDescription}"
        jd_skills = extract_skills(combined_jd)

        # If no skills found from description, infer from title
        if len(jd_skills) == 0:
            jd_skills = infer_skills_from_title(data.jobTitle)

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