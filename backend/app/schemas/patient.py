from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class MedicalHistoryInput(BaseModel):
    existing_conditions: List[str] = []
    family_history: List[str] = []
    smoking_status: str = "never_smoker" # "active_smoker", "former_smoker", "never_smoker"
    relevant_lifestyle_factors: Dict[str, Any] = {}
    available_clinical_measurements: Dict[str, Any] = {}
    cervix_present: bool = True

class ScreeningHistoryInput(BaseModel):
    screening_type: str
    screening_date: date
    result_status: Optional[str] = "normal"
    notes: Optional[str] = None

class PatientCreate(BaseModel):
    patient_reference: Optional[str] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: date
    sex: str = Field(..., description="female, male, other")
    contact_info: Optional[Dict[str, Any]] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    # Measurements & clinical inputs
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
    cervix_present: bool = True

    # Prior screening dates
    last_diabetes_screen_date: Optional[date] = None
    last_lipid_panel_date: Optional[date] = None
    last_bp_check_date: Optional[date] = None
    last_mammogram_date: Optional[date] = None
    last_cervical_screen_date: Optional[date] = None
    last_colorectal_screen_date: Optional[date] = None
    colorectal_screen_type: Optional[str] = "colonoscopy"

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
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
    cervix_present: Optional[bool] = None

    last_diabetes_screen_date: Optional[date] = None
    last_lipid_panel_date: Optional[date] = None
    last_bp_check_date: Optional[date] = None
    last_mammogram_date: Optional[date] = None
    last_cervical_screen_date: Optional[date] = None
    last_colorectal_screen_date: Optional[date] = None
    colorectal_screen_type: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    patient_reference: str
    full_name: str
    first_name: str
    last_name: str
    date_of_birth: date
    sex: str
    age: int
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
    cervix_present: bool = True

    last_diabetes_screen_date: Optional[date] = None
    last_lipid_panel_date: Optional[date] = None
    last_bp_check_date: Optional[date] = None
    last_mammogram_date: Optional[date] = None
    last_cervical_screen_date: Optional[date] = None
    last_colorectal_screen_date: Optional[date] = None
    colorectal_screen_type: Optional[str] = "colonoscopy"

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
