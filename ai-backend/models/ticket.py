"""
Data models for ticket assignment workflow
Updated to match the actual database schema
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
from .skill import Skill

class TicketStatus(str, Enum):
    """Ticket status enumeration"""
    NEW = "new"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    RESOLVED = "resolved"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class PriorityLevel(str, Enum):
    """Priority level enumeration"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class ImpactLevel(str, Enum):
    """Impact level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class UrgencyLevel(str, Enum):
    """Urgency level enumeration"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"

class ComplexityLevel(str, Enum):
    """Complexity level enumeration"""
    LEVEL_1 = "level_1"
    LEVEL_2 = "level_2"
    LEVEL_3 = "level_3"

class Ticket(BaseModel):
    """Ticket model matching the database schema"""
    # Primary fields
    id: Optional[int] = Field(None, description="Ticket unique identifier")
    subject: str = Field(..., min_length=5, max_length=500, description="Ticket subject/title")
    description: str = Field(..., description="Ticket description")
    
    # Status and categorization
    status: TicketStatus = Field(default=TicketStatus.NEW, description="Current ticket status")
    priority: PriorityLevel = Field(default=PriorityLevel.NORMAL, description="Ticket priority")
    impact: ImpactLevel = Field(default=ImpactLevel.MEDIUM, description="Business impact level")
    urgency: UrgencyLevel = Field(default=UrgencyLevel.NORMAL, description="Urgency level")
    complexity_level: ComplexityLevel = Field(default=ComplexityLevel.LEVEL_1, description="Technical complexity")
    
    # Tags and categorization
    tags: Optional[List[str]] = Field(default=[], description="Ticket tags")
    
    # SLA and timing fields
    sla_violated: bool = Field(default=False, description="Whether SLA has been violated")
    resolution_due: Optional[datetime] = Field(None, description="When the ticket should be resolved")
    resolution_date: Optional[datetime] = Field(None, description="When the ticket was actually resolved")
    first_response_time: Optional[int] = Field(None, ge=0, description="First response time in minutes")
    response_time: Optional[int] = Field(None, ge=0, description="Response time in minutes")
    resolution_time: Optional[int] = Field(None, ge=0, description="Resolution time in minutes")
    
    # Escalation and tracking
    escalation_count: int = Field(default=0, ge=0, description="Number of times ticket was escalated")
    reopened_count: int = Field(default=0, ge=0, description="Number of times ticket was reopened")
    
    # Relationships
    requester_id: int = Field(..., description="ID of the user who created the ticket")
    assigned_technician_id: Optional[int] = Field(None, description="ID of the assigned technician")
    
    # JSON fields for complex data
    required_skills: Optional[List[Dict[str, Any]]] = Field(default=[], description="Skills required for this ticket")
    tasks: Optional[List[Dict[str, Any]]] = Field(default=[], description="Tasks associated with this ticket")
    work_logs: Optional[List[Dict[str, Any]]] = Field(default=[], description="Work logs for this ticket")
    audit_trail: Optional[List[Dict[str, Any]]] = Field(default=[], description="Audit trail entries")
    attachments: Optional[List[Dict[str, Any]]] = Field(default=[], description="File attachments")
    
    # Timestamps
    first_response_at: Optional[datetime] = Field(None, description="When first response was given")
    resolved_at: Optional[datetime] = Field(None, description="When ticket was resolved")
    closed_at: Optional[datetime] = Field(None, description="When ticket was closed")
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="When ticket was created")
    updated_at: Optional[datetime] = Field(default_factory=datetime.now, description="When ticket was last updated")
    
    # Customer satisfaction
    satisfaction_rating: Optional[int] = Field(None, ge=1, le=5, description="Customer satisfaction rating (1-5)")
    feedback: Optional[str] = Field(None, description="Customer feedback")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True

class SkillScore(BaseModel):
    """Skill with relevance score - updated to use proper Skill model"""
    skill: Skill = Field(..., description="The skill object")
    score: float = Field(..., ge=0.0, le=1.0, description="Relevance score from 0.0 to 1.0")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SkillScoreSimple(BaseModel):
    """Simplified skill score for API responses"""
    skill_name: str = Field(..., description="The skill name")
    skill_id: Optional[int] = Field(None, description="The skill ID")
    score: float = Field(..., ge=0.0, le=1.0, description="Relevance score from 0.0 to 1.0")

class Technician(BaseModel):
    """Technician model"""
    id: int = Field(..., description="Technician unique identifier")
    name: str = Field(..., description="Technician name")
    skills: List[str] = Field(..., description="List of technician skills")
    availability: str = Field(..., description="Current availability status")
    rating: float = Field(..., ge=0.0, le=5.0, description="Technician rating from 0.0 to 5.0")
    experience_years: Optional[int] = Field(None, description="Years of experience")
    complexity_level: Optional[ComplexityLevel] = Field(None, description="Technician's complexity level")
    current_workload: Optional[int] = Field(None, ge=0, description="Current number of active tickets")

class TicketAssignmentRequest(BaseModel):
    """Request model for ticket assignment"""
    ticket: Ticket

class TicketAssignmentResponse(BaseModel):
    """Response model for ticket assignment"""
    success: bool = Field(..., description="Whether the assignment was successful")
    selected_technician_id: Optional[int] = Field(None, description="Selected technician ID")
    justification: Optional[str] = Field(None, description="Justification for the selection")
    error_message: Optional[str] = Field(None, description="Error message if assignment failed")
    
class TicketSummary(BaseModel):
    """Simplified ticket model for API requests"""
    subject: str = Field(..., min_length=5, max_length=500, description="Ticket subject")
    description: str = Field(..., description="Ticket description")
    priority: PriorityLevel = Field(default=PriorityLevel.NORMAL, description="Ticket priority")
    impact: ImpactLevel = Field(default=ImpactLevel.MEDIUM, description="Business impact")
    urgency: UrgencyLevel = Field(default=UrgencyLevel.NORMAL, description="Urgency level")
    complexity_level: ComplexityLevel = Field(default=ComplexityLevel.LEVEL_1, description="Technical complexity")
    tags: Optional[List[str]] = Field(default=[], description="Ticket tags")
    requester_id: int = Field(..., description="ID of the requester") 