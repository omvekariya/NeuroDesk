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

class Technician(BaseModel):
    """Technician model matching the database schema"""
    id: Optional[int] = Field(None, description="Technician unique identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Technician name")
    user_id: int = Field(..., description="ID of the associated user")
    
    # Workload and assignment tracking
    assigned_tickets_total: int = Field(default=0, ge=0, description="Total number of assigned tickets")
    assigned_tickets: Optional[List[Dict[str, Any]]] = Field(default=[], description="JSON array of assigned tickets")
    workload: int = Field(default=0, ge=0, le=100, description="Current workload percentage (0-100)")
    
    # Status and skills
    availability_status: AvailabilityStatus = Field(default=AvailabilityStatus.AVAILABLE, description="Current availability status")
    skill_level: SkillLevel = Field(default=SkillLevel.JUNIOR, description="Technician skill level")
    specialization: Optional[str] = Field(None, max_length=255, description="Area of specialization")
    
    # Performance metrics
    performance_rating: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('5.00'), description="Performance rating (0.00-5.00)")
    total_tickets_resolved: int = Field(default=0, ge=0, description="Total number of tickets resolved")
    average_resolution_time: Optional[int] = Field(None, ge=0, description="Average resolution time in minutes")
    first_contact_resolution_rate: Optional[Decimal] = Field(None, ge=Decimal('0.00'), le=Decimal('100.00'), description="First contact resolution rate (0.00-100.00)")
    
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

class TechnicianUpdate(BaseModel):
    """Model for updating an existing technician"""
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Technician name")
    specialization: Optional[str] = Field(None, max_length=255, description="Area of specialization")
    skill_level: Optional[SkillLevel] = Field(None, description="Technician skill level")
    availability_status: Optional[AvailabilityStatus] = Field(None, description="Current availability status")
    workload: Optional[int] = Field(None, ge=0, le=100, description="Current workload percentage")
    is_active: Optional[bool] = Field(None, description="Whether the technician is active")

class TechnicianResponse(BaseModel):
    """Model for technician API responses"""
    id: int = Field(..., description="Technician unique identifier")
    name: str = Field(..., description="Technician name")
    user_id: int = Field(..., description="ID of the associated user")
    assigned_tickets_total: int = Field(..., description="Total number of assigned tickets")
    workload: int = Field(..., description="Current workload percentage")
    availability_status: AvailabilityStatus = Field(..., description="Current availability status")
    skill_level: SkillLevel = Field(..., description="Technician skill level")
    specialization: Optional[str] = Field(None, description="Area of specialization")
    performance_rating: Optional[float] = Field(None, description="Performance rating")
    total_tickets_resolved: int = Field(..., description="Total number of tickets resolved")
    average_resolution_time: Optional[int] = Field(None, description="Average resolution time in minutes")
    first_contact_resolution_rate: Optional[float] = Field(None, description="First contact resolution rate")
    is_active: bool = Field(..., description="Whether the technician is active")
    created_at: datetime = Field(..., description="When technician was created")
    updated_at: datetime = Field(..., description="When technician was last updated")

class TechnicianWithSkills(BaseModel):
    """Technician model with skills included"""
    technician: TechnicianResponse
    skills: List[Dict[str, Any]] = Field(default=[], description="List of technician skills") 