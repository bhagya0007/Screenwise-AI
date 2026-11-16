from datetime import date
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.assessment import Assessment
from app.models.recommendation import Recommendation
from app.models.follow_up import FollowUp
from app.guidelines.engine import evaluate_all_screenings
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    ScreeningCoverageResponse,
    FollowUpsAnalyticsResponse,
    PathwayStat,
    AgeCohortStat
)

def compute_population_metrics(db: Session) -> Dict[str, Any]:
    patients = db.query(Patient).all()
    tasks = db.query(FollowUp).all()
    recs = db.query(Recommendation).all()
    assessments = db.query(Assessment).all()

    total_patients = len(patients)
    total_assessments = len(assessments)

    # Evaluate all patients across the 5 pathways
    pathway_definitions = [
        ("diabetes", "Type 2 Diabetes"),
        ("cardiovascular", "Cardiovascular"),
        ("cancer_breast", "Breast Cancer"),
        ("cancer_cervical", "Cervical Cancer"),
        ("cancer_colorectal", "Colorectal Cancer")
    ]

    pathway_counts = {p[0]: {"eligible": 0, "up_to_date": 0, "overdue": 0, "flagged": 0} for p in pathway_definitions}
    risk_counts = {"low": 0, "moderate": 0, "high": 0, "not_applicable": 0}

    total_eligible_screenings = 0
    total_up_to_date_screenings = 0
    total_care_gaps = 0

    # Age cohort buckets
    cohorts_data = {
        "18-39": {"patients": 0, "screenings": 0, "up_to_date": 0, "care_gaps": 0},
        "40-49": {"patients": 0, "screenings": 0, "up_to_date": 0, "care_gaps": 0},
        "50-64": {"patients": 0, "screenings": 0, "up_to_date": 0, "care_gaps": 0},
        "65+":   {"patients": 0, "screenings": 0, "up_to_date": 0, "care_gaps": 0},
    }

    for p in patients:
        evals = evaluate_all_screenings(p)
        age = p.age
        cohort_key = "18-39" if age <= 39 else "40-49" if age <= 49 else "50-64" if age <= 64 else "65+"
        cohorts_data[cohort_key]["patients"] += 1

        for ev in evals:
            cat = ev["category"]
            status = ev["status"]
            risk = ev["risk_level"]

            if risk in risk_counts:
                risk_counts[risk] += 1
            else:
                risk_counts["low"] += 1

            if status != "not_indicated":
                total_eligible_screenings += 1
                pathway_counts[cat]["eligible"] += 1
                cohorts_data[cohort_key]["screenings"] += 1

                if status == "up_to_date":
                    total_up_to_date_screenings += 1
                    pathway_counts[cat]["up_to_date"] += 1
                    cohorts_data[cohort_key]["up_to_date"] += 1
                elif status in ["overdue", "flagged_risk"]:
                    total_care_gaps += 1
                    cohorts_data[cohort_key]["care_gaps"] += 1
                    if status == "overdue":
                        pathway_counts[cat]["overdue"] += 1
                    else:
                        pathway_counts[cat]["flagged"] += 1

    overall_coverage_rate = round(
        (total_up_to_date_screenings / total_eligible_screenings * 100), 1
    ) if total_eligible_screenings > 0 else 100.0

    pathway_stats = []
    for cat_key, cat_name in pathway_definitions:
        info = pathway_counts[cat_key]
        el = info["eligible"]
        rate = round((info["up_to_date"] / el * 100), 1) if el > 0 else 100.0
        pathway_stats.append(PathwayStat(
            category=cat_key,
            name=cat_name,
            total_eligible=el,
            up_to_date=info["up_to_date"],
            overdue=info["overdue"],
            flagged_risk=info["flagged"],
            adherence_rate=rate
        ))

    age_cohort_stats = []
    for c_key, c_info in cohorts_data.items():
        sc = c_info["screenings"]
        rate = round((c_info["up_to_date"] / sc * 100), 1) if sc > 0 else 100.0
        age_cohort_stats.append(AgeCohortStat(
            cohort=c_key,
            patient_count=c_info["patients"],
            screenings_evaluated=sc,
            up_to_date=c_info["up_to_date"],
            care_gaps=c_info["care_gaps"],
            adherence_rate=rate
        ))

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    pending_tasks = sum(1 for t in tasks if t.status in ["pending", "scheduled", "overdue"])
    task_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    return {
        "total_patients": total_patients,
        "total_assessments": total_assessments,
        "total_eligible_screenings": total_eligible_screenings,
        "total_up_to_date_screenings": total_up_to_date_screenings,
        "overall_coverage_rate": overall_coverage_rate,
        "care_gaps_count": total_care_gaps,
        "completed_actions": completed_tasks,
        "pending_followups": pending_tasks,
        "followup_completion_rate": task_rate,
        "risk_distribution": risk_counts,
        "pathway_stats": pathway_stats,
        "age_cohort_stats": age_cohort_stats,
        "tasks": tasks
    }

def get_overview_analytics(db: Session) -> AnalyticsOverviewResponse:
    metrics = compute_population_metrics(db)
    return AnalyticsOverviewResponse(
        total_patients=metrics["total_patients"],
        total_assessments=metrics["total_assessments"],
        care_gaps_count=metrics["care_gaps_count"],
        completed_actions=metrics["completed_actions"],
        pending_followups=metrics["pending_followups"],
        overall_coverage_rate=metrics["overall_coverage_rate"],
        followup_completion_rate=metrics["followup_completion_rate"],
        risk_distribution=metrics["risk_distribution"],
        pathway_breakdown=metrics["pathway_stats"]
    )

def get_screening_coverage_analytics(db: Session) -> ScreeningCoverageResponse:
    metrics = compute_population_metrics(db)
    return ScreeningCoverageResponse(
        overall_coverage_rate=metrics["overall_coverage_rate"],
        total_screenings_evaluated=metrics["total_eligible_screenings"],
        pathway_metrics=metrics["pathway_stats"],
        age_cohort_metrics=metrics["age_cohort_stats"]
    )

def get_followups_analytics(db: Session) -> FollowUpsAnalyticsResponse:
    tasks = db.query(FollowUp).all()
    today = date.today()
    
    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == "pending")
    scheduled = sum(1 for t in tasks if t.status == "scheduled")
    completed = sum(1 for t in tasks if t.status == "completed")
    overdue = sum(1 for t in tasks if t.status != "completed" and t.due_date < today)
    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    by_type = {}
    by_priority = {}
    for t in tasks:
        by_type[t.action_type] = by_type.get(t.action_type, 0) + 1
        by_priority[t.priority] = by_priority.get(t.priority, 0) + 1

    return FollowUpsAnalyticsResponse(
        total_followups=total,
        pending=pending,
        scheduled=scheduled,
        completed=completed,
        overdue=overdue,
        completion_rate=completion_rate,
        by_action_type=by_type,
        by_priority=by_priority
    )
