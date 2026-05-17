from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import spacy
import re

router = APIRouter()

# Load spacy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None

# Skill taxonomy - core skills we detect
SKILLS = {
    "frontend": ["html", "css", "javascript", "typescript", "react", "nextjs", "vue", "angular", "tailwind", "bootstrap", "redux"],
    "backend": ["nodejs", "express", "python", "django", "fastapi", "flask", "java", "spring", "php", "rest api", "graphql"],
    "database": ["mongodb", "mysql", "postgresql", "redis", "firebase", "sqlite"],
    "devops": ["git", "docker", "linux", "aws", "github", "ci/cd"],
    "mobile": ["react native", "flutter", "android", "ios"],
    "fundamentals": ["dsa", "data structures", "algorithms", "oops", "system design"]
}

class ResumeText(BaseModel):
    text: str

def extract_skills(text: str):
    text_lower = text.lower()
    found_skills = []
    
    for category, skills in SKILLS.items():
        for skill in skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append({
                    "name": skill,
                    "category": category
                })
    
    return found_skills

@router.post("/parse")
async def parse_resume(data: ResumeText):
    try:
        if not data.text:
            raise HTTPException(status_code=400, detail="No text provided")
        
        skills = extract_skills(data.text)
        
        # Extract email
        email_match = re.search(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}', data.text)
        email = email_match.group() if email_match else None
        
        # Extract GitHub
        github_match = re.search(r'github\.com/[\w-]+', data.text, re.IGNORECASE)
        github = f"https://{github_match.group()}" if github_match else None
        
        return {
            "success": True,
            "data": {
                "skills": skills,
                "skillCount": len(skills),
                "email": email,
                "github": github,
                "wordCount": len(data.text.split())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))