from typing import List, Dict, Any
from pydantic import BaseModel

class PathwayStat(BaseModel):
    category: str
    name: str
    total_eligible: int
    up_to_date: int
    overdue: int
    flagged_risk: int
    adherence_rate: float

class AgeCohortStat(BaseModel):
    cohort: str
    patient_count: int
    screenings_evaluated: int
    up_to_date: int
    care_gaps: int
    adherence_rate: float

class AnalyticsOverviewResponse(BaseModel):
    total_patients: int
    total_assessments: int
    care_gaps_count: int
    completed_actions: int
    pending_followups: int
    overall_coverage_rate: float
    followup_completion_rate: float
    risk_distribution: Dict[str, int]
    pathway_breakdown: List[PathwayStat]

class ScreeningCoverageResponse(BaseModel):
    overall_coverage_rate: float
    total_screenings_evaluated: int
    pathway_metrics: List[PathwayStat]
    age_cohort_metrics: List[AgeCohortStat]

class FollowUpsAnalyticsResponse(BaseModel):
    total_followups: int
    pending: int
    scheduled: int
    completed: int
    overdue: int
    completion_rate: float
    by_action_type: Dict[str, int]
    by_priority: Dict[str, int]
