import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.patient import Patient
from app.models.medical_history import MedicalHistory
from app.models.screening_history import ScreeningHistory
from app.schemas.patient import PatientCreate, PatientUpdate

def generate_next_patient_reference(db: Session) -> str:
    """Generates the next sequential unique patient reference (e.g. SW-00101)."""
    count = db.query(Patient).count()
    return f"SW-{str(101 + count).zfill(5)}"

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
                Patient.full_name.ilike(search_filter),
                Patient.patient_reference.ilike(search_filter),
                Patient.contact_info.ilike(search_filter)
            )
        )
    return query.order_by(Patient.id.asc()).offset(skip).limit(limit).all()

def get_patient_by_id(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patient_by_reference(db: Session, patient_reference: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.patient_reference == patient_reference).first()

def create_patient(db: Session, patient_in: PatientCreate) -> Patient:
    """
    Creates a new Patient, associated MedicalHistory, and initial ScreeningHistory entries
    within a safe database transaction.
    """
    ref = patient_in.patient_reference
    if not ref:
        ref = generate_next_patient_reference(db)

    # Prevent duplicate reference
    existing = db.query(Patient).filter(Patient.patient_reference == ref).first()
    if existing:
        ref = f"{ref}-{db.query(Patient).count() + 1}"

    # Build full_name
    full_name = patient_in.full_name
    if not full_name:
        first = patient_in.first_name or "Unknown"
        last = patient_in.last_name or ""
        full_name = f"{first} {last}".strip()

    contact_dict = patient_in.contact_info or {}
    if patient_in.email:
        contact_dict["email"] = patient_in.email
    if patient_in.phone:
        contact_dict["phone"] = patient_in.phone

    try:
        # Create Patient record
        patient = Patient(
            patient_reference=ref,
            full_name=full_name,
            date_of_birth=patient_in.date_of_birth,
            sex=patient_in.sex.lower(),
            contact_info=json.dumps(contact_dict)
        )
        db.add(patient)
        db.flush() # Flush to get patient.id

        # Build conditions and family histories
        conditions = []
        if patient_in.has_hypertension:
            conditions.append("hypertension")
        if patient_in.has_diabetes_history:
            conditions.append("diabetes")

        fam_history = []
        if patient_in.family_history_diabetes:
            fam_history.append("diabetes")
        if patient_in.family_history_cad:
            fam_history.append("early_cad")
        if patient_in.family_history_breast_cancer:
            fam_history.append("breast_cancer")
        if patient_in.family_history_colorectal_cancer:
            fam_history.append("colorectal_cancer")

        measurements = {}
        if patient_in.bmi is not None: measurements["bmi"] = patient_in.bmi
        if patient_in.systolic_bp is not None: measurements["systolic_bp"] = patient_in.systolic_bp
        if patient_in.diastolic_bp is not None: measurements["diastolic_bp"] = patient_in.diastolic_bp
        if patient_in.fasting_glucose is not None: measurements["fasting_glucose"] = patient_in.fasting_glucose
        if patient_in.hba1c is not None: measurements["hba1c"] = patient_in.hba1c
        if patient_in.total_cholesterol is not None: measurements["total_cholesterol"] = patient_in.total_cholesterol
        if patient_in.hdl_cholesterol is not None: measurements["hdl_cholesterol"] = patient_in.hdl_cholesterol
        if patient_in.ldl_cholesterol is not None: measurements["ldl_cholesterol"] = patient_in.ldl_cholesterol

        smoking_status = "active_smoker" if patient_in.is_smoker else "never_smoker"

        # Create MedicalHistory
        med_hist = MedicalHistory(
            patient_id=patient.id,
            existing_conditions=json.dumps(conditions),
            family_history=json.dumps(fam_history),
            smoking_status=smoking_status,
            relevant_lifestyle_factors=json.dumps({}),
            available_clinical_measurements=json.dumps(measurements),
            cervix_present=patient_in.cervix_present
        )
        db.add(med_hist)

        # Create ScreeningHistory records for any provided dates
        if patient_in.last_diabetes_screen_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="diabetes",
                screening_date=patient_in.last_diabetes_screen_date,
                result_status="normal"
            ))
        if patient_in.last_lipid_panel_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="lipid_panel",
                screening_date=patient_in.last_lipid_panel_date,
                result_status="normal"
            ))
        if patient_in.last_bp_check_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="blood_pressure",
                screening_date=patient_in.last_bp_check_date,
                result_status="normal"
            ))
        if patient_in.last_mammogram_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="mammogram",
                screening_date=patient_in.last_mammogram_date,
                result_status="normal"
            ))
        if patient_in.last_cervical_screen_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="cervical_cytology",
                screening_date=patient_in.last_cervical_screen_date,
                result_status="normal"
            ))
        if patient_in.last_colorectal_screen_date:
            db.add(ScreeningHistory(
                patient_id=patient.id,
                screening_type="colorectal",
                screening_date=patient_in.last_colorectal_screen_date,
                result_status=patient_in.colorectal_screen_type or "colonoscopy"
            ))

        db.commit()
        db.refresh(patient)
        return patient
    except Exception as e:
        db.rollback()
        raise e

def update_patient(db: Session, patient: Patient, patient_update: PatientUpdate) -> Patient:
    """Updates a patient's demographics, clinical measurements, and histories in a transaction."""
    try:
        if patient_update.full_name:
            patient.full_name = patient_update.full_name
        elif patient_update.first_name or patient_update.last_name:
            first = patient_update.first_name or patient.first_name
            last = patient_update.last_name or patient.last_name
            patient.full_name = f"{first} {last}".strip()

        if patient_update.date_of_birth:
            patient.date_of_birth = patient_update.date_of_birth
        if patient_update.sex:
            patient.sex = patient_update.sex.lower()

        # Update contact info
        contact = patient.parsed_contact
        if patient_update.email is not None:
            contact["email"] = patient_update.email
        if patient_update.phone is not None:
            contact["phone"] = patient_update.phone
        patient.contact_info = json.dumps(contact)

        # Update medical history
        if patient.medical_history:
            mh = patient.medical_history
            measurements = mh.measurements
            if patient_update.bmi is not None: measurements["bmi"] = patient_update.bmi
            if patient_update.systolic_bp is not None: measurements["systolic_bp"] = patient_update.systolic_bp
            if patient_update.diastolic_bp is not None: measurements["diastolic_bp"] = patient_update.diastolic_bp
            if patient_update.fasting_glucose is not None: measurements["fasting_glucose"] = patient_update.fasting_glucose
            if patient_update.hba1c is not None: measurements["hba1c"] = patient_update.hba1c
            if patient_update.total_cholesterol is not None: measurements["total_cholesterol"] = patient_update.total_cholesterol
            if patient_update.hdl_cholesterol is not None: measurements["hdl_cholesterol"] = patient_update.hdl_cholesterol
            if patient_update.ldl_cholesterol is not None: measurements["ldl_cholesterol"] = patient_update.ldl_cholesterol
            mh.available_clinical_measurements = json.dumps(measurements)

            if patient_update.is_smoker is not None:
                mh.smoking_status = "active_smoker" if patient_update.is_smoker else "never_smoker"
            if patient_update.cervix_present is not None:
                mh.cervix_present = patient_update.cervix_present

            conds = set(mh.conditions_list)
            if patient_update.has_hypertension is True: conds.add("hypertension")
            elif patient_update.has_hypertension is False: conds.discard("hypertension")
            if patient_update.has_diabetes_history is True: conds.add("diabetes")
            elif patient_update.has_diabetes_history is False: conds.discard("diabetes")
            mh.existing_conditions = json.dumps(list(conds))

            fam = set(mh.family_history_list)
            if patient_update.family_history_diabetes is True: fam.add("diabetes")
            elif patient_update.family_history_diabetes is False: fam.discard("diabetes")
            if patient_update.family_history_cad is True: fam.add("early_cad")
            elif patient_update.family_history_cad is False: fam.discard("early_cad")
            if patient_update.family_history_breast_cancer is True: fam.add("breast_cancer")
            elif patient_update.family_history_breast_cancer is False: fam.discard("breast_cancer")
            if patient_update.family_history_colorectal_cancer is True: fam.add("colorectal_cancer")
            elif patient_update.family_history_colorectal_cancer is False: fam.discard("colorectal_cancer")
            mh.family_history = json.dumps(list(fam))

        db.commit()
        db.refresh(patient)
        return patient
    except Exception as e:
        db.rollback()
        raise e

def delete_patient(db: Session, patient_id: int) -> bool:
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        return False
    try:
        db.delete(patient)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e
