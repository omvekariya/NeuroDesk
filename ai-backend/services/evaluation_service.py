from datetime import datetime
from typing import Dict, List, Any, Union
from pydantic import BaseModel
import requests

class SkillEvaluation(BaseModel):
    skill_id: int
    skill_level: float  # 0-100 scale
    confidence_score: float

class SkillMetric(BaseModel):
    score: float
    reasoning: str

class SentimentResult(BaseModel):
    score: float
    reasoning: str

class MetricsResult(BaseModel):
    resolution_time: int  # in minutes
    sla_adherence: bool
    skill_metrics: Dict[str, SkillMetric]  # Format: {"skill_id": {"score": float, "reasoning": str}}
    feedback_sentiment: SentimentResult  # Format: {"score": float, "reasoning": str}

    class Config:
        arbitrary_types_allowed = True

class EvaluationService:
    def __init__(self, llm, technician_api_url="http://172.16.15.115:5000/api/v1"):
        self.llm = llm
        self.technician_api_url = technician_api_url

    

    def calculate_metrics(self, ticket_data: Dict) -> MetricsResult:
        resolution_time = self._calculate_resolution_time(ticket_data)
        
        sla_target = self._get_sla_target(ticket_data['priority'])
        sla_adherence = resolution_time <= sla_target if resolution_time else True

        skill_metrics = self._analyze_skill_performance(ticket_data)
        feedback_sentiment = self._analyze_feedback_sentiment(ticket_data)

        return MetricsResult(
            resolution_time=resolution_time,
            sla_adherence=sla_adherence,
            skill_metrics=skill_metrics,
            feedback_sentiment=feedback_sentiment
        )
    def _calculate_resolution_time(self, ticket_data: Dict) -> int:
        """Calculate resolution time in minutes"""
        try:
            if 'assigned_at' in ticket_data and 'resolved_at' in ticket_data:
                start_time = datetime.fromisoformat(ticket_data['assigned_at'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(ticket_data['resolved_at'].replace('Z', '+00:00'))
                return int((end_time - start_time).total_seconds() / 60)
            return 0
        except (ValueError, KeyError):
            return 0

    def _get_sla_target(self, priority: str) -> int:
        """Get SLA target time in minutes based on priority"""
        sla_targets = {
            'critical': 60,    # 1 hour
            'high': 240,       # 4 hours
            'medium': 480,     # 8 hours
            'low': 1440        # 24 hours
        }
        return sla_targets.get(priority.lower(), 480)
    
    # Add the sentiment analysis method
    def _analyze_feedback_sentiment(self, ticket_data: Dict) -> Dict[str, Union[float, str]]:
        """
        Analyze user feedback sentiment using LLM
        Returns dict with score (-100 to 100) and reasoning
        """
        if not ticket_data.get('feedback'):
            return {"score": 0.0, "reasoning": "No feedback provided"}
                
        prompt = f"""
        Analyze the sentiment of this user feedback and provide:
        1. A score from -100 to 100:
        -100: Extremely negative
        -50: Moderately negative
        0: Neutral
        50: Moderately positive
        100: Extremely positive
        2. A brief explanation for the score (max 50 words)
        
        User Feedback: {ticket_data.get('feedback')}
        
        Format your response as:
        SCORE: <number>
        REASON: <explanation>
        """
        
        try:
            response = self.llm.predict(prompt)
            score_line, reason_line = [line for line in response.split('\n') if line.strip()][:2]
            
            sentiment_score = score_line.replace('SCORE:', '').strip()
            reasoning = reason_line.replace('REASON:', '').strip()
            
            return {
                "score": max(-100, min(100, sentiment_score)),
                "reasoning": reasoning
            }
        except (ValueError, TypeError, IndexError):
            return {"score": 0.0, "reasoning": "Error analyzing feedback"}


    def _analyze_skill_performance(self, ticket_data: Dict) -> Dict[str, Dict[str, Union[float, str]]]:
        """Analyze skill performance using LLM"""
        prompt = f"""
        Analyze this ticket resolution and rate the demonstrated skill levels:
        
        Ticket Subject: {ticket_data.get('subject', '')}
        Description: {ticket_data.get('description', '')}
        Resolution Steps: {ticket_data.get('resolution', '')}
        Work Logs: {ticket_data.get('work_logs', [])}
        
        For each required skill {ticket_data.get('required_skills', [])}, provide:
        1. Skill proficiency score (0-100)
        2. Brief justification (max 50 words)
        
        Format each skill as:
        SKILL: <skill_id>
        SCORE: <number>
        REASON: <justification>
        """
        
        analysis = self.llm.predict(prompt)
        skill_evaluations = {}
        
        current_skill = None
        current_data = {}
        
        for line in analysis.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('SKILL:'):
                if current_skill and current_data:
                    skill_evaluations[current_skill] = current_data
                current_skill = line.replace('SKILL:', '').strip()
                current_data = {}
            elif line.startswith('SCORE:'):
                current_data['score'] = float(line.replace('SCORE:', '').strip())
            elif line.startswith('REASON:'):
                current_data['reasoning'] = line.replace('REASON:', '').strip()
                
        # Add the last skill if exists
        if current_skill and current_data:
            skill_evaluations[current_skill] = current_data
                        
        return skill_evaluations

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
                           ticket_metrics: MetricsResult) -> Dict:
        """Update technician skills based on ticket performance"""
        
        # Convert current skills to dictionary for easier lookup
        skill_map = {skill['id']: skill['percentage'] for skill in current_skills}
        
        # Calculate performance multiplier based on SLA adherence
        performance_multiplier = 1.0
        if not ticket_metrics.sla_adherence:
            performance_multiplier = 0.8  # Reduce skill gain for missed SLA
            
        # Update skills based on ticket metrics
        for skill_id, skill_metric in ticket_metrics.skill_metrics.items():
            skill_score = skill_metric.score  # Access the score from SkillMetric object
            
            if skill_id in skill_map:
                # Weighted average with more weight to existing skill level
                current_level = skill_map[skill_id]
                skill_map[skill_id] = min(100, 
                    (current_level * 0.7 + skill_score * 0.3 * performance_multiplier))
            else:
                # New skill starts at demonstrated level * performance multiplier
                skill_map[skill_id] = min(100, skill_score * performance_multiplier)
        
        # Convert back to list format
        updated_skills = [
            {"id": skill_id, "percentage": level}
            for skill_id, level in skill_map.items()
        ]
        
        return {
            "technician_id": technician_id,
            "skills": updated_skills,
            "updated_at": datetime.utcnow().isoformat()
        }