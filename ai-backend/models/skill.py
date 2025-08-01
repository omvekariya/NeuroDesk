"""
Skill model matching the database schema
"""
from typing import Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime

class Skill(BaseModel):
    """Skill model matching the database schema"""
    id: Optional[int] = Field(None, description="Skill unique identifier")
    name: str = Field(..., min_length=2, max_length=255, description="Skill name (unique)")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: bool = Field(default=True, description="Whether the skill is active")
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="When skill was created")
    updated_at: Optional[datetime] = Field(default_factory=datetime.now, description="When skill was last updated")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('name')
    def validate_name(cls, v):
        """Validate skill name"""
        if not v or not v.strip():
            raise ValueError("Skill name cannot be empty")
        if len(v.strip()) < 2:
            raise ValueError("Skill name must be at least 2 characters")
        if len(v.strip()) > 255:
            raise ValueError("Skill name must be at most 255 characters")
        return v.strip()

class SkillCreate(BaseModel):
    """Model for creating a new skill"""
    name: str = Field(..., min_length=2, max_length=255, description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: bool = Field(default=True, description="Whether the skill is active")

class SkillUpdate(BaseModel):
    """Model for updating an existing skill"""
    name: Optional[str] = Field(None, min_length=2, max_length=255, description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: Optional[bool] = Field(None, description="Whether the skill is active")

class SkillResponse(BaseModel):
    """Model for skill API responses"""
    id: int = Field(..., description="Skill unique identifier")
    name: str = Field(..., description="Skill name")
    description: Optional[str] = Field(None, description="Skill description")
    is_active: bool = Field(..., description="Whether the skill is active")
    created_at: datetime = Field(..., description="When skill was created")
    updated_at: datetime = Field(..., description="When skill was last updated") 