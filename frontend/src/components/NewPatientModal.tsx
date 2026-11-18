import React, { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { PatientCreateInput, Sex } from '../types';
import { patientService } from '../services/patientService';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'demographics' | 'vitals' | 'history' | 'screenings'>('demographics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientCreateInput>({
    first_name: '',
    last_name: '',
    date_of_birth: '1980-01-01',
    sex: 'female',
    email: '',
    phone: '',
    bmi: 24.5,
    systolic_bp: 120,
    diastolic_bp: 80,
    is_smoker: false,
    has_diabetes_history: false,
    has_hypertension: false,
    fasting_glucose: undefined,
    hba1c: undefined,
    total_cholesterol: undefined,
    hdl_cholesterol: undefined,
    ldl_cholesterol: undefined,
    family_history_diabetes: false,
    family_history_cad: false,
    family_history_breast_cancer: false,
    family_history_colorectal_cancer: false,
    cervix_present: true,
    colorectal_screen_type: 'colonoscopy',
  });

  const handleChange = <K extends keyof PatientCreateInput>(field: K, value: PatientCreateInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
      setError('Please fill in required fields: Name and Date of Birth.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await patientService.create(formData);
      onPatientCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Patient"
      description="Add patient demographics, baseline vitals, and screening history for AI assessment."
      maxWidth="2xl"
    >
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('demographics')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'demographics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Demographics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vitals')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'vitals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Vitals & Labs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Family History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('screenings')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'screenings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Prior Screenings
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab 1: Demographics */}
        {activeTab === 'demographics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="Jane"
                required
              />
              <Input
                label="Last Name *"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date of Birth *"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                required
              />
              <Select
                label="Sex Assigned at Birth *"
                value={formData.sex}
                onChange={(e) => handleChange('sex', e.target.value as Sex)}
                options={[
                  { label: 'Female', value: 'female' },
                  { label: 'Male', value: 'male' },
                  { label: 'Other', value: 'other' },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane.doe@example.com"
              />
              <Input
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Vitals & Labs */}
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="BMI (kg/m²)"
                type="number"
                step="0.1"
                value={formData.bmi || ''}
                onChange={(e) => handleChange('bmi', parseFloat(e.target.value) || undefined)}
                placeholder="24.5"
              />
              <Input
                label="Systolic BP (mmHg)"
                type="number"
                value={formData.systolic_bp || ''}
                onChange={(e) => handleChange('systolic_bp', parseInt(e.target.value, 10) || undefined)}
                placeholder="120"
              />
              <Input
                label="Diastolic BP (mmHg)"
                type="number"
                value={formData.diastolic_bp || ''}
                onChange={(e) => handleChange('diastolic_bp', parseInt(e.target.value, 10) || undefined)}
                placeholder="80"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fasting Glucose (mg/dL)"
                type="number"
                step="0.1"
                value={formData.fasting_glucose || ''}
                onChange={(e) => handleChange('fasting_glucose', parseFloat(e.target.value) || undefined)}
                placeholder="e.g. 95"
              />
              <Input
                label="HbA1c (%)"
                type="number"
                step="0.1"
                value={formData.hba1c || ''}
                onChange={(e) => handleChange('hba1c', parseFloat(e.target.value) || undefined)}
                placeholder="e.g. 5.4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Total Chol. (mg/dL)"
                type="number"
                value={formData.total_cholesterol || ''}
                onChange={(e) => handleChange('total_cholesterol', parseFloat(e.target.value) || undefined)}
                placeholder="190"
              />
              <Input
                label="HDL (mg/dL)"
                type="number"
                value={formData.hdl_cholesterol || ''}
                onChange={(e) => handleChange('hdl_cholesterol', parseFloat(e.target.value) || undefined)}
                placeholder="55"
              />
              <Input
                label="LDL (mg/dL)"
                type="number"
                value={formData.ldl_cholesterol || ''}
                onChange={(e) => handleChange('ldl_cholesterol', parseFloat(e.target.value) || undefined)}
                placeholder="110"
              />
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_smoker}
                  onChange={(e) => handleChange('is_smoker', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Active Smoker</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_hypertension}
                  onChange={(e) => handleChange('has_hypertension', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Diagnosed Hypertension</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Family History */}
        {activeTab === 'history' && (
          <div className="space-y-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              First-Degree Relatives (Parents, Siblings)
            </p>
            <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.family_history_diabetes}
                onChange={(e) => handleChange('family_history_diabetes', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Family History of Type 2 Diabetes</span>
            </label>
            <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.family_history_cad}
                onChange={(e) => handleChange('family_history_cad', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Family History of Early Coronary Artery Disease (CAD)</span>
            </label>
            <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.family_history_breast_cancer}
                onChange={(e) => handleChange('family_history_breast_cancer', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Family History of Breast Cancer (1st-degree relative)</span>
            </label>
            <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.family_history_colorectal_cancer}
                onChange={(e) => handleChange('family_history_colorectal_cancer', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Family History of Colorectal Cancer / Polyps</span>
            </label>
            {formData.sex !== 'male' && (
              <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.cervix_present}
                  onChange={(e) => handleChange('cervix_present', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Cervix Present (uncheck if total hysterectomy for benign disease)</span>
              </label>
            )}
          </div>
        )}

        {/* Tab 4: Prior Screenings */}
        {activeTab === 'screenings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Last Diabetes Screen Date"
                type="date"
                value={formData.last_diabetes_screen_date || ''}
                onChange={(e) => handleChange('last_diabetes_screen_date', e.target.value || undefined)}
                helperText="HbA1c or Fasting Blood Glucose"
              />
              <Input
                label="Last Lipid Panel Date"
                type="date"
                value={formData.last_lipid_panel_date || ''}
                onChange={(e) => handleChange('last_lipid_panel_date', e.target.value || undefined)}
                helperText="Cholesterol profile"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Last Blood Pressure Check"
                type="date"
                value={formData.last_bp_check_date || ''}
                onChange={(e) => handleChange('last_bp_check_date', e.target.value || undefined)}
              />
              {formData.sex !== 'male' && (
                <Input
                  label="Last Mammogram Date"
                  type="date"
                  value={formData.last_mammogram_date || ''}
                  onChange={(e) => handleChange('last_mammogram_date', e.target.value || undefined)}
                />
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.sex !== 'male' && (
                <Input
                  label="Last Cervical Cytology / HPV Date"
                  type="date"
                  value={formData.last_cervical_screen_date || ''}
                  onChange={(e) => handleChange('last_cervical_screen_date', e.target.value || undefined)}
                />
              )}
              <Input
                label="Last Colorectal Screening Date"
                type="date"
                value={formData.last_colorectal_screen_date || ''}
                onChange={(e) => handleChange('last_colorectal_screen_date', e.target.value || undefined)}
              />
            </div>
            <Select
              label="Colorectal Screening Modality"
              value={formData.colorectal_screen_type || 'colonoscopy'}
              onChange={(e) => handleChange('colorectal_screen_type', e.target.value)}
              options={[
                { label: 'Colonoscopy (10-yr interval)', value: 'colonoscopy' },
                { label: 'At-home FIT Stool Test (Annual)', value: 'fit' },
                { label: 'Stool DNA-FIT / Cologuard (3-yr interval)', value: 'stool_dna' },
                { label: 'Flexible Sigmoidoscopy (5-yr interval)', value: 'sigmoidoscopy' },
              ]}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            ScreenWise AI auto-evaluates all 5 screening pathways upon saving.
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              Save & Evaluate Screenings
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
