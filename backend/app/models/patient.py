from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(String(10), nullable=False) # "female", "male", "other"
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)

    # Vitals & clinical risk markers
    bmi = Column(Float, nullable=True)
    systolic_bp = Column(Integer, nullable=True)
    diastolic_bp = Column(Integer, nullable=True)
    is_smoker = Column(Boolean, default=False)
    has_diabetes_history = Column(Boolean, default=False)
    has_hypertension = Column(Boolean, default=False)
    fasting_glucose = Column(Float, nullable=True) # mg/dL
    hba1c = Column(Float, nullable=True) # %
    total_cholesterol = Column(Float, nullable=True) # mg/dL
    hdl_cholesterol = Column(Float, nullable=True) # mg/dL
    ldl_cholesterol = Column(Float, nullable=True) # mg/dL

    # Family & Pathway histories
    family_history_diabetes = Column(Boolean, default=False)
    family_history_cad = Column(Boolean, default=False)
    family_history_breast_cancer = Column(Boolean, default=False)
    family_history_colorectal_cancer = Column(Boolean, default=False)
    family_history_cervical_cancer = Column(Boolean, default=False)
    cervix_present = Column(Boolean, default=True) # relevant for cervical screening

    # Last recorded screening dates
    last_diabetes_screen_date = Column(Date, nullable=True)
    last_lipid_panel_date = Column(Date, nullable=True)
    last_bp_check_date = Column(Date, nullable=True)
    last_mammogram_date = Column(Date, nullable=True)
    last_cervical_screen_date = Column(Date, nullable=True)
    last_colorectal_screen_date = Column(Date, nullable=True)
    colorectal_screen_type = Column(String(50), nullable=True) # "colonoscopy", "fit", "stool_dna"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    screenings = relationship("ScreeningAssessment", back_populates="patient", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUpTask", back_populates="patient", cascade="all, delete-orphan")

    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
