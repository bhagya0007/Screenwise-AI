import json
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class MedicalHistory(Base):
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    existing_conditions = Column(Text, nullable=False, default="[]") # JSON list
    family_history = Column(Text, nullable=False, default="[]") # JSON list
    smoking_status = Column(String(50), nullable=False, default="never_smoker") # "active_smoker", "former_smoker", "never_smoker"
    relevant_lifestyle_factors = Column(Text, nullable=False, default="{}") # JSON dict
    available_clinical_measurements = Column(Text, nullable=False, default="{}") # JSON dict
    cervix_present = Column(Boolean, nullable=False, default=True)

    # Relationship
    patient = relationship("Patient", back_populates="medical_history")

    @property
    def conditions_list(self) -> list:
        try:
            return json.loads(self.existing_conditions or "[]")
        except Exception:
            return []

    @conditions_list.setter
    def conditions_list(self, val):
        self.existing_conditions = json.dumps(val if isinstance(val, list) else [val])

    @property
    def family_history_list(self) -> list:
        try:
            return json.loads(self.family_history or "[]")
        except Exception:
            return []

    @family_history_list.setter
    def family_history_list(self, val):
        self.family_history = json.dumps(val if isinstance(val, list) else [val])

    @property
    def lifestyle(self) -> dict:
        try:
            return json.loads(self.relevant_lifestyle_factors or "{}")
        except Exception:
            return {}

    @lifestyle.setter
    def lifestyle(self, val):
        self.relevant_lifestyle_factors = json.dumps(val if isinstance(val, dict) else {})

    @property
    def measurements(self) -> dict:
        try:
            return json.loads(self.available_clinical_measurements or "{}")
        except Exception:
            return {}

    @measurements.setter
    def measurements(self, val):
        self.available_clinical_measurements = json.dumps(val if isinstance(val, dict) else {})
