"""
ScreenWise AI - Cervical Cancer Preventive Screening Assessment Module
Authoritative Reference:
- Abu Dhabi Public Health Centre (ADPHC) & Department of Health Abu Dhabi (DoH)
- Standards for Cervical Screening and Human Papillomavirus Prevention (2024 Edition)
- Supported by WHO Cervical Cancer Elimination Initiative and ASCCP Evidence-Based Guidelines
"""

from datetime import date
from typing import Dict, Any, List, Optional
from app.guidelines.base import (
    AssessmentResult,
    FlagStatus,
    ScreeningCategory,
    MANDATORY_SAFETY_DISCLAIMER
)
from app.guidelines.config import CervicalCancerGuidelineConfig, GUIDELINES_REGISTRY

def evaluate_cervical_cancer_screening(
    patient,
    config: Optional[CervicalCancerGuidelineConfig] = None
) -> AssessmentResult:
    """
    Evaluates cervical cancer screening eligibility, recall intervals, and anatomical appropriateness
    under Abu Dhabi Public Health Centre (ADPHC) clinical standards.
    """
    if config is None:
        config = GUIDELINES_REGISTRY.cancer_cervical

    today = date.today()
    age = getattr(patient, "age", 0)
    sex = str(getattr(patient, "sex", "")).strip().lower()
    cervix_present = getattr(patient, "cervix_present", True)
    last_screen_date = getattr(patient, "last_cervical_screen_date", None)

    relevant_factors: Dict[str, Any] = {
        "age": age,
        "sex": sex,
        "cervix_present": cervix_present,
        "last_cervical_screen_date": last_screen_date.isoformat() if last_screen_date else None,
    }

    missing_info: List[str] = []
    if sex in ["female", ""] and cervix_present and age >= config.screening_min_age and last_screen_date is None:
        missing_info.append("Historical cervical cytology (Pap) or HPV screening date")
    if cervix_present is None:
        missing_info.append("Surgical history regarding prior hysterectomy or cervix removal")

    guideline_ref = config.metadata.guideline_name
    guideline_ver = config.metadata.version_or_year
    programme_info = {
        "programme_name": config.metadata.programme_name,
        "eligibility_summary": config.programme_eligibility_description,
        "approved_modalities": [
            "High-Risk HPV DNA Testing (preferred for age 30-65)",
            "Liquid-Based Cervical Cytology / Pap smear (ages 25-29, or co-testing)",
            "HPV / Cytology Co-testing"
        ],
    }

    # Case 1: Biological male patients
    if sex == "male":
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_CERVICAL.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                "Cervical cancer screening is not clinically indicated for biological males due to anatomical absence of a cervix."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=[],
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="No cervical screening required.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="Not applicable",
            priority="routine",
            clinical_risk_tier="not_applicable",
            last_screened_date=None,
        )

    # Case 2: Post-hysterectomy with complete removal of cervix (for benign indications)
    if cervix_present is False:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_CERVICAL.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                "Patient has documented total hysterectomy with cervix removed for benign indications. "
                "Under ADPHC guidelines, routine cervical cytology and HPV screening are discontinued "
                "unless there is a past medical history of high-grade precancerous lesion (CIN 2/3) or cervical malignancy."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=[],
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="No routine cervical screening indicated. Confirm that prior hysterectomy was for benign disease and verify absence of CIN2+ history.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="Routine primary care",
            priority="routine",
            clinical_risk_tier="not_applicable",
            last_screened_date=None,
        )

    # Case 3: Female under minimum screening age (< 25)
    if age < config.screening_min_age:
        years_until_eligible = config.screening_min_age - age
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_CERVICAL.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                f"Patient is {age} years of age. Under ADPHC standards, routine cervical screening begins at age "
                f"{config.screening_min_age}. Screening before age 25 is not recommended for asymptomatic average-risk women "
                f"due to high rates of transient HPV infections that spontaneously regress without causing neoplasia."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=(
                f"Confirm HPV vaccination status (2- or 3-dose series) and plan baseline cervical screening upon reaching "
                f"age {config.screening_min_age} (in approximately {years_until_eligible} years)."
            ),
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing=f"Upon reaching age {config.screening_min_age}",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=None,
            next_due_date=date(today.year + years_until_eligible, today.month, min(today.day, 28)),
        )

    # Determine recommended interval based on age bracket
    # Age 25-29: Cytology every 3 years
    # Age 30-65: HPV alone or Co-test every 5 years (or Pap every 3 years if HPV test unavailable)
    if age < config.co_test_or_hpv_min_age:
        recommended_interval_years = config.cytology_alone_interval_years
        modality_guidance = "Cervical cytology (Pap smear) every 3 years (ages 25-29)."
    else:
        recommended_interval_years = config.hpv_dna_or_cotest_interval_years
        modality_guidance = "High-risk HPV testing alone every 5 years, or HPV/Cytology co-testing every 5 years (ages 30-65)."

    # Case 4: Eligible adult (Age 25-65) with no documented screening history
    if config.screening_min_age <= age <= config.screening_max_age and last_screen_date is None:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_CERVICAL.value,
            flag_status=FlagStatus.POTENTIALLY_DUE.value,
            reason_for_flag=(
                f"Patient is {age} years old with an intact cervix and meets ADPHC guideline eligibility for cervical screening "
                f"({modality_guidance}). No record of prior cervical cytology or HPV testing is documented in the medical record."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=(
                f"Schedule cervical screening appointment: {'Cervical cytology (Pap smear)' if age < 30 else 'High-risk HPV test or HPV/Pap co-test'} "
                f"at a licensed primary care clinic or women's health center."
            ),
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Absence of electronic screening date does not confirm patient was never screened at another private clinic.",
            suggested_timing="Within 30 days",
            priority="moderate",
            clinical_risk_tier="standard",
            last_screened_date=None,
        )

    # Case 5: Documented screening history available
    if last_screen_date is not None:
        elapsed_years = (today - last_screen_date).days / 365.25
        next_due_date = date(
            int(last_screen_date.year + recommended_interval_years),
            last_screen_date.month,
            min(last_screen_date.day, 28)
        )
        is_overdue = elapsed_years > recommended_interval_years
        is_due_soon = (recommended_interval_years - elapsed_years) <= 0.25 and not is_overdue

        if is_overdue:
            months_overdue = int(round((elapsed_years - recommended_interval_years) * 12))
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_CERVICAL.value,
                flag_status=FlagStatus.POTENTIALLY_OVERDUE.value,
                reason_for_flag=(
                    f"Last cervical screen was performed on {last_screen_date.isoformat()} ({round(elapsed_years, 1)} years ago). "
                    f"Based on age {age}, the recommended interval is {recommended_interval_years} year(s) ({modality_guidance}). "
                    f"Screening is potentially overdue by approximately {max(months_overdue, 1)} month(s)."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step=f"Schedule recall cervical screening appointment ({'HPV testing or co-testing' if age >= 30 else 'Cervical cytology'}).",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 14-30 days",
                priority="urgent",
                clinical_risk_tier="moderate",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        elif is_due_soon:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_CERVICAL.value,
                flag_status=FlagStatus.POTENTIALLY_DUE.value,
                reason_for_flag=(
                    f"Previous screening on {last_screen_date.isoformat()} is approaching the recommended "
                    f"{recommended_interval_years}-year recall window."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Plan upcoming cervical screening during regular healthcare visit.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 60 days",
                priority="routine",
                clinical_risk_tier="standard",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        else:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_CERVICAL.value,
                flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
                reason_for_flag=(
                    f"Cervical screening is up to date based on ADPHC guidelines. Last screened on "
                    f"{last_screen_date.isoformat()} ({round(elapsed_years, 1)} years ago, within the {recommended_interval_years}-year interval). "
                    f"Next screening is due on {next_due_date.isoformat()}."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Maintain routine preventive schedule; recall patient according to scheduled due date.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing=f"Routine recall on {next_due_date.isoformat()}",
                priority="routine",
                clinical_risk_tier="standard",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )

    # Case 6: Above age 65
    if age > config.screening_max_age:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_CERVICAL.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                f"Patient is {age} years of age (past the routine screening ceiling of age {config.screening_max_age}). "
                f"Under ADPHC guidelines, screening may be safely discontinued if the patient has had adequate negative prior screening "
                f"(3 consecutive negative cytology tests or 2 negative HPV tests within the preceding 10 years). "
                f"Physician review is required to verify prior documentation."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Clinician review of past 10-year cytology/HPV history to confirm eligibility for screening cessation.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="During next clinical review",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=last_screen_date,
        )

    # Fallback
    return AssessmentResult(
        screening_category=ScreeningCategory.CANCER_CERVICAL.value,
        flag_status=FlagStatus.INSUFFICIENT_INFORMATION.value,
        reason_for_flag="Patient record contains insufficient clinical details to determine cervical screening status.",
        relevant_patient_factors=relevant_factors,
        missing_information=missing_info,
        applicable_guideline_reference=guideline_ref,
        guideline_version=guideline_ver,
        suggested_next_step="Confirm gynecologic surgical history and review past screening records.",
        professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
        programme_eligibility=programme_info,
        suggested_timing="Within 30 days",
        priority="moderate",
        clinical_risk_tier="standard",
        last_screened_date=last_screen_date,
    )
