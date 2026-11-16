from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class FollowUpBase(BaseModel):
    title: str = Field(..., max_length=150)
    action_type: str = Field("consultation", description="lab_test, imaging, consultation, lifestyle, vaccine")
    status: str = Field("pending", description="pending, scheduled, completed, overdue, deferred")
    priority: str = Field("routine", description="routine, moderate, urgent")
    due_date: date
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    assigned_provider: Optional[str] = None
    notes: Optional[str] = None
    clinical_notes: Optional[str] = None

class FollowUpCreate(FollowUpBase):
    patient_id: int
    recommendation_id: Optional[int] = None

class FollowUpUpdate(BaseModel):
    title: Optional[str] = None
    action_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    assigned_provider: Optional[str] = None
    notes: Optional[str] = None
    clinical_notes: Optional[str] = None

class FollowUpResponse(FollowUpBase):
    id: int
    patient_id: int
    recommendation_id: Optional[int] = None
    patient_name: Optional[str] = None
    patient_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
