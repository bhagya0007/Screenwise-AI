from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class RecommendationResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    patient_reference: Optional[str] = None
    assessment_id: Optional[int] = None
    screening_category: str
    recommendation: str
    rationale: str
    suggested_timing: str
    priority: str # "urgent", "moderate", "routine"
    professional_review_status: str # "pending_review", "acknowledged", "ordered"

    # Convenience compatibility fields for frontend
    category: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    review_status: Optional[str] = None
    flagged_reasons: List[str] = []
    suggested_next_steps: List[str] = []
    guideline_source: Optional[str] = None
    ai_explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RecommendationStatusUpdate(BaseModel):
    professional_review_status: str # "pending_review", "acknowledged", "ordered"
