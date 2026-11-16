from datetime import date
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class ScreeningHistory(Base):
    __tablename__ = "screening_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    screening_type = Column(String(50), nullable=False, index=True)
    # Types: "diabetes", "lipid_panel", "blood_pressure", "mammogram", "cervical_cytology", "colorectal"
    
    screening_date = Column(Date, nullable=False, index=True)
    result_status = Column(String(100), nullable=True) # e.g. "normal", "elevated", "negative", "colonoscopy", "fit"
    notes = Column(Text, nullable=True)

    # Relationship
    patient = relationship("Patient", back_populates="screening_history")
