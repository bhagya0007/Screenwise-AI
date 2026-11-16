import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    assessment_date = Column(DateTime, default=utcnow, nullable=False, index=True)
    identified_flags = Column(Text, nullable=False, default="[]") # JSON list of flags
    explanation = Column(Text, nullable=False) # Detailed clinical rationale
    missing_information = Column(Text, nullable=False, default="[]") # JSON list of missing information
    guideline_version = Column(String(100), nullable=False, default="USPSTF 2024 / ADA 2024 / ACC-AHA 2023")
    review_status = Column(String(50), nullable=False, default="pending_review") # "pending_review", "reviewed", "acknowledged"

    # Relationships
    patient = relationship("Patient", back_populates="assessments")
    recommendations = relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")

    @property
    def flags_list(self) -> list:
        try:
            return json.loads(self.identified_flags or "[]")
        except Exception:
            return []

    @flags_list.setter
    def flags_list(self, val):
        self.identified_flags = json.dumps(val if isinstance(val, list) else [val])

    @property
    def missing_info_list(self) -> list:
        try:
            return json.loads(self.missing_information or "[]")
        except Exception:
            return []

    @missing_info_list.setter
    def missing_info_list(self, val):
        self.missing_information = json.dumps(val if isinstance(val, list) else [val])
