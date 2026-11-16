"""
ScreenWise AI - Abu Dhabi / UAE Preventive Screening Guidelines Configuration
Authoritative Sources:
- Department of Health Abu Dhabi (DoH)
- Abu Dhabi Public Health Centre (ADPHC)
- IFHAS (Periodic Comprehensive Health Screening Program)
- Weqaya Cardiovascular Risk Assessment Framework
- National Cancer Screening Guidelines (UAE / Abu Dhabi)
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

@dataclass(frozen=True)
class GuidelineMetadata:
    authority: str
    guideline_name: str
    version_or_year: str
    publication_source: str
    applicable_population: str
    programme_name: str
    is_verified: bool = True
    verification_notes: Optional[str] = None

@dataclass
class DiabetesGuidelineConfig:
    metadata: GuidelineMetadata = field(default_factory=lambda: GuidelineMetadata(
        authority="Department of Health - Abu Dhabi (DoH) & Abu Dhabi Public Health Centre (ADPHC)",
        guideline_name="ADPHC / DoH Adult Diabetes & Cardiometabolic Screening Guidelines (IFHAS Program)",
        version_or_year="2024 Edition",
        publication_source="ADPHC Standards for Periodic Health Screening / IFHAS Framework",
        applicable_population="Adults aged 18-75 in Abu Dhabi",
        programme_name="IFHAS Periodic Health Screening"
    ))
    # Screening Age Thresholds
    universal_screening_min_age: int = 30  # Routine general population screening begins at age 30 in UAE
    opportunistic_screening_min_age: int = 18  # For individuals with BMI >= 25 (or >= 23 for South/East Asian descent) or risk factors
    screening_max_age: int = 75
    
    # BMI Risk Thresholds
    overweight_bmi_general: float = 25.0
    overweight_bmi_asian: float = 23.0
    obesity_bmi: float = 30.0

    # Glycemic Cutoffs (mg/dL and %)
    normal_fasting_glucose_max: float = 99.0
    prediabetes_fasting_glucose_min: float = 100.0
    prediabetes_fasting_glucose_max: float = 125.0
    provisional_diabetes_fasting_glucose: float = 126.0

    normal_hba1c_max: float = 5.6
    prediabetes_hba1c_min: float = 5.7
    prediabetes_hba1c_max: float = 6.4
    provisional_diabetes_hba1c: float = 6.5

    # Recommended Intervals (Years)
    normal_interval_years: float = 3.0
    prediabetes_interval_years: float = 1.0  # Annual surveillance for prediabetes
    high_risk_interval_years: float = 1.0

    # Programme Separation
    programme_eligibility_description: str = (
        "IFHAS Comprehensive Screening covers periodic glycemic testing (FPG / HbA1c) every 2-3 years "
        "for Thiqa cardholders aged 18-75 across Abu Dhabi primary care health centers."
    )
    clinical_consideration_note: str = (
        "Opportunistic screening is clinically recommended annually for any adult with overweight/obesity, "
        "hypertension, history of gestational diabetes, or first-degree family history of type 2 diabetes."
    )

@dataclass
class CardiovascularGuidelineConfig:
    metadata: GuidelineMetadata = field(default_factory=lambda: GuidelineMetadata(
        authority="Department of Health - Abu Dhabi (DoH) & Abu Dhabi Public Health Centre (ADPHC)",
        guideline_name="ADPHC / Weqaya Cardiovascular Disease Prevention & Blood Pressure Standard",
        version_or_year="2024 Edition",
        publication_source="Abu Dhabi Public Health Centre IFHAS & Weqaya NCD Standards",
        applicable_population="Adults aged 18-75 in Abu Dhabi",
        programme_name="Weqaya / IFHAS Cardiometabolic Assessment"
    ))
    # Blood Pressure Thresholds (mmHg)
    normal_sbp_max: int = 119
    normal_dbp_max: int = 79
    elevated_sbp_min: int = 120
    elevated_sbp_max: int = 129
    stage1_htn_sbp_min: int = 130
    stage1_htn_dbp_min: int = 80
    stage2_htn_sbp_min: int = 140
    stage2_htn_dbp_min: int = 90
    urgency_htn_sbp_min: int = 180
    urgency_htn_dbp_min: int = 120

    # Lipid Cutoffs (mg/dL)
    desirable_total_cholesterol_max: float = 199.0
    borderline_high_total_cholesterol_min: float = 200.0
    high_total_cholesterol_min: float = 240.0

    optimal_ldl_max: float = 99.0
    borderline_high_ldl_min: float = 130.0
    high_ldl_min: float = 160.0
    very_high_ldl_min: float = 190.0

    low_hdl_men: float = 40.0
    low_hdl_women: float = 50.0

    # Intervals (Years)
    normal_bp_interval_years: float = 1.0  # Annual routine BP measurement
    elevated_bp_interval_years: float = 0.5  # Semi-annual recheck if elevated
    lipid_routine_interval_years: float = 3.0  # Every 3 years under IFHAS for adults >= 20
    lipid_high_risk_interval_years: float = 1.0  # Annual if dyslipidemic, smoker, or diabetic

    # Risk Scoring Policy
    risk_scoring_policy: str = (
        "Strict clinical safety policy: Clinical 10-year CVD risk score is ONLY calculated if an authoritative, "
        "validated algorithm (e.g., WHO/ISH EMRO or ACC/AHA Pooled Cohort Equations) is selected AND all required "
        "inputs (age, sex, systolic BP, treated status, total cholesterol, HDL, smoking, diabetes) are complete. "
        "Never invent arbitrary scores or pseudo-probabilities."
    )
    programme_eligibility_description: str = (
        "IFHAS / Weqaya screening in Abu Dhabi provides full cardiovascular risk stratification, lipid profiling, "
        "and automated recording into the Malaffi Health Information Exchange."
    )

@dataclass
class BreastCancerGuidelineConfig:
    metadata: GuidelineMetadata = field(default_factory=lambda: GuidelineMetadata(
        authority="Abu Dhabi Public Health Centre (ADPHC) & Department of Health - Abu Dhabi (DoH)",
        guideline_name="ADPHC Breast Cancer Screening Pathway & Clinical Practice Guidelines",
        version_or_year="2024 Edition",
        publication_source="ADPHC Cancer Prevention and Control Directorate / Check What Really Matters Campaign",
        applicable_population="Adult females residing in Abu Dhabi",
        programme_name="ADPHC Cancer Early Detection Programme"
    ))
    # Routine Screening Ages (Years)
    cbe_min_age: int = 20  # Clinical Breast Exam (CBE) recommended every 3 years for ages 20-39
    cbe_max_age: int = 39
    mammography_min_age: int = 40  # Routine screening mammography begins at age 40
    mammography_max_age: int = 75

    # Intervals (Years)
    cbe_interval_years: float = 3.0
    routine_mammography_interval_years: float = 2.0  # Biennial mammography for average-risk women
    high_risk_mammography_interval_years: float = 1.0  # Annual screening for elevated hereditary risk

    # High Risk Thresholds
    high_risk_start_age: int = 30  # High-risk women start annual mammography / MRI at age 30 or 10 yrs before relative
    relative_age_delta: int = 10

    programme_eligibility_description: str = (
        "ADPHC Breast Cancer Early Detection Programme covers biennial screening mammograms for eligible "
        "women aged 40-75 at DoH-licensed mammography screening centers in Abu Dhabi."
    )

@dataclass
class CervicalCancerGuidelineConfig:
    metadata: GuidelineMetadata = field(default_factory=lambda: GuidelineMetadata(
        authority="Abu Dhabi Public Health Centre (ADPHC) & Department of Health - Abu Dhabi (DoH)",
        guideline_name="ADPHC Cervical Cancer Screening Standard & Algorithm",
        version_or_year="2024 Edition",
        publication_source="ADPHC Standards for Cervical Screening and Human Papillomavirus Prevention",
        applicable_population="Asymptomatic females with a cervix aged 25-65 in Abu Dhabi",
        programme_name="ADPHC Cervical Early Detection Programme"
    ))
    # Age Brackets (Years)
    screening_min_age: int = 25
    co_test_or_hpv_min_age: int = 30  # HPV testing preferred for age 30+
    screening_max_age: int = 65

    # Intervals (Years)
    cytology_alone_interval_years: float = 3.0  # Cervical cytology (Pap) every 3 years for ages 25-29 (or 30-65 if HPV unavailable)
    hpv_dna_or_cotest_interval_years: float = 5.0  # High-risk HPV alone or co-testing every 5 years for ages 30-65

    programme_eligibility_description: str = (
        "ADPHC Cervical Screening Programme provides subsidized or covered screening for women aged 25-65 "
        "with a cervix through primary healthcare clinics and women's health centers in Abu Dhabi."
    )

@dataclass
class ColorectalCancerGuidelineConfig:
    metadata: GuidelineMetadata = field(default_factory=lambda: GuidelineMetadata(
        authority="Abu Dhabi Public Health Centre (ADPHC) & Department of Health - Abu Dhabi (DoH)",
        guideline_name="ADPHC Colorectal Cancer Screening Standard & Clinical Algorithm",
        version_or_year="2024 Edition",
        publication_source="ADPHC Cancer Early Detection Guidelines (Specific to UAE Epidemiology)",
        applicable_population="Average and increased risk adults in Abu Dhabi aged 40-75",
        programme_name="ADPHC Colorectal Cancer Early Detection Programme"
    ))
    # Screening Age Thresholds
    # CRITICAL: Abu Dhabi / UAE begins routine colorectal screening at AGE 40 (unlike US/UK 45/50)
    routine_screening_min_age: int = 40
    routine_screening_max_age: int = 75
    
    # High-Risk Starting Age
    high_risk_start_age: int = 35  # Or 10 years earlier than youngest affected first-degree relative
    relative_age_delta: int = 10

    # Approved Screening Modalities & Intervals (Years)
    fit_interval_years: float = 1.0  # Fecal Immunochemical Test (FIT) annually
    colonoscopy_routine_interval_years: float = 10.0  # Screening colonoscopy every 10 years if normal
    colonoscopy_high_risk_interval_years: float = 5.0  # Colonoscopy every 5 years for high risk

    # Liquid Biopsy / Blood-based Biomarker Note (Emerging in Abu Dhabi)
    liquid_biopsy_status: str = "awaiting guideline verification for universal average-risk replacement"

    programme_eligibility_description: str = (
        "ADPHC Colorectal Cancer Early Detection Programme actively provides annual FIT stool kits "
        "and screening colonoscopy for all Abu Dhabi residents aged 40 to 75."
    )

@dataclass
class MasterGuidelineRegistry:
    diabetes: DiabetesGuidelineConfig = field(default_factory=DiabetesGuidelineConfig)
    cardiovascular: CardiovascularGuidelineConfig = field(default_factory=CardiovascularGuidelineConfig)
    cancer_breast: BreastCancerGuidelineConfig = field(default_factory=BreastCancerGuidelineConfig)
    cancer_cervical: CervicalCancerGuidelineConfig = field(default_factory=CervicalCancerGuidelineConfig)
    cancer_colorectal: ColorectalCancerGuidelineConfig = field(default_factory=ColorectalCancerGuidelineConfig)

# Default global registry singleton
GUIDELINES_REGISTRY = MasterGuidelineRegistry()
