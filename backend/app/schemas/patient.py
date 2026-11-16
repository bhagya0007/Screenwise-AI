from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class PatientBase(BaseModel):
    first_name: str = Field(..., max_length=50)
    last_name: str = Field(..., max_length=50)
    date_of_birth: date
    sex: str = Field(..., description="female, male, other")
    email: Optional[str] = None
    phone: Optional[str] = None

    bmi: Optional[float] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    is_smoker: bool = False
    has_diabetes_history: bool = False
    has_hypertension: bool = False
    fasting_glucose: Optional[float] = None
    hba1c: Optional[float] = None
    total_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    ldl_cholesterol: Optional[float] = None

    family_history_diabetes: bool = False
    family_history_cad: bool = False
    family_history_breast_cancer: bool = False
    family_history_colorectal_cancer: bool = False
    family_history_cervical_cancer: bool = False
    cervix_present: bool = True

    last_diabetes_screen_date: Optional[date] = None
    last_lipid_panel_date: Optional[date] = None
    last_bp_check_date: Optional[date] = None
    last_mammogram_date: Optional[date] = None
    last_cervical_screen_date: Optional[date] = None
    last_colorectal_screen_date: Optional[date] = None
    colorectal_screen_type: Optional[str] = "colonoscopy"

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    bmi: Optional[float] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    is_smoker: Optional[bool] = None
    has_diabetes_history: Optional[bool] = None
    has_hypertension: Optional[bool] = None
    fasting_glucose: Optional[float] = None
    hba1c: Optional[float] = None
    total_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    ldl_cholesterol: Optional[float] = None

    family_history_diabetes: Optional[bool] = None
    family_history_cad: Optional[bool] = None
    family_history_breast_cancer: Optional[bool] = None
    family_history_colorectal_cancer: Optional[bool] = None
    family_history_cervical_cancer: Optional[bool] = None
    cervix_present: Optional[bool] = None

    last_diabetes_screen_date: Optional[date] = None
    last_lipid_panel_date: Optional[date] = None
    last_bp_check_date: Optional[date] = None
    last_mammogram_date: Optional[date] = None
    last_cervical_screen_date: Optional[date] = None
    last_colorectal_screen_date: Optional[date] = None
    colorectal_screen_type: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    age: int
    full_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
