from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.models.screening import ScreeningAssessment
from app.models.follow_up import FollowUpTask

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/population")
def get_population_analytics(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    screenings = db.query(ScreeningAssessment).all()
    tasks = db.query(FollowUpTask).all()

    total_patients = len(patients)
    total_screenings = len(screenings)

    # Screening coverage: ratio of up_to_date to eligible (excluding not_indicated)
    eligible_screenings = [s for s in screenings if s.status != "not_indicated"]
    up_to_date_count = sum(1 for s in eligible_screenings if s.status == "up_to_date")
    coverage_rate = round((up_to_date_count / len(eligible_screenings) * 100), 1) if eligible_screenings else 0.0

    # Care gaps: overdue + flagged_risk
    care_gaps = [s for s in screenings if s.status in ["overdue", "flagged_risk"]]
    care_gap_count = len(care_gaps)

    # Follow-up completion rate
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    task_completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks else 0.0

    # Pathway Adherence Breakdown
    pathways = [
        ("diabetes", "Type 2 Diabetes"),
        ("cardiovascular", "Cardiovascular"),
        ("cancer_breast", "Breast Cancer"),
        ("cancer_cervical", "Cervical Cancer"),
        ("cancer_colorectal", "Colorectal Cancer")
    ]
    pathway_metrics = []
    for cat_key, cat_name in pathways:
        cat_items = [s for s in screenings if s.category == cat_key]
        cat_eligible = [s for s in cat_items if s.status != "not_indicated"]
        cat_up_to_date = sum(1 for s in cat_eligible if s.status == "up_to_date")
        cat_rate = round((cat_up_to_date / len(cat_eligible) * 100), 1) if cat_eligible else 100.0
        pathway_metrics.append({
            "category": cat_key,
            "name": cat_name,
            "total_eligible": len(cat_eligible),
            "up_to_date": cat_up_to_date,
            "overdue": sum(1 for s in cat_items if s.status == "overdue"),
            "flagged_risk": sum(1 for s in cat_items if s.status == "flagged_risk"),
            "adherence_rate": cat_rate
        })

    # Age Cohort Adherence
    cohorts_def = [
        ("18-39", lambda a: 18 <= a <= 39),
        ("40-49", lambda a: 40 <= a <= 49),
        ("50-64", lambda a: 50 <= a <= 64),
        ("65+", lambda a: a >= 65),
    ]
    age_cohorts = []
    for cohort_label, cohort_fn in cohorts_def:
        cohort_patients = [p for p in patients if cohort_fn(p.age)]
        cohort_pids = {p.id for p in cohort_patients}
        cohort_screenings = [s for s in screenings if s.patient_id in cohort_pids and s.status != "not_indicated"]
        c_up_to_date = sum(1 for s in cohort_screenings if s.status == "up_to_date")
        c_overdue = sum(1 for s in cohort_screenings if s.status in ["overdue", "flagged_risk"])
        rate = round((c_up_to_date / len(cohort_screenings) * 100), 1) if cohort_screenings else 0.0
        age_cohorts.append({
            "cohort": cohort_label,
            "patient_count": len(cohort_patients),
            "screenings_evaluated": len(cohort_screenings),
            "up_to_date": c_up_to_date,
            "care_gaps": c_overdue,
            "adherence_rate": rate
        })

    # Recent activity stream
    recent_activity = []
    for t in sorted(tasks, key=lambda x: x.updated_at or x.created_at, reverse=True)[:6]:
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
            "total_patients": total_patients,
            "total_screenings": total_screenings,
            "coverage_rate": coverage_rate,
            "care_gap_count": care_gap_count,
            "total_follow_ups": total_tasks,
            "completed_follow_ups": completed_tasks,
            "task_completion_rate": task_completion_rate,
        },
        "pathway_metrics": pathway_metrics,
        "age_cohorts": age_cohorts,
        "recent_activity": recent_activity
    }
