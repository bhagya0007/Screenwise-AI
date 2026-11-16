import json
from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_reference = Column(String(30), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String(15), nullable=False) # "female", "male", "other"
    contact_info = Column(Text, nullable=True, default="{}")
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    medical_history = relationship(
        "MedicalHistory",
        back_populates="patient",
        uselist=False,
        cascade="all, delete-orphan"
    )
    screening_history = relationship(
        "ScreeningHistory",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="desc(ScreeningHistory.screening_date)"
    )
    assessments = relationship(
        "Assessment",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="desc(Assessment.assessment_date)"
    )
    recommendations = relationship(
        "Recommendation",
        back_populates="patient",
        cascade="all, delete-orphan"
    )
    followups = relationship(
        "FollowUp",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="FollowUp.due_date"
    )

    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def parsed_contact(self) -> dict:
        try:
            return json.loads(self.contact_info or "{}")
        except Exception:
            return {}

    @property
    def email(self) -> str:
        return self.parsed_contact.get("email", "")

    @property
    def phone(self) -> str:
        return self.parsed_contact.get("phone", "")

    @property
    def first_name(self) -> str:
        parts = self.full_name.strip().split(" ")
        return parts[0] if parts else ""

    @property
    def last_name(self) -> str:
        parts = self.full_name.strip().split(" ")
        return " ".join(parts[1:]) if len(parts) > 1 else ""

    # Measurement helpers from medical_history
    @property
    def bmi(self):
        if self.medical_history:
            return self.medical_history.measurements.get("bmi")
        return None

    @property
    def systolic_bp(self):
        if self.medical_history:
            return self.medical_history.measurements.get("systolic_bp")
        return None

    @property
    def diastolic_bp(self):
        if self.medical_history:
            return self.medical_history.measurements.get("diastolic_bp")
        return None

    @property
    def fasting_glucose(self):
        if self.medical_history:
            return self.medical_history.measurements.get("fasting_glucose")
        return None

    @property
    def hba1c(self):
        if self.medical_history:
            return self.medical_history.measurements.get("hba1c")
        return None

    @property
    def total_cholesterol(self):
        if self.medical_history:
            return self.medical_history.measurements.get("total_cholesterol")
        return None

    @property
    def hdl_cholesterol(self):
        if self.medical_history:
            return self.medical_history.measurements.get("hdl_cholesterol")
        return None

    @property
    def ldl_cholesterol(self):
        if self.medical_history:
            return self.medical_history.measurements.get("ldl_cholesterol")
        return None

    @property
    def is_smoker(self) -> bool:
        if self.medical_history:
            return self.medical_history.smoking_status in ["active_smoker", "current", True]
        return False

    @property
    def has_hypertension(self) -> bool:
        if self.medical_history:
            return "hypertension" in self.medical_history.conditions_list
        return False

    @property
    def has_diabetes_history(self) -> bool:
        if self.medical_history:
            return "diabetes" in self.medical_history.conditions_list
        return False

    @property
    def family_history_diabetes(self) -> bool:
        if self.medical_history:
            return "diabetes" in self.medical_history.family_history_list
        return False

    @property
    def family_history_cad(self) -> bool:
        if self.medical_history:
            return "early_cad" in self.medical_history.family_history_list or "cad" in self.medical_history.family_history_list
        return False

    @property
    def family_history_breast_cancer(self) -> bool:
        if self.medical_history:
            return "breast_cancer" in self.medical_history.family_history_list
        return False

    @property
    def family_history_colorectal_cancer(self) -> bool:
        if self.medical_history:
            return "colorectal_cancer" in self.medical_history.family_history_list
        return False

    @property
    def cervix_present(self) -> bool:
        if self.medical_history:
            return self.medical_history.cervix_present
        return self.sex == "female"

    # Last screening dates from screening_history
    def get_last_screening_date(self, screening_type: str) -> date | None:
        if not self.screening_history:
            return None
        for sh in self.screening_history:
            if sh.screening_type == screening_type:
                return sh.screening_date
        return None

    @property
    def last_diabetes_screen_date(self) -> date | None:
        return self.get_last_screening_date("diabetes")

    @property
    def last_lipid_panel_date(self) -> date | None:
        return self.get_last_screening_date("lipid_panel")

    @property
    def last_bp_check_date(self) -> date | None:
        return self.get_last_screening_date("blood_pressure")

    @property
    def last_mammogram_date(self) -> date | None:
        return self.get_last_screening_date("mammogram")

    @property
    def last_cervical_screen_date(self) -> date | None:
        return self.get_last_screening_date("cervical_cytology")

    @property
    def last_colorectal_screen_date(self) -> date | None:
        return self.get_last_screening_date("colorectal")

    @property
    def colorectal_screen_type(self) -> str:
        for sh in self.screening_history:
            if sh.screening_type == "colorectal":
                return sh.result_status or "colonoscopy"
        return "colonoscopy"
