from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field

class FollowUpTaskBase(BaseModel):
    title: str = Field(..., max_length=150)
    action_type: str = Field(..., description="lab_test, imaging, consultation, lifestyle, vaccine")
    status: str = Field("pending", description="pending, scheduled, completed, overdue, deferred")
    priority: str = Field("routine", description="routine, moderate, urgent")
    due_date: date
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    assigned_provider: Optional[str] = None
    clinical_notes: Optional[str] = None
    result_summary: Optional[str] = None

class FollowUpTaskCreate(FollowUpTaskBase):
    patient_id: int
    screening_id: Optional[int] = None

class FollowUpTaskUpdate(BaseModel):
    title: Optional[str] = None
    action_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    assigned_provider: Optional[str] = None
    clinical_notes: Optional[str] = None
    result_summary: Optional[str] = None

class FollowUpTaskResponse(FollowUpTaskBase):
    id: int
    patient_id: int
    screening_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True
