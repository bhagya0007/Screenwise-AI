from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service, screening_service

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all patients with optional search by first name, last name, or email.
    """
    return patient_service.get_patients(db, skip=skip, limit=limit, search=search)

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new patient and automatically compute initial screening evaluations.
    """
    patient = patient_service.create_patient(db, patient_in)
    # Evaluate screening guidelines on creation
    screening_service.evaluate_and_save_patient_screenings(db, patient)
    return patient

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve single patient details by ID.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_update: PatientUpdate,
    db: Session = Depends(get_db)
):
    """
    Update patient clinical markers, histories, or screening dates, and recalculate guidelines.
    """
    patient = patient_service.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    updated = patient_service.update_patient(db, patient, patient_update)
    # Recalculate screenings on update
    screening_service.evaluate_and_save_patient_screenings(db, updated)
    return updated

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a patient record.
    """
    success = patient_service.delete_patient(db, patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    return None
