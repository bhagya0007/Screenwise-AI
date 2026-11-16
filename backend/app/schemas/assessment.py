from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.recommendation import RecommendationResponse

class AssessmentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: Optional[str] = None
    patient_reference: Optional[str] = None
    assessment_date: datetime
    identified_flags: List[str] = []
    explanation: str
    missing_information: List[str] = []
    guideline_version: str
    review_status: str
    recommendations: List[RecommendationResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PathwayEvaluationRequest(BaseModel):
    categories: Optional[List[str]] = None
    force_recalculate: bool = False
