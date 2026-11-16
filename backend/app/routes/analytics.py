from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    ScreeningCoverageResponse,
    FollowUpsAnalyticsResponse
)
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get aggregate preventive care metrics, screening adherence rates, and care gaps.
    """
    return analytics_service.get_overview_analytics(db)

@router.get("/screening-coverage", response_model=ScreeningCoverageResponse)
def get_screening_coverage(db: Session = Depends(get_db)):
    """
    Get detailed screening coverage metrics by clinical pathway and age cohort.
    """
    return analytics_service.get_screening_coverage_analytics(db)

@router.get("/followups", response_model=FollowUpsAnalyticsResponse)
def get_followups_analytics(db: Session = Depends(get_db)):
    """
    Get follow-up completion rates, distribution by action type, and status breakdown.
    """
    return analytics_service.get_followups_analytics(db)

@router.get("/population")
def get_population_analytics_compat(db: Session = Depends(get_db)):
    """
    Comprehensive population analytics endpoint returning aggregated screening metrics,
    categorical status distributions, monthly trends, demographic segmentations with
    small-cell suppression, and transparency safeguards.
    """
    metrics = analytics_service.compute_population_metrics(db)
    
    recent_activity = []
    for t in sorted(metrics["tasks"], key=lambda x: x.updated_at or x.created_at, reverse=True)[:8]:
        patient_name = t.patient.full_name if t.patient else "Patient"
        recent_activity.append({
            "id": f"task-{t.id}",
            "type": "follow_up",
            "action": f"{t.status.title()} Follow-Up",
            "description": f"{t.title} for {patient_name}",
            "time": (t.updated_at or t.created_at).strftime("%b %d, %H:%M"),
            "status": t.status,
            "patient_id": t.patient_id
        })

    return {
        "summary": {
            "total_patients": metrics["total_patients"],
            "patients_assessed": metrics["patients_assessed"],
            "potentially_due_flags": metrics["potentially_due_flags"],
            "potentially_overdue_flags": metrics["potentially_overdue_flags"],
            "completed_screening_actions": metrics["completed_screening_actions"],
            "pending_followups": metrics["pending_followups"],
            "scheduled_followups": metrics["scheduled_followups"],
            "overdue_followups": metrics["overdue_followups"],
            "total_screenings": metrics["total_eligible_screenings"],
            "coverage_rate": metrics["overall_coverage_rate"],
            "care_gap_count": metrics["care_gaps_count"],
            "total_follow_ups": len(metrics["tasks"]),
            "completed_follow_ups": metrics["completed_screening_actions"],
            "task_completion_rate": metrics["followup_completion_rate"],
        },
        "pathway_metrics": [p.model_dump() if hasattr(p, "model_dump") else p for p in metrics["pathway_stats"]],
        "age_cohorts": metrics["age_cohort_stats"],
        "gender_cohorts": metrics["gender_cohort_stats"],
        "diabetes_breakdown": metrics["diabetes_breakdown"],
        "cardiovascular_breakdown": metrics["cardiovascular_breakdown"],
        "cancer_breakdown": metrics["cancer_breakdown"],
        "monthly_screening_completion": metrics["monthly_screening_completion"],
        "followup_completion_trend": metrics["followup_completion_trend"],
        "safeguards": metrics["safeguards"],
        "recent_activity": recent_activity
    }
