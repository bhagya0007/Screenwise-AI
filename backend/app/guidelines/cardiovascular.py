"""
ScreenWise AI - Adult Cardiovascular Preventive Health Assessment Module
Authoritative Reference:
- Abu Dhabi Public Health Centre (ADPHC) & Department of Health Abu Dhabi (DoH)
- Standards for Periodic Health Screening / IFHAS & Weqaya Cardiometabolic Standard (2024 Edition)
- Aligned with WHO/ISH Cardiovascular Risk Management and ACC/AHA Primary Prevention Guidelines

Safety Principle:
- Never diagnose a patient.
- Never invent a disease probability or arbitrary risk score.
- Do not describe arbitrary scores as validated risk.
- Clinical 10-year CVD risk score is ONLY calculated if an authoritative, validated algorithm is selected
  AND all required clinical inputs are available. Otherwise, display uncertainty, note missing data,
  and evaluate individual risk markers qualitatively.
"""

from datetime import date
from typing import Dict, Any, List, Optional
from app.guidelines.base import (
    AssessmentResult,
    FlagStatus,
    ScreeningCategory,
    MANDATORY_SAFETY_DISCLAIMER
)
from app.guidelines.config import CardiovascularGuidelineConfig, GUIDELINES_REGISTRY

def evaluate_cardiovascular_screening(
    patient,
    config: Optional[CardiovascularGuidelineConfig] = None
) -> AssessmentResult:
    """
    Evaluates cardiovascular preventive screening and risk markers under Abu Dhabi ADPHC/IFHAS guidelines.
    Transparently analyzes Blood Pressure history, smoking status, diabetes history, lipid panels,
    and family history of premature CAD without generating pseudo-scores.
    """
    if config is None:
        config = GUIDELINES_REGISTRY.cardiovascular

    today = date.today()
    age = getattr(patient, "age", 0)
    sex = getattr(patient, "sex", "unknown")
    sbp = getattr(patient, "systolic_bp", None)
    dbp = getattr(patient, "diastolic_bp", None)
    has_htn = getattr(patient, "has_hypertension", False)
    is_smoker = getattr(patient, "is_smoker", False)
    has_diabetes = getattr(patient, "has_diabetes_history", False)
    family_hx_cad = getattr(patient, "family_history_cad", False)
    total_chol = getattr(patient, "total_cholesterol", None)
    hdl_chol = getattr(patient, "hdl_cholesterol", None)
    ldl_chol = getattr(patient, "ldl_cholesterol", None)
    last_bp_date = getattr(patient, "last_bp_check_date", None)
    last_lipid_date = getattr(patient, "last_lipid_panel_date", None)

    # Relevant patient factors
    relevant_factors: Dict[str, Any] = {
        "age": age,
        "sex": sex,
        "systolic_bp": sbp,
        "diastolic_bp": dbp,
        "has_hypertension_diagnosis": has_htn,
        "smoking_status": "active_smoker" if is_smoker else "non_smoker",
        "has_diabetes_history": has_diabetes,
        "family_history_premature_cad": family_hx_cad,
        "total_cholesterol_mg_dl": total_chol,
        "hdl_cholesterol_mg_dl": hdl_chol,
        "ldl_cholesterol_mg_dl": ldl_chol,
        "last_bp_check_date": last_bp_date.isoformat() if last_bp_date else None,
        "last_lipid_panel_date": last_lipid_date.isoformat() if last_lipid_date else None,
    }

    # Missing clinical data checks
    missing_info: List[str] = []
    if last_bp_date is None:
        missing_info.append("Last blood pressure measurement date")
    if sbp is None or dbp is None:
        missing_info.append("Resting blood pressure reading (systolic & diastolic)")
    if last_lipid_date is None:
        missing_info.append("Last fasting or non-fasting lipid profile date")
    if total_chol is None:
        missing_info.append("Serum total cholesterol measurement")
    if hdl_chol is None:
        missing_info.append("Serum HDL cholesterol measurement")
    if ldl_chol is None:
        missing_info.append("Serum LDL cholesterol measurement")

    guideline_ref = config.metadata.guideline_name
    guideline_ver = config.metadata.version_or_year
    programme_info = {
        "programme_name": config.metadata.programme_name,
        "eligibility_summary": config.programme_eligibility_description,
        "risk_scoring_policy": config.risk_scoring_policy,
        "covered_services": ["Routine Blood Pressure Screening", "Complete Lipid Panel", "Weqaya Risk Assessment"],
    }

    # Clinical validation: Evaluate whether formal validated CVD risk scoring can be run
    # Required for WHO/ISH or ACC/AHA 10-year ASCVD: Age, Sex, SBP, Treated HTN, Total Chol, HDL Chol, Smoking, Diabetes
    validated_score_inputs_complete = all([
        age >= 40,
        sex in ["male", "female"],
        sbp is not None,
        total_chol is not None,
        hdl_chol is not None,
        is_smoker is not None,
        has_diabetes is not None
    ])
    
    scoring_note = (
        "Validated 10-year risk scoring algorithm criteria met." 
        if validated_score_inputs_complete else 
        "Formal 10-year ASCVD risk scoring deferred: Not all validated clinical parameters are present (missing: " +
        ", ".join([item for item in ["total cholesterol", "HDL cholesterol", "blood pressure"] if getattr(patient, item.replace(" ", "_"), None) is None]) +
        "). Risk evaluated qualitatively based on verified individual risk markers."
    )

    # Blood Pressure Severity Evaluation
    is_hypertensive_urgency = (sbp is not None and sbp >= config.urgency_htn_sbp_min) or (dbp is not None and dbp >= config.urgency_htn_dbp_min)
    is_stage2_htn = (sbp is not None and sbp >= config.stage2_htn_sbp_min) or (dbp is not None and dbp >= config.stage2_htn_dbp_min)
    is_stage1_htn = (sbp is not None and sbp >= config.stage1_htn_sbp_min) or (dbp is not None and dbp >= config.stage1_htn_dbp_min) or has_htn
    is_elevated_bp = (sbp is not None and config.elevated_sbp_min <= sbp <= config.elevated_sbp_max) and (dbp is None or dbp <= config.normal_dbp_max)

    # Lipid Severity Evaluation
    is_severe_hypercholesterolemia = (total_chol is not None and total_chol >= config.high_total_cholesterol_min) or (ldl_chol is not None and ldl_chol >= config.high_ldl_min)
    is_borderline_lipid = (total_chol is not None and total_chol >= config.borderline_high_total_cholesterol_min) or (ldl_chol is not None and ldl_chol >= config.borderline_high_ldl_min)

    # Case 1: Critical or Severe Blood Pressure Elevation (Urgency / Stage 2)
    if is_hypertensive_urgency or is_stage2_htn:
        return AssessmentResult(
            screening_category=ScreeningCategory.CARDIOVASCULAR.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                f"Recorded resting blood pressure is significantly elevated ({sbp or 'N/A'}/{dbp or 'N/A'} mmHg), "
                f"meeting criteria for Stage 2 Hypertension or severe hypertensive elevation under ADPHC / Weqaya clinical guidelines. "
                f"Immediate clinical evaluation, repeat in-clinic measurement, and professional review are required."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Conduct repeat in-clinic blood pressure measurement and refer to physician for comprehensive cardiovascular evaluation.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note="Blood pressure requires confirmation with multiple seated readings across separate visits or ambulatory monitoring before formal diagnosis.",
            suggested_timing="Prompt clinical evaluation within 24-48 hours",
            priority="urgent",
            clinical_risk_tier="high",
            last_screened_date=last_bp_date,
        )

    # Case 2: Severe Hypercholesterolemia or Multiple Uncontrolled Risk Factors
    multi_risk_count = sum([
        1 if is_smoker else 0,
        1 if has_diabetes else 0,
        1 if is_stage1_htn else 0,
        1 if family_hx_cad else 0,
        1 if is_severe_hypercholesterolemia else 0
    ])

    if is_severe_hypercholesterolemia or multi_risk_count >= 3:
        flag_reasons = []
        if is_severe_hypercholesterolemia:
            flag_reasons.append(f"Recorded serum lipids are substantially elevated (Total Cholesterol: {total_chol or 'N/A'} mg/dL, LDL: {ldl_chol or 'N/A'} mg/dL).")
        if is_smoker:
            flag_reasons.append("Active tobacco use substantially increases atherogenic risk.")
        if has_diabetes:
            flag_reasons.append("History of diabetes mellitus markedly increases risk for premature coronary artery disease.")
        if family_hx_cad:
            flag_reasons.append("First-degree family history of premature coronary artery disease indicates inherited cardiovascular susceptibility.")
        if is_stage1_htn:
            flag_reasons.append(f"Blood pressure indicates Stage 1 Hypertension ({sbp or 'N/A'}/{dbp or 'N/A'} mmHg).")

        return AssessmentResult(
            screening_category=ScreeningCategory.CARDIOVASCULAR.value,
            flag_status=FlagStatus.REQUIRES_PROFESSIONAL_REVIEW.value,
            reason_for_flag=(
                "Patient demonstrates multiple concurrent cardiovascular risk factors requiring physician review and coordinated preventive care: " +
                " ".join(flag_reasons)
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Schedule comprehensive cardiovascular medical review, repeat fasting lipid profile, and discuss personalized lifestyle and therapeutic prevention.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note=scoring_note,
            suggested_timing="Within 14 days",
            priority="urgent",
            clinical_risk_tier="high",
            last_screened_date=last_bp_date,
        )

    # Case 3: Overdue Blood Pressure or Lipid Screening
    bp_interval_years = config.elevated_bp_interval_years if is_elevated_bp else config.normal_bp_interval_years
    lipid_interval_years = config.lipid_high_risk_interval_years if (multi_risk_count >= 1 or age >= 40) else config.lipid_routine_interval_years

    is_bp_overdue = False
    is_lipid_overdue = False
    elapsed_bp_years = None
    elapsed_lipid_years = None

    if last_bp_date is not None:
        elapsed_bp_years = (today - last_bp_date).days / 365.25
        if elapsed_bp_years > bp_interval_years:
            is_bp_overdue = True
    elif age >= 18:
        # Adults with no recorded BP date
        is_bp_overdue = True

    if last_lipid_date is not None:
        elapsed_lipid_years = (today - last_lipid_date).days / 365.25
        if elapsed_lipid_years > lipid_interval_years:
            is_lipid_overdue = True
    elif age >= 20:
        is_lipid_overdue = True

    if is_bp_overdue or is_lipid_overdue:
        overdue_reasons = []
        if is_bp_overdue:
            if last_bp_date:
                overdue_reasons.append(f"Blood pressure screening is overdue (last checked {last_bp_date.isoformat()}, {round(elapsed_bp_years, 1)} years ago; recommended annually under ADPHC guidelines).")
            else:
                overdue_reasons.append("No historical blood pressure measurement is documented in the record.")
        if is_lipid_overdue:
            if last_lipid_date:
                overdue_reasons.append(f"Lipid panel screening is overdue (last evaluated {last_lipid_date.isoformat()}, {round(elapsed_lipid_years, 1)} years ago; recommended interval is {lipid_interval_years} year(s)).")
            else:
                overdue_reasons.append("No baseline lipid panel measurement is documented.")

        return AssessmentResult(
            screening_category=ScreeningCategory.CARDIOVASCULAR.value,
            flag_status=FlagStatus.POTENTIALLY_OVERDUE.value,
            reason_for_flag=" ".join(overdue_reasons),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Obtain updated resting blood pressure measurement and order routine preventive lipid profile (total cholesterol, HDL, LDL, triglycerides).",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            uncertainty_note=f"Absence of electronic records does not rule out screening completed at outside institutions. {scoring_note}",
            suggested_timing="Within 30 days",
            priority="moderate",
            clinical_risk_tier="moderate" if is_stage1_htn or is_borderline_lipid else "standard",
            last_screened_date=last_bp_date,
        )

    # Case 4: No screening gap identified - Both BP and Lipids are up to date and normal
    if last_bp_date is not None and last_lipid_date is not None and not is_stage1_htn and not is_borderline_lipid:
        next_due = date(
            int(last_bp_date.year + bp_interval_years),
            last_bp_date.month,
            min(last_bp_date.day, 28)
        )
        return AssessmentResult(
            screening_category=ScreeningCategory.CARDIOVASCULAR.value,
            flag_status=FlagStatus.NO_CURRENT_GAP_IDENTIFIED.value,
            reason_for_flag=(
                f"Cardiovascular surveillance is currently up to date based on ADPHC / IFHAS standards. "
                f"Blood pressure last checked on {last_bp_date.isoformat()} ({sbp}/{dbp} mmHg, within normal limits). "
                f"Lipid panel last evaluated on {last_lipid_date.isoformat()} (within desirable range). "
                f"No active screening gaps identified."
            ),
            relevant_patient_factors=relevant_factors,
            missing_information=missing_info,
            applicable_guideline_reference=guideline_ref,
            guideline_version=guideline_ver,
            suggested_next_step="Continue routine cardiovascular lifestyle health habits (regular physical exercise, Mediterranean/DASH diet pattern). Plan annual blood pressure recheck.",
            professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
            programme_eligibility=programme_info,
            suggested_timing="Routine recall at next annual checkup",
            priority="routine",
            clinical_risk_tier="standard",
            last_screened_date=last_bp_date,
            next_due_date=next_due,
        )

    # Case 5: Insufficient data where key indicators are missing
    return AssessmentResult(
        screening_category=ScreeningCategory.CARDIOVASCULAR.value,
        flag_status=FlagStatus.INSUFFICIENT_INFORMATION.value,
        reason_for_flag=(
            "Cardiovascular risk profile cannot be conclusively assessed due to missing baseline clinical measurements. "
            "Recent resting blood pressure readings and lipid profile records are required to determine screening status."
        ),
        relevant_patient_factors=relevant_factors,
        missing_information=missing_info,
        applicable_guideline_reference=guideline_ref,
        guideline_version=guideline_ver,
        suggested_next_step="Obtain office blood pressure measurements and order baseline lipid panel.",
        professional_review_requirement=MANDATORY_SAFETY_DISCLAIMER,
        programme_eligibility=programme_info,
        uncertainty_note="Missing information should be actively acquired rather than assumed to be within normal limits.",
        suggested_timing="Within 30 days",
        priority="moderate",
        clinical_risk_tier="standard",
        last_screened_date=last_bp_date,
    )
