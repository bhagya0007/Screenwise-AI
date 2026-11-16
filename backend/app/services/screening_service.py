from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.screening import ScreeningAssessment
from app.guidelines.engine import evaluate_all_screenings
from app.services.ai_explainer import generate_screening_explanation

def evaluate_and_save_patient_screenings(db: Session, patient: Patient) -> List[ScreeningAssessment]:
    """
    Evaluates all screening pathways for a patient against clinical guidelines,
    generates AI explanations, and updates the database records.
    """
    results = evaluate_all_screenings(patient)
    saved_records = []

    for res in results:
        category = res["category"]
        existing = db.query(ScreeningAssessment).filter(
            ScreeningAssessment.patient_id == patient.id,
            ScreeningAssessment.category == category
        ).first()

        ai_explanation = generate_screening_explanation(
            category=category,
            patient_name=patient.full_name,
            age=patient.age,
            status=res["status"],
            risk_level=res["risk_level"],
            flagged_reasons=res["flagged_reasons"],
            suggested_next_steps=res["suggested_next_steps"],
            guideline_source=res["guideline_source"]
        )

        if existing:
            existing.status = res["status"]
            existing.risk_level = res["risk_level"]
            existing.last_screened_date = res["last_screened_date"]
            existing.next_due_date = res["next_due_date"]
            existing.flagged_reasons = res["flagged_reasons"]
            existing.suggested_next_steps = res["suggested_next_steps"]
            existing.guideline_source = res["guideline_source"]
            existing.assessment_summary = res["assessment_summary"]
            existing.ai_explanation = ai_explanation
            saved_records.append(existing)
        else:
            assessment = ScreeningAssessment(
                patient_id=patient.id,
                category=category,
                status=res["status"],
                risk_level=res["risk_level"],
                last_screened_date=res["last_screened_date"],
                next_due_date=res["next_due_date"],
                guideline_source=res["guideline_source"],
                assessment_summary=res["assessment_summary"],
                ai_explanation=ai_explanation
            )
            assessment.flagged_reasons = res["flagged_reasons"]
            assessment.suggested_next_steps = res["suggested_next_steps"]
            db.add(assessment)
            saved_records.append(assessment)

    db.commit()
    for rec in saved_records:
        db.refresh(rec)
    return saved_records

def get_patient_screenings(db: Session, patient_id: int) -> List[ScreeningAssessment]:
    screenings = db.query(ScreeningAssessment).filter(
        ScreeningAssessment.patient_id == patient_id
    ).all()
    if not screenings:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if patient:
            return evaluate_and_save_patient_screenings(db, patient)
    return screenings
