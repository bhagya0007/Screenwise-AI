from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel

class ScreeningAssessmentResponse(BaseModel):
    id: Optional[int] = None
    patient_id: int
    patient_name: Optional[str] = None
    category: str
    status: str # up_to_date, due_soon, overdue, flagged_risk, not_indicated
    risk_level: str # low, moderate, high, not_applicable
    review_status: str = "pending_review" # pending_review, acknowledged, ordered
    last_screened_date: Optional[date] = None
    next_due_date: Optional[date] = None
    flagged_reasons: List[str] = []
    suggested_next_steps: List[str] = []
    guideline_source: str
    assessment_summary: Optional[str] = None
    ai_explanation: Optional[str] = None
    evaluated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PathwayEvaluationRequest(BaseModel):
    patient_id: int
    categories: Optional[List[str]] = None
    force_recalculate: bool = False

class ReviewStatusUpdate(BaseModel):
    review_status: str # "pending_review", "acknowledged", "ordered"
