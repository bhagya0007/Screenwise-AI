export type Sex = 'female' | 'male' | 'other';

export type ScreeningCategory = 
  | 'diabetes'
  | 'cardiovascular'
  | 'cancer_breast'
  | 'cancer_cervical'
  | 'cancer_colorectal';

export type ScreeningStatus = 
  | 'up_to_date'
  | 'due_soon'
  | 'overdue'
  | 'flagged_risk'
  | 'not_indicated';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'not_applicable';

export type FollowUpStatus = 'pending' | 'scheduled' | 'completed' | 'overdue' | 'deferred';
export type FollowUpPriority = 'routine' | 'moderate' | 'urgent';
export type FollowUpActionType = 'lab_test' | 'imaging' | 'consultation' | 'lifestyle' | 'vaccine';

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: Sex;
  email?: string;
  phone?: string;
  age: number;
  full_name: string;

  bmi?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  is_smoker: boolean;
  has_diabetes_history: boolean;
  has_hypertension: boolean;
  fasting_glucose?: number;
  hba1c?: number;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  ldl_cholesterol?: number;

  family_history_diabetes: boolean;
  family_history_cad: boolean;
  family_history_breast_cancer: boolean;
  family_history_colorectal_cancer: boolean;
  family_history_cervical_cancer: boolean;
  cervix_present: boolean;

  last_diabetes_screen_date?: string;
  last_lipid_panel_date?: string;
  last_bp_check_date?: string;
  last_mammogram_date?: string;
  last_cervical_screen_date?: string;
  last_colorectal_screen_date?: string;
  colorectal_screen_type?: string;

  created_at: string;
  updated_at: string;
}

export interface PatientCreateInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: Sex;
  email?: string;
  phone?: string;

  bmi?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  is_smoker?: boolean;
  has_diabetes_history?: boolean;
  has_hypertension?: boolean;
  fasting_glucose?: number;
  hba1c?: number;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  ldl_cholesterol?: number;

  family_history_diabetes?: boolean;
  family_history_cad?: boolean;
  family_history_breast_cancer?: boolean;
  family_history_colorectal_cancer?: boolean;
  family_history_cervical_cancer?: boolean;
  cervix_present?: boolean;

  last_diabetes_screen_date?: string;
  last_lipid_panel_date?: string;
  last_bp_check_date?: string;
  last_mammogram_date?: string;
  last_cervical_screen_date?: string;
  last_colorectal_screen_date?: string;
  colorectal_screen_type?: string;
}

export interface ScreeningAssessment {
  id?: number;
  patient_id: number;
  category: ScreeningCategory;
  status: ScreeningStatus;
  risk_level: RiskLevel;
  last_screened_date?: string;
  next_due_date?: string;
  flagged_reasons: string[];
  suggested_next_steps: string[];
  guideline_source: string;
  assessment_summary?: string;
  ai_explanation?: string;
  evaluated_at?: string;
}

export interface FollowUpTask {
  id: number;
  patient_id: number;
  screening_id?: number;
  title: string;
  action_type: FollowUpActionType;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  due_date: string;
  scheduled_date?: string;
  completed_date?: string;
  assigned_provider?: string;
  clinical_notes?: string;
  result_summary?: string;
  created_at: string;
  updated_at: string;
  patient_name?: string;
}

export interface FollowUpTaskCreateInput {
  patient_id: number;
  screening_id?: number;
  title: string;
  action_type: FollowUpActionType;
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  due_date: string;
  scheduled_date?: string;
  assigned_provider?: string;
  clinical_notes?: string;
}

export interface CategoryStat {
  category: string;
  label: string;
  up_to_date: number;
  due_soon: number;
  overdue: number;
  flagged_risk: number;
  not_indicated: number;
}

export interface DashboardStats {
  total_patients: number;
  total_screenings_evaluated: number;
  total_overdue: number;
  total_flagged_risk: number;
  pending_follow_ups: number;
  completed_follow_ups: number;
  category_breakdown: CategoryStat[];
  risk_distribution: {
    low: number;
    moderate: number;
    high: number;
    not_applicable: number;
  };
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database: string;
  timestamp: string;
}
