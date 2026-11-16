"""
ScreenWise AI - Breast Cancer Preventive Screening Assessment Module
Authoritative Reference:
- Abu Dhabi Public Health Centre (ADPHC) & Department of Health Abu Dhabi (DoH)
- ADPHC Cancer Prevention and Control Directorate: Breast Cancer Screening Pathway (2024 Edition)
- Supported by UAE National Cancer Guidelines and international comparative standards (USPSTF 2024)
"""

from datetime import date
from typing import Dict, Any, List, Optional
from app.guidelines.base import (
    AssessmentResult,
    FlagStatus,
    ScreeningCategory,
    MANDATORY_SAFETY_DISCLAIMER
)
from app.guidelines.config import BreastCancerGuidelineConfig, GUIDELINES_REGISTRY

def evaluate_breast_cancer_screening(
    patient,
    config: Optional[BreastCancerGuidelineConfig] = None
) -> AssessmentResult:
    """
    Evaluates breast cancer screening eligibility, recall intervals, and risk flags
    under Abu Dhabi Public Health Centre (ADPHC) standards.
    """
    if config is None:
        config = GUIDELINES_REGISTRY.cancer_breast

    today = date.today()
    age = getattr(patient, "age", 0)
    sex = str(getattr(patient, "sex", "")).strip().lower()
    last_mammogram = getattr(patient, "last_mammogram_date", None)
    family_hx_breast = getattr(patient, "family_history_breast_cancer", False)

    relevant_factors: Dict[str, Any] = {
        "age": age,
        "sex": sex,
        "family_history_breast_cancer": family_hx_breast,
        "last_mammogram_date": last_mammogram.isoformat() if last_mammogram else None,
    }

    missing_info: List[str] = []
    if sex in ["female", ""] and age >= config.mammography_min_age and last_mammogram is None:
        missing_info.append("Historical screening mammography date")
    if family_hx_breast is None:
        missing_info.append("Detailed family history of breast or ovarian malignancy")

    guideline_ref = config.metadata.guideline_name
    guideline_ver = config.metadata.version_or_year
    programme_info = {
        "programme_name": config.metadata.programme_name,
        "eligibility_summary": config.programme_eligibility_description,
        "recommended_modalities": ["Digital 2D/3D Screening Mammography", "Clinical Breast Examination (CBE)"],
        "doh_accredited_centers_available": True
    }

    # Case 1: Biological male patients
    if sex == "male":
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_BREAST.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                "Routine population-based screening mammography is not clinically indicated for biological males "
                "under ADPHC guidelines. Screening is recommended only in exceptional genetic circumstances "
                "(e.g., documented BRCA mutation carrier with gynecomastia) upon specialist referral."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=[],
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Advise patient to consult a physician if any palpable breast mass, localized skin changes, or nipple abnormalities appear.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="No routine interval",
            priority="routine",
            clinical_risk_tier="not_applicable",
            last_screened_date=None,
        )

    # Case 2: High-Risk Female (First-degree family history or known hereditary mutation)
    is_high_risk = family_hx_breast is True
    interval_years = config.high_risk_mammography_interval_years if is_high_risk else config.routine_mammography_interval_years
    eligible_start_age = config.high_risk_start_age if is_high_risk else config.mammography_min_age

    if is_high_risk and age >= eligible_start_age:
        if last_mammogram is None:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_BREAST.value,
                flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
                reason_for_flag=(
                    f"Patient is {age} years old with documented first-degree family history of breast cancer. "
                    f"Under ADPHC guidelines, high-risk women are recommended for annual surveillance starting at age "
                    f"{config.high_risk_start_age} (or 10 years earlier than earliest diagnosed relative). "
                    f"No previous screening mammogram is documented."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Refer to breast specialist for comprehensive genetic risk assessment and order baseline bilateral screening mammography (with supplemental breast MRI if indicated).",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                uncertainty_note="High-risk status warrants specialist risk stratification (e.g. Tyrer-Cuzick model) and discussion of genetic testing.",
                suggested_timing="Within 14-30 days",
                priority="urgent",
                clinical_risk_tier="high",
                last_screened_date=None,
            )

    # Case 3: Younger Adult Female (Age 20-39) Average Risk
    if age < config.mammography_min_age and not is_high_risk:
        years_until_routine = config.mammography_min_age - age
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_BREAST.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                f"Patient is {age} years of age. Routine population screening mammography begins at age {config.mammography_min_age} "
                f"under ADPHC guidelines. For adult women aged 20-39, periodic Clinical Breast Examination (CBE) every "
                f"{int(config.cbe_interval_years)} years and personal breast health awareness are recommended."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=(
                f"Maintain breast health awareness and prompt reporting of new symptoms. "
                f"Plan for baseline screening mammography upon turning age {config.mammography_min_age} "
                f"(in approximately {years_until_routine} years)."
            ),
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing=f"Upon reaching age {config.mammography_min_age}",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=None,
            next_due_date=date(today.year + years_until_routine, today.month, min(today.day, 28)),
        )

    # Case 4: Screening-eligible female (Age 40-75) with no screening history recorded
    if age >= config.mammography_min_age and last_mammogram is None:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_BREAST.value,
            flag_status=FlagStatus.POTENTIALLY_DUE.value,
            reason_for_flag=(
                f"Patient is {age} years old and eligible for routine screening mammography under the ADPHC "
                f"Cancer Prevention Standard (recommended for women aged {config.mammography_min_age}-{config.mammography_max_age}). "
                f"No baseline or prior screening mammogram date is recorded in the clinical system."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Order bilateral screening mammogram at an accredited Abu Dhabi breast imaging center and provide patient education.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Absence of electronic records does not confirm patient was never screened at another private or public facility.",
            suggested_timing="Within 30 days",
            priority="moderate",
            clinical_risk_tier="standard",
            last_screened_date=None,
        )

    # Case 5: Screening-eligible female with documented mammogram history
    if last_mammogram is not None:
        elapsed_years = (today - last_mammogram).days / 365.25
        next_due_date = date(
            int(last_mammogram.year + interval_years),
            last_mammogram.month,
            min(last_mammogram.day, 28)
        )
        is_overdue = elapsed_years > interval_years
        is_due_soon = (interval_years - elapsed_years) <= 0.25 and not is_overdue

        if is_overdue:
            months_overdue = int(round((elapsed_years - interval_years) * 12))
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_BREAST.value,
                flag_status=FlagStatus.POTENTIALLY_OVERDUE.value,
                reason_for_flag=(
                    f"Last screening mammogram was performed on {last_mammogram.isoformat()} ({round(elapsed_years, 1)} years ago). "
                    f"ADPHC guidelines recommend screening every {interval_years} year(s). "
                    f"Screening is potentially overdue by approximately {max(months_overdue, 1)} month(s)."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Schedule biennial screening mammography appointment at an accredited facility.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 14-30 days",
                priority="urgent" if is_high_risk else "moderate",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_mammogram,
                next_due_date=next_due_date,
            )
        elif is_due_soon:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_BREAST.value,
                flag_status=FlagStatus.POTENTIALLY_DUE.value,
                reason_for_flag=(
                    f"Previous mammogram on {last_mammogram.isoformat()} is approaching the recommended {interval_years}-year recall cycle."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Coordinate upcoming screening mammogram during routine clinical follow-up.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 60 days",
                priority="routine",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_mammogram,
                next_due_date=next_due_date,
            )
        else:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_BREAST.value,
                flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
                reason_for_flag=(
                    f"Breast cancer screening is up to date under ADPHC standards. Last mammogram completed on "
                    f"{last_mammogram.isoformat()} ({round(elapsed_years, 1)} years ago, within the {interval_years}-year interval). "
                    f"Next screening is anticipated on {next_due_date.isoformat()}."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Continue routine personal breast awareness and maintain scheduled recall interval.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing=f"Routine recall on {next_due_date.isoformat()}",
                priority="routine",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_mammogram,
                next_due_date=next_due_date,
            )

    # Case 6: Beyond maximum screening age (> 75)
    if age > config.mammography_max_age:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_BREAST.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                f"Patient is {age} years old (above the routine population screening ceiling of age {config.mammography_max_age}). "
                f"Under ADPHC guidelines, continuing routine screening in adults over 75 should be individualized based on overall health, "
                f"comorbidities, and life expectancy through shared clinical decision-making."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Discuss personal preferences and individualized benefits/risks of ongoing mammography with physician.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="During next annual wellness review",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=last_mammogram,
        )

    # Fallback
    return AssessmentResult(
        screening_category=ScreeningCategory.CANCER_BREAST.value,
        flag_status=FlagStatus.INSUFFICIENT_INFORMATION.value,
        reason_for_flag="Patient record lacks essential demographics or screening records required to determine breast cancer screening status.",
        relevant_patient_factors=relevant_factors,
        missing_information=missing_info,
        applicable_guideline_reference=guideline_ref,
        guideline_version=guideline_ver,
        suggested_next_step="Verify patient screening history and family history of malignancy.",
        professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
        programme_eligibility=programme_info,
        suggested_timing="Within 30 days",
        priority="moderate",
        clinical_risk_tier="standard",
        last_screened_date=last_mammogram,
    )
