"""
Technician model matching the database schema
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
from decimal import Decimal

class AvailabilityStatus(str, Enum):
    """Technician availability status enumeration"""
    AVAILABLE = "available"
    BUSY = "busy"
    IN_MEETING = "in_meeting"
    ON_BREAK = "on_break"
    END_OF_SHIFT = "end_of_shift"
    FOCUS_MODE = "focus_mode"

class SkillLevel(str, Enum):
    """Technician skill level enumeration"""
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    EXPERT = "expert"

class SkillObject(BaseModel):
    """Model for individual skill object in skills array"""
    id: int = Field(..., description="Skill ID")
    percentage: int = Field(..., ge=0, le=100, description="Skill proficiency percentage (0-100)")

class Technician(BaseModel):
    """Technician model matching the database schema"""
    id: Optional[int] = Field(None, description="Technician unique identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Technician name")
    user_id: int = Field(..., description="ID of the associated user")
    
    # Workload and assignment tracking
    assigned_tickets_total: int = Field(default=0, ge=0, description="Total number of assigned tickets")
    assigned_tickets: Optional[List[int]] = Field(default=[], description="Array of ticket IDs")
    skills: Optional[List[SkillObject]] = Field(default=[], description="Array of skill objects with id and percentage")
    workload: int = Field(default=0, ge=0, le=100, description="Current workload percentage (0-100)")
    
    # Status and skills
    availability_status: AvailabilityStatus = Field(default=AvailabilityStatus.AVAILABLE, description="Current availability status")
    skill_level: SkillLevel = Field(default=SkillLevel.JUNIOR, description="Technician skill level")
    specialization: Optional[str] = Field(None, max_length=255, description="Area of specialization")
    
    # Status
    is_active: bool = Field(default=True, description="Whether the technician is active")
    
    # Timestamps
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="When technician was created")
    updated_at: Optional[datetime] = Field(default_factory=datetime.now, description="When technician was last updated")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }
        use_enum_values = True
    
    @validator('name')
    def validate_name(cls, v):
        """Validate technician name"""
        if not v or not v.strip():
            raise ValueError("Technician name cannot be empty")
        if len(v.strip()) < 2:
            raise ValueError("Technician name must be at least 2 characters")
        if len(v.strip()) > 255:
            raise ValueError("Technician name must be at most 255 characters")
        return v.strip()

class TechnicianCreate(BaseModel):
    """Model for creating a new technician"""
    name: str = Field(..., min_length=2, max_length=255, description="Technician name")
    user_id: int = Field(..., description="ID of the associated user")
    specialization: Optional[str] = Field(None, max_length=255, description="Area of specialization")
    skill_level: SkillLevel = Field(default=SkillLevel.JUNIOR, description="Technician skill level")
    skills: Optional[List[SkillObject]] = Field(default=[], description="Array of skill objects with id and percentage")

class TechnicianUpdate(BaseModel):
    """Model for updating an existing technician"""
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Technician name")
    specialization: Optional[str] = Field(None, max_length=255, description="Area of specialization")
    skill_level: Optional[SkillLevel] = Field(None, description="Technician skill level")
    availability_status: Optional[AvailabilityStatus] = Field(None, description="Current availability status")
    workload: Optional[int] = Field(None, ge=0, le=100, description="Current workload percentage")
    skills: Optional[List[SkillObject]] = Field(None, description="Array of skill objects with id and percentage")
    is_active: Optional[bool] = Field(None, description="Whether the technician is active")

class TechnicianResponse(BaseModel):
    """Model for technician API responses"""
    id: int = Field(..., description="Technician unique identifier")
    name: str = Field(..., description="Technician name")
    user_id: int = Field(..., description="ID of the associated user")
    assigned_tickets_total: int = Field(..., description="Total number of assigned tickets")
    assigned_tickets: List[int] = Field(..., description="Array of ticket IDs")
    skills: List[SkillObject] = Field(..., description="Array of skill objects with id and percentage")
    workload: int = Field(..., description="Current workload percentage")
    availability_status: AvailabilityStatus = Field(..., description="Current availability status")
    skill_level: SkillLevel = Field(..., description="Technician skill level")
    specialization: Optional[str] = Field(None, description="Area of specialization")
    is_active: bool = Field(..., description="Whether the technician is active")
    created_at: datetime = Field(..., description="When technician was created")
    updated_at: datetime = Field(..., description="When technician was last updated")

class TechnicianWithRelations(BaseModel):
    """Technician model with related data included"""
    technician: TechnicianResponse
    user: Optional[Dict[str, Any]] = Field(None, description="Associated user data")
    tickets: Optional[List[Dict[str, Any]]] = Field(default=[], description="List of assigned tickets")