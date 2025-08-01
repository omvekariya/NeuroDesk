from typing import Dict, List
import requests
from pydantic import BaseModel
from datetime import datetime

class SkillEvaluation(BaseModel):
    skill_id: int
    skill_level: float  # 0-100 scale for percentage
    confidence_score: float

class TechnicianEvaluation(BaseModel):
    technician_id: int
    skills: List[Dict[str, float]]  # Format: [{"id": 1, "percentage": 85}]
    updated_at: str

class EvaluationService:
    def __init__(self, llm, technician_api_url="'http://172.16.15.115/api/v1'"):
        self.llm = llm
        self.technician_api_url = technician_api_url
        
    def get_technicians(self) -> List[Dict]:
        """Fetch all technicians from backend API"""
        try:
            response = requests.get(f"{self.technician_api_url}/technicians/all")
            if response.status_code == 200:
                return response.json()["data"]["technicians"]
            else:
                raise Exception(f"Failed to fetch technicians: {response.text}")
        except Exception as e:
            raise Exception(f"Error fetching technicians: {str(e)}")

    def extract_skills_from_ticket(self, ticket_data: Dict) -> List[SkillEvaluation]:
        # Create prompt for skill extraction
        prompt = f"""
        Based on the following ticket information:
        Subject: {ticket_data.get('subject')}
        Description: {ticket_data.get('description')}
        Tasks: {ticket_data.get('tasks', [])}
        Work Logs: {ticket_data.get('work_logs', [])}
        Required Skills: {ticket_data.get('required_skills', [])}
        
        Extract technical skills used and assign skill levels (0-100).
        Format: Skill ID | Level (0-100) | Confidence (0.0-1.0)
        Use only skill IDs from: {ticket_data.get('required_skills', [])}
        """
        
        response = self.llm.predict(prompt)
        
        skills = []
        for skill_line in response.split('\n'):
            if '|' in skill_line:
                skill_id, level, confidence = skill_line.split('|')
                skills.append(SkillEvaluation(
                    skill_id=int(skill_id.strip()),
                    skill_level=float(level.strip()),
                    confidence_score=float(confidence.strip())
                ))
        
        return skills

    def update_technician_skills(self, 
                               technician_id: int,
                               current_skills: List[Dict],
                               new_skills: List[SkillEvaluation]) -> TechnicianEvaluation:
        # Convert current skills to dictionary for easier lookup
        skill_map = {skill['id']: skill['percentage'] for skill in current_skills}
        
        for new_skill in new_skills:
            if new_skill.skill_id in skill_map:
                # Update existing skill level with weighted average
                current_level = skill_map[new_skill.skill_id]
                weight = new_skill.confidence_score
                updated_level = (current_level * (1-weight) + 
                               new_skill.skill_level * weight)
                skill_map[new_skill.skill_id] = updated_level
            else:
                # Add new skill
                skill_map[new_skill.skill_id] = new_skill.skill_level
        
        # Convert back to list format expected by backend
        updated_skills = [
            {"id": skill_id, "percentage": level}
            for skill_id, level in skill_map.items()
        ]
        
        return TechnicianEvaluation(
            technician_id=technician_id,
            skills=updated_skills,
            updated_at=datetime.now().isoformat()
        )