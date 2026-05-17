from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from groq import Groq
import os

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class RoadmapRequest(BaseModel):
    targetRole: str
    missingSkills: List[str]
    currentSkills: List[str]
    timeframe: str = "3 months"

@router.post("/generate")
async def generate_roadmap(data: RoadmapRequest):
    try:
        prompt = f"""You are an expert career coach. Create a personalized learning roadmap.

Target Role: {data.targetRole}
Current Skills: {', '.join(data.currentSkills) if data.currentSkills else 'None'}
Missing Skills: {', '.join(data.missingSkills) if data.missingSkills else 'None'}
Timeframe: {data.timeframe}

Create a week-by-week roadmap with:
1. Specific skills to learn each week
2. One project to build per phase
3. Free resources to use
4. Milestone checkpoints

Format it as a clear, actionable plan. Be specific about what to learn and build.
Keep it realistic for the timeframe given."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )
        roadmap_text = response.choices[0].message.content

        return {
            "success": True,
            "data": {
                "targetRole": data.targetRole,
                "timeframe": data.timeframe,
                "roadmap": roadmap_text,
                "missingSkills": data.missingSkills,
                "currentSkills": data.currentSkills
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))