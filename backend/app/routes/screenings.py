from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.screening import ScreeningAssessmentResponse
from app.services import screening_service, patient_service

router = APIRouter(prefix="/screenings", tags=["Screenings"])

@router.get("/patient/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def get_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all screening assessments for a patient across all 5 pathways:
    - Diabetes
    - Cardiovascular
    - Cancer Breast
    - Cancer Cervical
    - Cancer Colorectal
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    screenings = screening_service.get_patient_screenings(db, patient_id)
    return screenings

@router.post("/evaluate/{patient_id}", response_model=List[ScreeningAssessmentResponse])
def re_evaluate_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Re-evaluate all screening guidelines for a patient and update AI explanations.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return screening_service.evaluate_and_save_patient_screenings(db, patient)
