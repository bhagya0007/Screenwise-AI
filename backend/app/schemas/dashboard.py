from typing import List, Dict, Any
from pydantic import BaseModel

class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    database: str
    timestamp: str

class CategoryStat(BaseModel):
    category: str
    label: str
    up_to_date: int
    due_soon: int
    overdue: int
    flagged_risk: int
    not_indicated: int

class DashboardStatsResponse(BaseModel):
    total_patients: int
    total_screenings_evaluated: int
    total_overdue: int
    total_flagged_risk: int
    pending_follow_ups: int
    completed_follow_ups: int
    category_breakdown: List[CategoryStat]
    risk_distribution: Dict[str, int]
