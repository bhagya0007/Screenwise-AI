from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

def get_patients(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
) -> List[Patient]:
    query = db.query(Patient)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_filter),
                Patient.last_name.ilike(search_filter),
                Patient.email.ilike(search_filter)
            )
        )
    return query.order_by(Patient.last_name, Patient.first_name).offset(skip).limit(limit).all()

def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def create_patient(db: Session, patient_in: PatientCreate) -> Patient:
    patient_data = patient_in.model_dump()
    patient = Patient(**patient_data)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def update_patient(db: Session, patient: Patient, patient_update: PatientUpdate) -> Patient:
    update_data = patient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient

def delete_patient(db: Session, patient_id: int) -> bool:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return False
    db.delete(patient)
    db.commit()
    return True
