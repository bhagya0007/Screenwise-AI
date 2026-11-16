import json
from datetime import datetime, date, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.assessment import Assessment
from app.models.recommendation import Recommendation
from app.guidelines.engine import evaluate_all_screenings
from app.schemas.assessment import AssessmentResponse
from app.schemas.recommendation import RecommendationResponse

def run_patient_assessment(db: Session, patient: Patient) -> Assessment:
    """
    Runs the clinical guidelines evaluation engine for all 5 preventive screening pathways,
    generates AI rationale, flags, missing information, and creates corresponding recommendations
    within a safe database transaction.
    """
    try:
        # Run guidelines engine across all pathways
        evaluations = evaluate_all_screenings(patient)
        
        all_flags = []
        all_missing_info = []
        explanation_blocks = []

        # Check for missing clinical data
        if patient.bmi is None:
            all_missing_info.append("Body Mass Index (BMI) not recorded")
        if patient.systolic_bp is None or patient.diastolic_bp is None:
            all_missing_info.append("Recent resting Blood Pressure measurement missing")
        if patient.last_lipid_panel_date is None and patient.age >= 40:
            all_missing_info.append("Baseline 5-year Lipid Panel not on record")
        if patient.sex == "female" and patient.age >= 40 and patient.last_mammogram_date is None:
            all_missing_info.append("Initial baseline screening mammogram not documented")
        if patient.age >= 45 and patient.last_colorectal_screen_date is None:
            all_missing_info.append("Baseline colorectal cancer screening not documented")

        # Collect flags and rationales from evaluations
        for ev in evaluations:
            category = ev["category"]
            cat_label = category.replace("_", " ").title()
            status = ev["status"]
            risk_level = ev["risk_level"]
            reasons = ev["flagged_reasons"]
            
            if status in ["overdue", "flagged_risk", "due_soon"]:
                all_flags.extend([f"[{cat_label}] {r}" for r in reasons])

            if ev.get("ai_explanation"):
                explanation_blocks.append(f"### {cat_label} Evaluation:\n{ev['ai_explanation']}")

        overall_explanation = "\n\n".join(explanation_blocks)
        if not overall_explanation:
            overall_explanation = (
                f"ScreenWise AI Clinical Evaluation for {patient.full_name} (Age {patient.age}, {patient.sex.capitalize()}):\n"
                f"All assessed preventive health pathways are currently up to date based on USPSTF and ADA clinical guidelines. "
                f"Continue routine preventive primary care surveillance."
            )

        # Create new Assessment entry
        assessment = Assessment(
            patient_id=patient.id,
            assessment_date=datetime.now(timezone.utc),
            identified_flags=json.dumps(all_flags),
            explanation=overall_explanation,
            missing_information=json.dumps(all_missing_info),
            guideline_version="USPSTF 2024 / ADA 2024 / ACC-AHA 2023",
            review_status="pending_review"
        )
        db.add(assessment)
        db.flush() # Get assessment.id

        # Delete previous recommendations for this patient to maintain up-to-date recommendations
        db.query(Recommendation).filter(Recommendation.patient_id == patient.id).delete()

        # Create fresh Recommendations for each evaluated pathway
        for ev in evaluations:
            status = ev["status"]
            category = ev["category"]
            risk_level = ev["risk_level"]
            reasons = ev["flagged_reasons"]
            steps = ev["suggested_next_steps"]

            priority = "routine"
            if status == "flagged_risk" or risk_level == "high":
                priority = "urgent"
            elif status == "overdue" or risk_level == "moderate":
                priority = "moderate"

            suggested_timing = "Within 14 days" if priority == "urgent" else "Within 30–60 days" if priority == "moderate" else "Annual routine"
            
            rec_text = steps[0] if steps else f"Continue routine preventive surveillance for {category}."
            rationale_text = " ".join(reasons) if reasons else f"Patient meets routine screening criteria under {ev['guideline_source']}."

            recommendation = Recommendation(
                patient_id=patient.id,
                assessment_id=assessment.id,
                screening_category=category,
                recommendation=rec_text,
                rationale=rationale_text,
                suggested_timing=suggested_timing,
                priority=priority,
                professional_review_status="pending_review"
            )
            db.add(recommendation)

        db.commit()
        db.refresh(assessment)
        return assessment
    except Exception as e:
        db.rollback()
        raise e

def get_patient_assessments(db: Session, patient_id: int) -> List[Assessment]:
    return db.query(Assessment).filter(Assessment.patient_id == patient_id).order_by(Assessment.assessment_date.desc()).all()

def get_latest_patient_assessment(db: Session, patient_id: int) -> Optional[Assessment]:
    return db.query(Assessment).filter(Assessment.patient_id == patient_id).order_by(Assessment.assessment_date.desc()).first()

def build_assessment_response(assessment: Assessment, patient: Patient) -> AssessmentResponse:
    recs = []
    for r in assessment.recommendations:
        recs.append(RecommendationResponse(
            id=r.id,
            patient_id=r.patient_id,
            patient_name=patient.full_name,
            patient_reference=patient.patient_reference,
            assessment_id=r.assessment_id,
            screening_category=r.screening_category,
            recommendation=r.recommendation,
            rationale=r.rationale,
            suggested_timing=r.suggested_timing,
            priority=r.priority,
            professional_review_status=r.professional_review_status,
            category=r.screening_category,
            review_status=r.professional_review_status,
            flagged_reasons=[r.rationale],
            suggested_next_steps=[r.recommendation]
        ))

    return AssessmentResponse(
        id=assessment.id,
        patient_id=assessment.patient_id,
        patient_name=patient.full_name,
        patient_reference=patient.patient_reference,
        assessment_date=assessment.assessment_date,
        identified_flags=assessment.flags_list,
        explanation=assessment.explanation,
        missing_information=assessment.missing_info_list,
        guideline_version=assessment.guideline_version,
        review_status=assessment.review_status,
        recommendations=recs
    )
