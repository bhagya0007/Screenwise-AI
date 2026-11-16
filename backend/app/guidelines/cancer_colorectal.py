"""
ScreenWise AI - Colorectal Cancer Preventive Screening Assessment Module
Authoritative Reference:
- Abu Dhabi Public Health Centre (ADPHC) & Department of Health Abu Dhabi (DoH)
- ADPHC Colorectal Cancer Early Detection Standard & Pathway (2024 Edition)
- Note on UAE Epidemiology: Routine population screening in Abu Dhabi begins at AGE 40
  due to documented younger age of onset in regional clinical registries.
"""

from datetime import date
from typing import Dict, Any, List, Optional
from app.guidelines.base import (
    AssessmentResult,
    FlagStatus,
    ScreeningCategory,
    MANDATORY_SAFETY_DISCLAIMER
)
from app.guidelines.config import ColorectalCancerGuidelineConfig, GUIDELINES_REGISTRY

def evaluate_colorectal_cancer_screening(
    patient,
    config: Optional[ColorectalCancerGuidelineConfig] = None
) -> AssessmentResult:
    """
    Evaluates colorectal cancer screening eligibility, recall intervals, and risk flags
    under Abu Dhabi Public Health Centre (ADPHC) standards (Starting at Age 40).
    """
    if config is None:
        config = GUIDELINES_REGISTRY.cancer_colorectal

    today = date.today()
    age = getattr(patient, "age", 0)
    sex = str(getattr(patient, "sex", "")).strip().lower()
    last_screen_date = getattr(patient, "last_colorectal_screen_date", None)
    screen_type = getattr(patient, "colorectal_screen_type", "colonoscopy") or "colonoscopy"
    family_hx_crc = getattr(patient, "family_history_colorectal_cancer", False)

    relevant_factors: Dict[str, Any] = {
        "age": age,
        "sex": sex,
        "family_history_colorectal_cancer": family_hx_crc,
        "screening_modality_recorded": screen_type,
        "last_colorectal_screen_date": last_screen_date.isoformat() if last_screen_date else None,
    }

    missing_info: List[str] = []
    if age >= config.routine_screening_min_age and last_screen_date is None:
        missing_info.append("Baseline colorectal cancer screening record (FIT or Colonoscopy)")
    if family_hx_crc is None:
        missing_info.append("Detailed family pedigree regarding early-onset colorectal cancer or polyps")

    guideline_ref = config.metadata.guideline_name
    guideline_ver = config.metadata.version_or_year
    programme_info = {
        "programme_name": config.metadata.programme_name,
        "eligibility_summary": config.programme_eligibility_description,
        "age_threshold_note": f"Universal screening begins at age {config.routine_screening_min_age} in Abu Dhabi (ADPHC standard).",
        "approved_modalities": [
            f"Fecal Immunochemical Test (FIT) annually (every {int(config.fit_interval_years)} year)",
            f"Screening Colonoscopy every {int(config.colonoscopy_routine_interval_years)} years (Gold Standard)",
        ],
        "liquid_biopsy_status": config.liquid_biopsy_status,
    }

    # Case 1: High-Risk (First-degree family history of colorectal cancer)
    is_high_risk = family_hx_crc is True
    high_risk_start_age = config.high_risk_start_age

    if is_high_risk:
        interval_years = config.colonoscopy_high_risk_interval_years
        if age >= high_risk_start_age:
            if last_screen_date is None:
                return AssessmentResult(
                    screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
                    flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
                    reason_for_flag=(
                        f"Patient is {age} years of age with a documented first-degree family history of colorectal cancer. "
                        f"Under ADPHC guidelines, individuals with first-degree hereditary risk require earlier screening "
                        f"(starting at age {high_risk_start_age} or 10 years earlier than youngest affected relative) and "
                        f"direct colonoscopy surveillance every {int(interval_years)} years. No prior colonoscopy is recorded."
                    ),
                    relevant_patient_factors=relevant_factors,
                    missing_information=missing_info,
                    applicable_guideline_reference=guideline_ref,
                    guideline_version=guideline_ver,
                    suggested_next_step="Refer directly to gastroenterology for screening colonoscopy order and individualized pedigree risk assessment.",
                    professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                    programme_eligibility=programme_info,
                    uncertainty_note="High-risk patients should undergo colonoscopy rather than stool-based FIT tests.",
                    suggested_timing="Within 14-30 days",
                    priority="urgent",
                    clinical_risk_tier="high",
                    last_screened_date=None,
                )

    # Case 2: Adult under Abu Dhabi screening age (< 40) without family risk
    if age < config.routine_screening_min_age and not is_high_risk:
        years_until_eligible = config.routine_screening_min_age - age
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                f"Patient is {age} years of age. Under ADPHC standards, routine colorectal screening for average-risk "
                f"individuals begins at age {config.routine_screening_min_age}. No early screening gap identified."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=(
                f"Inform patient of routine colorectal screening initiation at age {config.routine_screening_min_age} "
                f"(in approximately {years_until_eligible} years). Advise to report any red flag symptoms "
                f"(rectal bleeding, altered bowel habits, unexplained weight loss) immediately."
            ),
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing=f"Upon reaching age {config.routine_screening_min_age}",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=None,
            next_due_date=date(today.year + years_until_eligible, today.month, min(today.day, 28)),
        )

    # Determine interval based on screening modality
    is_fit = "fit" in screen_type.lower() or "stool" in screen_type.lower()
    if is_high_risk:
        interval_years = config.colonoscopy_high_risk_interval_years
        modality_text = f"High-risk screening colonoscopy every {int(interval_years)} years"
    elif is_fit:
        interval_years = config.fit_interval_years
        modality_text = f"Annual Fecal Immunochemical Test (FIT) every {int(interval_years)} year"
    else:
        interval_years = config.colonoscopy_routine_interval_years
        modality_text = f"Screening Colonoscopy every {int(interval_years)} years"

    # Case 3: Eligible Adult (Age 40-75) with no screening history recorded
    if config.routine_screening_min_age <= age <= config.routine_screening_max_age and last_screen_date is None:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
            flag_status=FlagStatus.POTENTIALLY_DUE.value,
            reason_for_flag=(
                f"Patient is {age} years of age and meets ADPHC guideline eligibility for colorectal screening "
                f"(recommended for all adults aged {config.routine_screening_min_age}-{config.routine_screening_max_age} in Abu Dhabi). "
                f"No prior screening record (FIT or Colonoscopy) is documented."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=(
                "Discuss screening options with patient: Annual at-home Fecal Immunochemical Test (FIT) "
                "or 10-yearly screening colonoscopy; issue order based on shared clinical decision."
            ),
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Absence of electronic records does not confirm patient was never screened at another private facility.",
            suggested_timing="Within 30 days",
            priority="moderate" if not is_high_risk else "urgent",
            clinical_risk_tier="high" if is_high_risk else "standard",
            last_screened_date=None,
        )

    # Case 4: Documented screening history available
    if last_screen_date is not None:
        elapsed_years = (today - last_screen_date).days / 365.25
        next_due_date = date(
            int(last_screen_date.year + interval_years),
            last_screen_date.month,
            min(last_screen_date.day, 28)
        )
        is_overdue = elapsed_years > interval_years
        is_due_soon = (interval_years - elapsed_years) <= 0.25 and not is_overdue

        if is_overdue:
            months_overdue = int(round((elapsed_years - interval_years) * 12))
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
                flag_status=FlagStatus.POTENTIALLY_OVERDUE.value,
                reason_for_flag=(
                    f"Last colorectal screen ({screen_type}) was performed on {last_screen_date.isoformat()} "
                    f"({round(elapsed_years, 1)} years ago). Based on {modality_text}, the screening interval is "
                    f"{interval_years} year(s). Screening is potentially overdue by approximately {max(months_overdue, 1)} month(s)."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step=f"Schedule repeat screening: {'Annual FIT kit distribution' if is_fit else 'Refer for screening colonoscopy'}.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 14-30 days",
                priority="urgent" if is_high_risk else "moderate",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        elif is_due_soon:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
                flag_status=FlagStatus.POTENTIALLY_DUE.value,
                reason_for_flag=(
                    f"Previous screening on {last_screen_date.isoformat()} ({screen_type}) is approaching the "
                    f"recommended {interval_years}-year recall cycle ({modality_text})."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Plan upcoming routine screening order during regular clinical consultation.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 60 days",
                priority="routine",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        else:
            return AssessmentResult(
                screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
                flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
                reason_for_flag=(
                    f"Colorectal cancer screening is up to date under ADPHC standards. Last screening ({screen_type}) completed on "
                    f"{last_screen_date.isoformat()} ({round(elapsed_years, 1)} years ago, within the {interval_years}-year interval). "
                    f"Next screening is due on {next_due_date.isoformat()}."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Maintain routine preventive schedule; recall patient on scheduled due date.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing=f"Routine recall on {next_due_date.isoformat()}",
                priority="routine",
                clinical_risk_tier="high" if is_high_risk else "standard",
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )

    # Case 5: Above age 75
    if age > config.routine_screening_max_age:
        return AssessmentResult(
            screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                f"Patient is {age} years of age (exceeding the standard population screening ceiling of age {config.routine_screening_max_age}). "
                f"Under ADPHC guidelines, screening beyond age 75 should be selective and based on overall patient health, "
                f"prior screening history, and shared decision-making regarding procedural risks and benefits."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Conduct physician-patient discussion regarding personalized risk-benefit balance of ongoing screening.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="During annual health assessment",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=last_screen_date,
        )

    # Fallback
    return AssessmentResult(
        screening_category=ScreeningCategory.CANCER_COLORECTAL.value,
        flag_status=FlagStatus.INSUFFICIENT_INFORMATION.value,
        reason_for_flag="Patient record contains insufficient clinical details to determine colorectal screening status.",
        relevant_patient_factors=relevant_factors,
        missing_information=missing_info,
        applicable_guideline_reference=guideline_ref,
        guideline_version=guideline_ver,
        suggested_next_step="Obtain full family history of gastrointestinal cancer and review past endoscopy or stool testing records.",
        professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
        programme_eligibility=programme_info,
        suggested_timing="Within 30 days",
        priority="moderate",
        clinical_risk_tier="standard",
        last_screened_date=last_screen_date,
    )
