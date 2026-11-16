"""
ScreenWise AI - Adult Diabetes Preventive Screening Assessment Module
Authoritative Reference:
- Abu Dhabi Public Health Centre (ADPHC) & Department of Health Abu Dhabi (DoH)
- Standards for Periodic Health Screening / IFHAS Cardiometabolic Screening Standard (2024 Edition)
- Supported by ADA Standards of Care in Diabetes (2024) and USPSTF Screening for Prediabetes and Type 2 Diabetes
"""

from datetime import date
from typing import Dict, Any, List, Optional
from app.guidelines.base import (
    AssessmentResult,
    FlagStatus,
    ScreeningCategory,
    MANDATORY_SAFETY_DISCLAIMER
)
from app.guidelines.config import DiabetesGuidelineConfig, GUIDELINES_REGISTRY

def evaluate_diabetes_screening(
    patient,
    config: Optional[DiabetesGuidelineConfig] = None
) -> AssessmentResult:
    """
    Evaluates adult diabetes and prediabetes screening status based on Abu Dhabi ADPHC/IFHAS guidelines.
    Transparently evaluates age, previous screening dates, laboratory measurements (HbA1c, FPG),
    anthropometrics (BMI), medical history, and family risk factors.
    """
    if config is None:
        config = GUIDELINES_REGISTRY.diabetes

    today = date.today()
    age = getattr(patient, "age", 0)
    bmi = getattr(patient, "bmi", None)
    systolic_bp = getattr(patient, "systolic_bp", None)
    has_htn = getattr(patient, "has_hypertension", False)
    has_known_diabetes = getattr(patient, "has_diabetes_history", False)
    family_hx_diabetes = getattr(patient, "family_history_diabetes", False)
    is_smoker = getattr(patient, "is_smoker", False)
    fasting_glucose = getattr(patient, "fasting_glucose", None)
    hba1c = getattr(patient, "hba1c", None)
    last_screen_date = getattr(patient, "last_diabetes_screen_date", None)

    # Compile relevant patient factors
    relevant_factors: Dict[str, Any] = {
        "age": age,
        "bmi": bmi,
        "has_hypertension": has_htn,
        "systolic_bp": systolic_bp,
        "family_history_diabetes": family_hx_diabetes,
        "is_smoker": is_smoker,
        "fasting_glucose_mg_dl": fasting_glucose,
        "hba1c_percent": hba1c,
        "has_known_diabetes_history": has_known_diabetes,
        "last_screen_date": last_screen_date.isoformat() if last_screen_date else None,
    }

    # Identify missing clinical data points
    missing_info: List[str] = []
    if last_screen_date is None:
        missing_info.append("Last glycemic screening date (HbA1c or Fasting Plasma Glucose)")
    if bmi is None:
        missing_info.append("Current Body Mass Index (BMI)")
    if fasting_glucose is None and hba1c is None:
        missing_info.append("Baseline glycemic measurement (Fasting Plasma Glucose or HbA1c)")

    guideline_ref = config.metadata.guideline_name
    guideline_ver = config.metadata.version_or_year
    programme_info = {
        "programme_name": config.metadata.programme_name,
        "eligibility_summary": config.programme_eligibility_description,
        "clinical_note": config.clinical_consideration_note,
        "covered_tests": ["Fasting Plasma Glucose (FPG)", "Glycated Hemoglobin (HbA1c)"],
    }

    # Case 1: Pre-existing diagnosed diabetes
    if has_known_diabetes:
        return AssessmentResult(
            screening_category=ScreeningCategory.DIABETES.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                "Patient has a documented history of diabetes mellitus. Primary screening for asymptomatic disease "
                "is no longer applicable; patient requires ongoing clinical diabetes management, comprehensive metabolic "
                "surveillance (HbA1c every 3-6 months), microvascular disease screening, and cardiovascular risk monitoring."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Consult endocrinologist or primary care physician for comprehensive diabetes care review and treatment monitoring.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="Prompt clinical appointment",
            priority="moderate",
            clinical_risk_tier="high",
            last_screened_date=last_screen_date,
        )

    # Case 2: Available lab measurements indicate provisional elevated range or prediabetes
    # Safety Check: Never diagnose!
    is_provisional_high = (
        (fasting_glucose is not None and fasting_glucose >= config.provisional_diabetes_fasting_glucose) or
        (hba1c is not None and hba1c >= config.provisional_diabetes_hba1c)
    )
    is_prediabetes = (
        (fasting_glucose is not None and config.prediabetes_fasting_glucose_min <= fasting_glucose <= config.prediabetes_fasting_glucose_max) or
        (hba1c is not None and config.prediabetes_hba1c_min <= hba1c <= config.prediabetes_hba1c_max)
    )

    if is_provisional_high:
        return AssessmentResult(
            screening_category=ScreeningCategory.DIABETES.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                f"Recorded laboratory measurement (Fasting Glucose: {fasting_glucose or 'unrecorded'} mg/dL, "
                f"HbA1c: {hba1c or 'unrecorded'}%) meets the provisional threshold for hyperglycemia requiring prompt "
                f"clinical assessment. Note: A single asymptomatic test result does not constitute a clinical diagnosis; "
                f"guidelines require confirmatory repeat testing and comprehensive clinical evaluation."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Schedule urgent clinical consultation for repeat confirmatory testing and clinical evaluation.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Laboratory threshold flagged. Diagnosis must not be inferred without repeat testing and physician assessment.",
            suggested_timing="Within 7-14 days",
            priority="urgent",
            clinical_risk_tier="high",
            last_screened_date=last_screen_date,
        )

    # Determine eligibility and intervals
    is_overweight = bmi is not None and bmi >= config.overweight_bmi_general
    has_cardiometabolic_risks = (
        family_hx_diabetes or
        has_htn or
        (systolic_bp is not None and systolic_bp >= 130) or
        is_smoker or
        is_overweight
    )
    is_age_eligible_universal = age >= config.universal_screening_min_age
    is_age_eligible_opportunistic = age >= config.opportunistic_screening_min_age and has_cardiometabolic_risks

    # Case 3: Complete lack of both screening history and laboratory measurements for an eligible adult
    if (is_age_eligible_universal or is_age_eligible_opportunistic) and last_screen_date is None and fasting_glucose is None and hba1c is None:
        urgency = "urgent" if (is_overweight and has_cardiometabolic_risks) else "moderate"
        return AssessmentResult(
            screening_category=ScreeningCategory.DIABETES.value,
            flag_status=FlagStatus.POTENTIALLY_DUE.value,
            reason_for_flag=(
                f"Patient is {age} years of age and meets ADPHC IFHAS guideline screening eligibility "
                f"(universal screening starting at age {config.universal_screening_min_age}, or age {config.opportunistic_screening_min_age}+ "
                f"with cardiometabolic risk indicators). No baseline glycemic screening date or laboratory measurements are recorded."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Order baseline fasting plasma glucose or glycated hemoglobin (HbA1c) screening test.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Absence of recorded screening date does not confirm patient was never screened elsewhere; historical records should be verified.",
            suggested_timing="Within 30 days",
            priority=urgency,
            clinical_risk_tier="moderate" if urgency == "urgent" else "standard",
            last_screened_date=None,
        )

    # Determine applicable screening interval
    if is_prediabetes:
        recommended_interval_years = config.prediabetes_interval_years
        interval_reason = "Prediabetes range identified on available glycemic panel; guidelines mandate annual surveillance."
        risk_tier = "high"
    elif is_overweight and has_cardiometabolic_risks:
        recommended_interval_years = config.high_risk_interval_years
        interval_reason = f"Elevated cardiometabolic risk profile (BMI {bmi or 'N/A'}, risk factors present); annual screening advised."
        risk_tier = "moderate"
    else:
        recommended_interval_years = config.normal_interval_years
        interval_reason = f"Standard {int(config.normal_interval_years)}-year periodic screening interval for average-risk adults."
        risk_tier = "standard"

    # Evaluate elapsed time since last screening
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
            overdue_duration_months = int(round((elapsed_years - recommended_interval_years) * 12))
            return AssessmentResult(
                screening_category=ScreeningCategory.DIABETES.value,
                flag_status=FlagStatus.POTENTIALLY_OVERDUE.value,
                reason_for_flag=(
                    f"Last diabetes screening was completed on {last_screen_date.isoformat()} ({round(elapsed_years, 1)} years ago). "
                    f"Based on patient profile, recommended interval is {recommended_interval_years} year(s) ({interval_reason}). "
                    f"Screening is potentially overdue by approximately {max(overdue_duration_months, 1)} month(s)."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Schedule periodic screening HbA1c or fasting plasma glucose test.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 14-30 days",
                priority="urgent" if risk_tier == "high" else "moderate",
                clinical_risk_tier=risk_tier,
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        elif is_due_soon:
            return AssessmentResult(
                screening_category=ScreeningCategory.DIABETES.value,
                flag_status=FlagStatus.POTENTIALLY_DUE.value,
                reason_for_flag=(
                    f"Previous screening on {last_screen_date.isoformat()} is approaching the recommended "
                    f"{recommended_interval_years}-year recall interval ({interval_reason})."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Plan upcoming routine HbA1c or fasting glucose test during next clinic visit.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Within 60 days",
                priority="routine",
                clinical_risk_tier=risk_tier,
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )
        else:
            return AssessmentResult(
                screening_category=ScreeningCategory.DIABETES.value,
                flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
                reason_for_flag=(
                    f"Glycemic screening is up to date. Last screened on {last_screen_date.isoformat()} "
                    f"({round(elapsed_years, 1)} years ago, within the recommended {recommended_interval_years}-year interval). "
                    f"No active screening gap identified."
                ),
                relevant_patient_factors=relevant_factors,
                missing_information=missing_info,
                applicable_guideline_reference=guideline_ref,
                guideline_version=guideline_ver,
                suggested_next_step="Maintain healthy lifestyle and balanced diet; continue periodic screening as scheduled.",
                professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
                programme_eligibility=programme_info,
                suggested_timing="Routine recall as scheduled",
                priority="routine",
                clinical_risk_tier=risk_tier,
                last_screened_date=last_screen_date,
                next_due_date=next_due_date,
            )

    # Case 4: Young adult under screening age without risk factors
    if age < config.universal_screening_min_age and not has_cardiometabolic_risks:
        return AssessmentResult(
            screening_category=ScreeningCategory.DIABETES.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                f"Patient is {age} years of age without overweight/obesity (BMI: {bmi or 'unrecorded'}) or documented "
                f"cardiometabolic risk indicators. Under ADPHC IFHAS guidelines, universal screening begins at age {config.universal_screening_min_age}."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step=f"Re-evaluate screening when turning age {config.universal_screening_min_age} or if personal metabolic risk profile changes.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing=f"Upon reaching age {config.universal_screening_min_age}",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=None,
        )

    # Case 5: Incomplete data where status cannot be definitively classified
    return AssessmentResult(
        screening_category=ScreeningCategory.DIABETES.value,
        flag_status=FlagStatus.INSUFFICIENT_INFORMATION.value,
        reason_for_flag=(
            "Patient data contains incomplete fields required to establish definitive diabetes screening status. "
            "Essential clinical parameters (screening history, BMI, or baseline glycemic labs) are missing."
        ),
        relevant_patient_factors=relevant_factors,
        missing_information=missing_info,
        applicable_guideline_reference=guideline_ref,
        guideline_version=guideline_ver,
        suggested_next_step="Gather clinical history, measure current BMI, and discuss ordering baseline fasting glucose or HbA1c.",
        professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
        programme_eligibility=programme_info,
        uncertainty_note="Missing information must not be assumed to be normal or negative.",
        suggested_timing="Within 30 days",
        priority="moderate",
        clinical_risk_tier="standard",
        last_screened_date=None,
    )
