from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.follow_up import FollowUp
from app.services.patient_service import create_patient
from app.services.assessment_service import run_patient_assessment
from app.schemas.patient import PatientCreate

def seed_database_if_empty(db: Session):
    count = db.query(Patient).count()
    if count > 0:
        return

    today = date.today()

    demo_patients = [
        PatientCreate(
            patient_reference="SW-00101",
            full_name="Robert Chen",
            first_name="Robert",
            last_name="Chen",
            date_of_birth=date(today.year - 52, 4, 15),
            sex="male",
            email="robert.chen@example.com",
            phone="(555) 234-5678",
            bmi=29.4,
            systolic_bp=138,
            diastolic_bp=88,
            is_smoker=True,
            has_hypertension=True,
            has_diabetes_history=False,
            fasting_glucose=108.0,
            hba1c=5.9,
            total_cholesterol=220.0,
            hdl_cholesterol=42.0,
            ldl_cholesterol=145.0,
            family_history_diabetes=True,
            family_history_cad=True,
            family_history_colorectal_cancer=True,
            cervix_present=False,
            last_diabetes_screen_date=today - timedelta(days=365 * 4),
            last_lipid_panel_date=today - timedelta(days=365 * 3),
            last_bp_check_date=today - timedelta(days=365 * 2),
            last_colorectal_screen_date=None,
            colorectal_screen_type="colonoscopy"
        ),
        PatientCreate(
            patient_reference="SW-00102",
            full_name="Elena Rodriguez",
            first_name="Elena",
            last_name="Rodriguez",
            date_of_birth=date(today.year - 42, 9, 20),
            sex="female",
            email="elena.rodriguez@example.com",
            phone="(555) 345-6789",
            bmi=24.2,
            systolic_bp=116,
            diastolic_bp=74,
            is_smoker=False,
            has_hypertension=False,
            has_diabetes_history=False,
            fasting_glucose=88.0,
            hba1c=5.2,
            total_cholesterol=178.0,
            hdl_cholesterol=58.0,
            ldl_cholesterol=102.0,
            family_history_breast_cancer=True,
            family_history_diabetes=False,
            cervix_present=True,
            last_mammogram_date=None,
            last_cervical_screen_date=today - timedelta(days=365 * 1),
            last_bp_check_date=today - timedelta(days=180),
            last_lipid_panel_date=today - timedelta(days=365 * 2),
            last_colorectal_screen_date=None
        ),
        PatientCreate(
            patient_reference="SW-00103",
            full_name="Marcus Washington",
            first_name="Marcus",
            last_name="Washington",
            date_of_birth=date(today.year - 64, 11, 5),
            sex="male",
            email="marcus.w@example.com",
            phone="(555) 456-7890",
            bmi=31.8,
            systolic_bp=146,
            diastolic_bp=92,
            is_smoker=False,
            has_hypertension=True,
            has_diabetes_history=False,
            fasting_glucose=119.0,
            hba1c=6.2,
            total_cholesterol=235.0,
            hdl_cholesterol=38.0,
            ldl_cholesterol=155.0,
            family_history_diabetes=True,
            family_history_cad=True,
            cervix_present=False,
            last_diabetes_screen_date=today - timedelta(days=365 * 2),
            last_bp_check_date=today - timedelta(days=400),
            last_lipid_panel_date=today - timedelta(days=365 * 6),
            last_colorectal_screen_date=today - timedelta(days=int(365 * 9.5)),
            colorectal_screen_type="colonoscopy"
        ),
        PatientCreate(
            patient_reference="SW-00104",
            full_name="Sarah Jenkins",
            first_name="Sarah",
            last_name="Jenkins",
            date_of_birth=date(today.year - 28, 2, 18),
            sex="female",
            email="sarah.j@example.com",
            phone="(555) 567-8901",
            bmi=21.8,
            systolic_bp=110,
            diastolic_bp=70,
            is_smoker=False,
            cervix_present=True,
            last_cervical_screen_date=today - timedelta(days=int(365 * 4.2)),
            last_bp_check_date=today - timedelta(days=120)
        ),
        PatientCreate(
            patient_reference="SW-00105",
            full_name="David Kim",
            first_name="David",
            last_name="Kim",
            date_of_birth=date(today.year - 47, 7, 8),
            sex="male",
            email="david.kim@example.com",
            phone="(555) 678-9012",
            bmi=26.5,
            systolic_bp=128,
            diastolic_bp=82,
            is_smoker=False,
            total_cholesterol=248.0,
            ldl_cholesterol=168.0,
            hdl_cholesterol=44.0,
            fasting_glucose=96.0,
            hba1c=5.4,
            cervix_present=False,
            last_colorectal_screen_date=None,
            last_lipid_panel_date=today - timedelta(days=365 * 7),
            last_diabetes_screen_date=today - timedelta(days=int(365 * 3.5)),
            last_bp_check_date=today - timedelta(days=450)
        ),
        PatientCreate(
            patient_reference="SW-00106",
            full_name="Patricia Adams",
            first_name="Patricia",
            last_name="Adams",
            date_of_birth=date(today.year - 58, 1, 30),
            sex="female",
            email="patricia.adams@example.com",
            phone="(555) 789-0123",
            bmi=27.2,
            systolic_bp=122,
            diastolic_bp=78,
            is_smoker=False,
            cervix_present=True,
            last_mammogram_date=today - timedelta(days=365 * 1),
            last_cervical_screen_date=today - timedelta(days=365 * 2),
            last_colorectal_screen_date=today - timedelta(days=365 * 3),
            colorectal_screen_type="colonoscopy",
            last_diabetes_screen_date=today - timedelta(days=365 * 1),
            last_lipid_panel_date=today - timedelta(days=365 * 2),
            last_bp_check_date=today - timedelta(days=150)
        )
    ]

    for p_in in demo_patients:
        patient = create_patient(db, p_in)
        # Run guideline evaluation & create recommendations
        run_patient_assessment(db, patient)

        # Seed sample follow-ups for flagged/overdue items
        if patient.full_name == "Robert Chen":
            db.add(FollowUp(
                patient_id=patient.id,
                title="Gastroenterology Consultation for Screening Colonoscopy",
                action_type="consultation",
                status="pending",
                priority="urgent",
                due_date=today + timedelta(days=14),
                assigned_provider="Dr. Henderson (GI)",
                notes="Patient is 52yo with paternal history of colorectal cancer. Colonoscopy strongly advised."
            ))
            db.add(FollowUp(
                patient_id=patient.id,
                title="Fasting Lipid Profile & Repeat Blood Pressure Check",
                action_type="lab_test",
                status="scheduled",
                priority="moderate",
                due_date=today + timedelta(days=7),
                scheduled_date=today + timedelta(days=7),
                assigned_provider="Quest Diagnostics",
                notes="Fasting 12 hours required before blood draw."
            ))
        elif patient.full_name == "Elena Rodriguez":
            db.add(FollowUp(
                patient_id=patient.id,
                title="Bilateral 3D Screening Digital Mammogram",
                action_type="imaging",
                status="pending",
                priority="urgent",
                due_date=today + timedelta(days=21),
                assigned_provider="Valley Breast Care Imaging Center",
                notes="Initial baseline mammogram for 42yo female with first-degree maternal history."
            ))
        elif patient.full_name == "Sarah Jenkins":
            db.add(FollowUp(
                patient_id=patient.id,
                title="Cervical Cytology (Pap smear) Clinic Appointment",
                action_type="consultation",
                status="scheduled",
                priority="moderate",
                due_date=today + timedelta(days=10),
                scheduled_date=today + timedelta(days=10),
                assigned_provider="Women's Health Associates",
                notes="Overdue for routine 3-year cytology."
            ))
        elif patient.full_name == "Patricia Adams":
            db.add(FollowUp(
                patient_id=patient.id,
                title="Annual Preventive Wellness Review",
                action_type="consultation",
                status="completed",
                priority="routine",
                due_date=today - timedelta(days=30),
                scheduled_date=today - timedelta(days=30),
                completion_date=today - timedelta(days=30),
                assigned_provider="Dr. Vance (PCP)",
                notes="All preventive screening up to date. Continue regular physical activity and diet.",
                result_summary="All screenings up to date."
            ))

    db.commit()
