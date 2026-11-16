"""
ScreenWise AI - Preventive Screening Assessment Engine Unit Tests
Tests authoritative Abu Dhabi (ADPHC / DoH / IFHAS / Weqaya) clinical rules,
safety constraints, borderline cases, and incomplete-data scenarios.
"""

import pytest
from datetime import date, timedelta
from app.guidelines.base import FlagStatus, ScreeningCategory, MANDATORY_SAFETY_DISCLAIMER
from app.guidelines.engine import (
    evaluate_all_screenings_typed,
    evaluate_all_screenings,
    evaluate_screening_pathway
)
from app.guidelines.diabetes import evaluate_diabetes_screening
from app.guidelines.cardiovascular import evaluate_cardiovascular_screening
from app.guidelines.cancer_breast import evaluate_breast_cancer_screening
from app.guidelines.cancer_cervical import evaluate_cervical_cancer_screening
from app.guidelines.cancer_colorectal import evaluate_colorectal_cancer_screening
from app.guidelines.config import GUIDELINES_REGISTRY

# Synthetic Patient Mock Helper
class SyntheticPatient:
    def __init__(self, **kwargs):
        self.id = kwargs.get("id", 999)
        self.patient_reference = kwargs.get("patient_reference", "SW-TEST")
        self.full_name = kwargs.get("full_name", "Synthetic Test Patient")
        self.date_of_birth = kwargs.get("date_of_birth", date(1980, 1, 1))
        self.sex = kwargs.get("sex", "female")
        self.bmi = kwargs.get("bmi", 23.5)
        self.systolic_bp = kwargs.get("systolic_bp", 118)
        self.diastolic_bp = kwargs.get("diastolic_bp", 76)
        self.is_smoker = kwargs.get("is_smoker", False)
        self.has_hypertension = kwargs.get("has_hypertension", False)
        self.has_diabetes_history = kwargs.get("has_diabetes_history", False)
        self.family_history_diabetes = kwargs.get("family_history_diabetes", False)
        self.family_history_cad = kwargs.get("family_history_cad", False)
        self.family_history_breast_cancer = kwargs.get("family_history_breast_cancer", False)
        self.family_history_colorectal_cancer = kwargs.get("family_history_colorectal_cancer", False)
        self.cervix_present = kwargs.get("cervix_present", True)
        self.fasting_glucose = kwargs.get("fasting_glucose", None)
        self.hba1c = kwargs.get("hba1c", None)
        self.total_cholesterol = kwargs.get("total_cholesterol", None)
        self.hdl_cholesterol = kwargs.get("hdl_cholesterol", None)
        self.ldl_cholesterol = kwargs.get("ldl_cholesterol", None)
        self.last_diabetes_screen_date = kwargs.get("last_diabetes_screen_date", None)
        self.last_lipid_panel_date = kwargs.get("last_lipid_panel_date", None)
        self.last_bp_check_date = kwargs.get("last_bp_check_date", None)
        self.last_mammogram_date = kwargs.get("last_mammogram_date", None)
        self.last_cervical_screen_date = kwargs.get("last_cervical_screen_date", None)
        self.last_colorectal_screen_date = kwargs.get("last_colorectal_screen_date", None)
        self.colorectal_screen_type = kwargs.get("colorectal_screen_type", "colonoscopy")

    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

# ==============================================================================
# 1. DIABETES SCREENING TESTS
# ==============================================================================

def test_diabetes_young_healthy_adult_no_screening_gap():
    """Adult aged 24 with normal BMI and no risk factors: universal screening begins at age 30."""
    patient = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=24*365),
        bmi=21.8,
        family_history_diabetes=False,
        has_hypertension=False
    )
    res = evaluate_diabetes_screening(patient)
    assert res.screening_category == "diabetes"
    assert res.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "age 30" in res.reason_for_flag
    assert res.professional_review_requirement == MANDATORY_SAFETY_DISCLAIMER

def test_diabetes_prediabetes_annual_surveillance():
    """Patient with HbA1c in prediabetes range (5.9%) requires annual surveillance."""
    patient = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=48*365),
        bmi=28.4,
        hba1c=5.9,
        last_diabetes_screen_date=date.today() - timedelta(days=450) # 1.2 years ago
    )
    res = evaluate_diabetes_screening(patient)
    assert res.flag_status == FlagStatus.POTENTIALLY_OVERDUE.value
    assert "prediabetes" in res.reason_for_flag.lower()
    assert res.priority == "urgent"

def test_diabetes_established_diagnosis_requires_review():
    """Known diabetes history switches from asymptomatic screening to clinical management."""
    patient = SyntheticPatient(has_diabetes_history=True)
    res = evaluate_diabetes_screening(patient)
    assert res.flag_status == FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value
    assert "management" in res.reason_for_flag.lower()

def test_diabetes_provisional_elevated_never_diagnoses():
    """Elevated laboratory value flags for confirmatory testing without diagnosing."""
    patient = SyntheticPatient(
        fasting_glucose=134.0,
        hba1c=6.8
    )
    res = evaluate_diabetes_screening(patient)
    assert res.flag_status == FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value
    # Safety assertion: Engine must explicitly mention repeat confirmatory testing and not declare final diagnosis
    assert "provisional threshold" in res.reason_for_flag.lower()
    assert "does not constitute a clinical diagnosis" in res.reason_for_flag.lower()

# ==============================================================================
# 2. CARDIOVASCULAR HEALTH TESTS
# ==============================================================================

def test_cardiovascular_hypertensive_urgency_stage2():
    """Stage 2 Hypertension (152/96 mmHg) triggers urgent professional review."""
    patient = SyntheticPatient(
        systolic_bp=152,
        diastolic_bp=96,
        last_bp_check_date=date.today()
    )
    res = evaluate_cardiovascular_screening(patient)
    assert res.screening_category == "cardiovascular"
    assert res.flag_status == FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value
    assert res.priority == "urgent"
    assert "stage 2" in res.reason_for_flag.lower()

def test_cardiovascular_safety_no_pseudo_score_on_missing_data():
    """Missing lipid values must NOT generate an arbitrary cardiovascular risk score."""
    patient = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=55*365),
        systolic_bp=128,
        diastolic_bp=82,
        total_cholesterol=None, # Missing
        hdl_cholesterol=None,   # Missing
        last_bp_check_date=date.today() - timedelta(days=100)
    )
    res = evaluate_cardiovascular_screening(patient)
    # Must identify missing information
    assert any("lipid" in m.lower() or "cholesterol" in m.lower() for m in res.missing_information)
    # Uncertainty note must state formal risk scoring is deferred
    assert "risk scoring deferred" in res.uncertainty_note.lower()

def test_cardiovascular_up_to_date_normal():
    """Patient with recent normal BP and desirable lipids has no gap identified."""
    patient = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=42*365),
        systolic_bp=116,
        diastolic_bp=74,
        total_cholesterol=175.0,
        hdl_cholesterol=52.0,
        ldl_cholesterol=98.0,
        last_bp_check_date=date.today() - timedelta(days=90),
        last_lipid_panel_date=date.today() - timedelta(days=300)
    )
    res = evaluate_cardiovascular_screening(patient)
    assert res.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value

# ==============================================================================
# 3. CANCER SCREENING TESTS
# ==============================================================================

def test_breast_cancer_male_not_indicated():
    """Biological male patient is not indicated for routine population mammography."""
    patient = SyntheticPatient(sex="male", date_of_birth=date.today() - timedelta(days=50*365))
    res = evaluate_breast_cancer_screening(patient)
    assert res.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "biological males" in res.reason_for_flag.lower()
    assert res.clinical_risk_tier == "not_applicable"

def test_breast_cancer_age_39_vs_40_borderline():
    """At age 39, routine screening starts at 40; at age 40, screening is potentially due."""
    today = date.today()
    patient_39 = SyntheticPatient(
        sex="female",
        date_of_birth=date(today.year - 39, today.month, min(today.day, 28)),
        last_mammogram_date=None
    )
    res_39 = evaluate_breast_cancer_screening(patient_39)
    assert res_39.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "40" in res_39.reason_for_flag

    patient_40 = SyntheticPatient(
        sex="female",
        date_of_birth=date(today.year - 40, today.month, min(today.day, 28)),
        last_mammogram_date=None
    )
    res_40 = evaluate_breast_cancer_screening(patient_40)
    assert res_40.flag_status == FlagStatus.POTENTIALLY_DUE.value
    assert "40" in res_40.reason_for_flag

def test_breast_cancer_high_hereditary_risk():
    """First-degree family history triggers high-risk pathway and earlier surveillance."""
    today = date.today()
    patient = SyntheticPatient(
        sex="female",
        date_of_birth=date(today.year - 34, today.month, min(today.day, 28)),
        family_history_breast_cancer=True,
        last_mammogram_date=None
    )
    res = evaluate_breast_cancer_screening(patient)
    assert res.flag_status == FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value
    assert res.priority == "urgent"
    assert res.clinical_risk_tier == "high"

def test_cervical_cancer_post_hysterectomy():
    """Total hysterectomy with cervix removed for benign disease discontinues screening."""
    today = date.today()
    patient = SyntheticPatient(
        sex="female",
        date_of_birth=date(today.year - 44, today.month, min(today.day, 28)),
        cervix_present=False
    )
    res = evaluate_cervical_cancer_screening(patient)
    assert res.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "hysterectomy" in res.reason_for_flag.lower()

def test_cervical_cancer_male_not_indicated():
    """Male patient has no cervical screening gap."""
    patient = SyntheticPatient(sex="male")
    res = evaluate_cervical_cancer_screening(patient)
    assert res.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "absence of a cervix" in res.reason_for_flag.lower()

def test_cervical_cancer_overdue():
    """Female aged 35 with last screen 6 years ago is overdue (5-year interval for HPV)."""
    today = date.today()
    patient = SyntheticPatient(
        sex="female",
        date_of_birth=date(today.year - 35, today.month, min(today.day, 28)),
        cervix_present=True,
        last_cervical_screen_date=today - timedelta(days=6*365)
    )
    res = evaluate_cervical_cancer_screening(patient)
    assert res.flag_status == FlagStatus.POTENTIALLY_OVERDUE.value
    assert res.priority == "urgent"

def test_colorectal_abu_dhabi_age_40_threshold():
    """Abu Dhabi ADPHC standard initiates colorectal screening at AGE 40 (earlier than US 45)."""
    today = date.today()
    # Age 38: Not yet eligible
    patient_38 = SyntheticPatient(
        date_of_birth=date(today.year - 38, today.month, min(today.day, 28)),
        family_history_colorectal_cancer=False
    )
    res_38 = evaluate_colorectal_cancer_screening(patient_38)
    assert res_38.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value
    assert "40" in res_38.reason_for_flag

    # Age 40: Eligible, potentially due if no screening on record
    patient_40 = SyntheticPatient(
        date_of_birth=date(today.year - 40, today.month, min(today.day, 28)),
        last_colorectal_screen_date=None,
        family_history_colorectal_cancer=False
    )
    res_40 = evaluate_colorectal_cancer_screening(patient_40)
    assert res_40.flag_status == FlagStatus.POTENTIALLY_DUE.value
    assert "40" in res_40.reason_for_flag

def test_colorectal_annual_fit_vs_10yr_colonoscopy():
    """FIT is overdue after 1.5 years; colonoscopy is up to date after 4 years."""
    # FIT screened 1.5 years ago -> Overdue
    patient_fit = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=52*365),
        colorectal_screen_type="fit",
        last_colorectal_screen_date=date.today() - timedelta(days=550)
    )
    res_fit = evaluate_colorectal_cancer_screening(patient_fit)
    assert res_fit.flag_status == FlagStatus.POTENTIALLY_OVERDUE.value

    # Colonoscopy screened 4 years ago -> Up to date (10-yr interval)
    patient_colo = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=52*365),
        colorectal_screen_type="colonoscopy",
        last_colorectal_screen_date=date.today() - timedelta(days=4*365)
    )
    res_colo = evaluate_colorectal_cancer_screening(patient_colo)
    assert res_colo.flag_status == FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value

# ==============================================================================
# 4. MASTER ENGINE & SAFETY VERIFICATION
# ==============================================================================

def test_engine_evaluates_all_five_pathways_with_mandatory_safety():
    """Master engine evaluates all 5 pathways, ensuring mandatory disclaimer on 100% of outputs."""
    patient = SyntheticPatient(
        date_of_birth=date.today() - timedelta(days=45*365),
        sex="female"
    )
    results = evaluate_all_screenings_typed(patient)
    assert len(results) == 5
    categories = [r.screening_category for r in results]
    assert "diabetes" in categories
    assert "cardiovascular" in categories
    assert "cancer_breast" in categories
    assert "cancer_cervical" in categories
    assert "cancer_colorectal" in categories

    for r in results:
        # Strict Safety Assertions
        assert r.professional_review_requirement == MANDATORY_SAFETY_DISCLAIMER
        assert "not provide a medical diagnosis" in r.professional_review_requirement
        assert r.flag_status in [
            FlagStatus.POTENTIALLY_DUE.value,
            FlagStatus.POTENTIALLY_OVERDUE.value,
            FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            FlagStatus.INSUFFICIENT_INFORMATION.value,
            FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
        ]
        assert r.applicable_guideline_reference is not None
        assert r.guideline_version is not None
        assert isinstance(r.relevant_patient_factors, dict)
        assert isinstance(r.missing_information, list)

def test_legacy_format_mapping_maintains_compatibility():
    """Verify legacy dictionary projection works smoothly for UI and API serialization."""
    patient = SyntheticPatient()
    legacy_list = evaluate_all_screenings(patient)
    assert len(legacy_list) == 5
    for item in legacy_list:
        assert "category" in item
        assert "status" in item
        assert "risk_level" in item
        assert "flag_status" in item
        assert "reason_for_flag" in item
        assert "professional_review_requirement" in item
