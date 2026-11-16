import React, { useState, useEffect } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Patient, PatientCreateInput } from '../types';
import { patientService } from '../services/patientService';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onPatientUpdated: () => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onPatientUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'demographics' | 'vitals' | 'history' | 'screenings'>('demographics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientCreateInput>({
    first_name: patient.first_name || patient.full_name.split(' ')[0] || '',
    last_name: patient.last_name || patient.full_name.split(' ').slice(1).join(' ') || '',
    date_of_birth: patient.date_of_birth || '1980-01-01',
    sex: patient.sex || 'female',
    email: patient.email || '',
    phone: patient.phone || '',
    bmi: patient.bmi ?? 24.5,
    systolic_bp: patient.systolic_bp ?? 120,
    diastolic_bp: patient.diastolic_bp ?? 80,
    is_smoker: !!patient.is_smoker,
    has_diabetes_history: !!patient.has_diabetes_history,
    has_hypertension: !!patient.has_hypertension,
    fasting_glucose: patient.fasting_glucose ?? undefined,
    hba1c: patient.hba1c ?? undefined,
    total_cholesterol: patient.total_cholesterol ?? undefined,
    hdl_cholesterol: patient.hdl_cholesterol ?? undefined,
    ldl_cholesterol: patient.ldl_cholesterol ?? undefined,
    family_history_diabetes: !!patient.family_history_diabetes,
    family_history_cad: !!patient.family_history_cad,
    family_history_breast_cancer: !!patient.family_history_breast_cancer,
    family_history_colorectal_cancer: !!patient.family_history_colorectal_cancer,
    cervix_present: patient.cervix_present !== false,
    last_diabetes_screen_date: patient.last_diabetes_screen_date ?? undefined,
    last_lipid_panel_date: patient.last_lipid_panel_date ?? undefined,
    last_bp_check_date: patient.last_bp_check_date ?? undefined,
    last_mammogram_date: patient.last_mammogram_date ?? undefined,
    last_cervical_screen_date: patient.last_cervical_screen_date ?? undefined,
    last_colorectal_screen_date: patient.last_colorectal_screen_date ?? undefined,
    colorectal_screen_type: patient.colorectal_screen_type || 'colonoscopy',
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        first_name: patient.first_name || patient.full_name.split(' ')[0] || '',
        last_name: patient.last_name || patient.full_name.split(' ').slice(1).join(' ') || '',
        date_of_birth: patient.date_of_birth || '1980-01-01',
        sex: patient.sex || 'female',
        email: patient.email || '',
        phone: patient.phone || '',
        bmi: patient.bmi ?? 24.5,
        systolic_bp: patient.systolic_bp ?? 120,
        diastolic_bp: patient.diastolic_bp ?? 80,
        is_smoker: !!patient.is_smoker,
        has_diabetes_history: !!patient.has_diabetes_history,
        has_hypertension: !!patient.has_hypertension,
        fasting_glucose: patient.fasting_glucose ?? undefined,
        hba1c: patient.hba1c ?? undefined,
        total_cholesterol: patient.total_cholesterol ?? undefined,
        hdl_cholesterol: patient.hdl_cholesterol ?? undefined,
        ldl_cholesterol: patient.ldl_cholesterol ?? undefined,
        family_history_diabetes: !!patient.family_history_diabetes,
        family_history_cad: !!patient.family_history_cad,
        family_history_breast_cancer: !!patient.family_history_breast_cancer,
        family_history_colorectal_cancer: !!patient.family_history_colorectal_cancer,
        cervix_present: patient.cervix_present !== false,
        last_diabetes_screen_date: patient.last_diabetes_screen_date ?? undefined,
        last_lipid_panel_date: patient.last_lipid_panel_date ?? undefined,
        last_bp_check_date: patient.last_bp_check_date ?? undefined,
        last_mammogram_date: patient.last_mammogram_date ?? undefined,
        last_cervical_screen_date: patient.last_cervical_screen_date ?? undefined,
        last_colorectal_screen_date: patient.last_colorectal_screen_date ?? undefined,
        colorectal_screen_type: patient.colorectal_screen_type || 'colonoscopy',
      });
    }
  }, [patient]);

  const handleChange = (field: keyof PatientCreateInput, value: any) => {
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
      await patientService.update(patient.id, formData);
      onPatientUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update patient record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Patient: ${patient.full_name}`}
      description="Update clinical vitals, medical history, and screening records. Guidelines will automatically re-evaluate."
      maxWidth="2xl"
    >
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('demographics')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'demographics'
              ? 'border-[#378C83] text-[#378C83]'
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
              ? 'border-[#378C83] text-[#378C83]'
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
              ? 'border-[#378C83] text-[#378C83]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Medical & Family History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('screenings')}
          className={`pb-2.5 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeTab === 'screenings'
              ? 'border-[#378C83] text-[#378C83]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Prior Screening Dates
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              required
            />
            <Input
              label="Last Name *"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              required
            />
            <Input
              label="Date of Birth *"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              required
            />
            <Select
              label="Biological Sex *"
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              options={[
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' },
              ]}
              required
            />
            <Input
              label="Email Address (Optional)"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="patient@example.com"
            />
            <Input
              label="Phone Number (Optional)"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+971 50 123 4567"
            />
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Body Mass Index (BMI)"
              type="number"
              step="0.1"
              value={formData.bmi ?? ''}
              onChange={(e) => handleChange('bmi', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g. 27.5"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Systolic BP"
                type="number"
                value={formData.systolic_bp ?? ''}
                onChange={(e) => handleChange('systolic_bp', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="mmHg"
              />
              <Input
                label="Diastolic BP"
                type="number"
                value={formData.diastolic_bp ?? ''}
                onChange={(e) => handleChange('diastolic_bp', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="mmHg"
              />
            </div>
            <Input
              label="Fasting Blood Glucose (mg/dL)"
              type="number"
              step="0.1"
              value={formData.fasting_glucose ?? ''}
              onChange={(e) => handleChange('fasting_glucose', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Normal: < 100 mg/dL"
            />
            <Input
              label="Hemoglobin A1c (%)"
              type="number"
              step="0.1"
              value={formData.hba1c ?? ''}
              onChange={(e) => handleChange('hba1c', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Prediabetes: 5.7 - 6.4%"
            />
            <Input
              label="Total Cholesterol (mg/dL)"
              type="number"
              step="0.1"
              value={formData.total_cholesterol ?? ''}
              onChange={(e) => handleChange('total_cholesterol', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Desired: < 200 mg/dL"
            />
            <Input
              label="LDL Cholesterol (mg/dL)"
              type="number"
              step="0.1"
              value={formData.ldl_cholesterol ?? ''}
              onChange={(e) => handleChange('ldl_cholesterol', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Desired: < 100 mg/dL"
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700">Patient Clinical Conditions & Lifestyle</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_smoker}
                    onChange={(e) => handleChange('is_smoker', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Active Tobacco Smoker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_hypertension}
                    onChange={(e) => handleChange('has_hypertension', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Documented Essential Hypertension</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_diabetes_history}
                    onChange={(e) => handleChange('has_diabetes_history', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Prior Diagnosis of Type 2 Diabetes</span>
                </label>
                {formData.sex === 'female' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cervix_present}
                      onChange={(e) => handleChange('cervix_present', e.target.checked)}
                      className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                    />
                    <span>Cervix Present (No total hysterectomy)</span>
                  </label>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700">First-Degree Family Hereditary History</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.family_history_diabetes}
                    onChange={(e) => handleChange('family_history_diabetes', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Type 2 Diabetes (Parent/Sibling)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.family_history_cad}
                    onChange={(e) => handleChange('family_history_cad', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Premature CAD / Heart Attack</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.family_history_breast_cancer}
                    onChange={(e) => handleChange('family_history_breast_cancer', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Breast Cancer (Mother/Sister/Daughter)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.family_history_colorectal_cancer}
                    onChange={(e) => handleChange('family_history_colorectal_cancer', e.target.checked)}
                    className="rounded border-slate-300 text-[#378C83] focus:ring-[#378C83]"
                  />
                  <span>Colorectal Cancer (Parent/Sibling)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screenings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Most Recent Diabetes Screening Date"
              type="date"
              value={formData.last_diabetes_screen_date || ''}
              onChange={(e) => handleChange('last_diabetes_screen_date', e.target.value || undefined)}
            />
            <Input
              label="Most Recent Lipid Panel Date"
              type="date"
              value={formData.last_lipid_panel_date || ''}
              onChange={(e) => handleChange('last_lipid_panel_date', e.target.value || undefined)}
            />
            <Input
              label="Most Recent Blood Pressure Check Date"
              type="date"
              value={formData.last_bp_check_date || ''}
              onChange={(e) => handleChange('last_bp_check_date', e.target.value || undefined)}
            />
            {formData.sex === 'female' && (
              <>
                <Input
                  label="Most Recent Mammogram Date"
                  type="date"
                  value={formData.last_mammogram_date || ''}
                  onChange={(e) => handleChange('last_mammogram_date', e.target.value || undefined)}
                />
                <Input
                  label="Most Recent Cervical Cytology Date"
                  type="date"
                  value={formData.last_cervical_screen_date || ''}
                  onChange={(e) => handleChange('last_cervical_screen_date', e.target.value || undefined)}
                />
              </>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 col-span-1 sm:col-span-2">
              <Input
                label="Most Recent Colorectal Screening Date"
                type="date"
                value={formData.last_colorectal_screen_date || ''}
                onChange={(e) => handleChange('last_colorectal_screen_date', e.target.value || undefined)}
              />
              <Select
                label="Colorectal Screening Modality"
                value={formData.colorectal_screen_type || 'colonoscopy'}
                onChange={(e) => handleChange('colorectal_screen_type', e.target.value)}
                options={[
                  { label: 'Screening Colonoscopy (10-yr interval)', value: 'colonoscopy' },
                  { label: 'Annual Fecal Immunochemical Test (FIT)', value: 'fit_annual' },
                  { label: 'Stool DNA-FIT / Cologuard (3-yr interval)', value: 'stool_dna' },
                ]}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex gap-2">
            {activeTab !== 'demographics' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'screenings') setActiveTab('history');
                  else if (activeTab === 'history') setActiveTab('vitals');
                  else if (activeTab === 'vitals') setActiveTab('demographics');
                }}
              >
                Previous Step
              </Button>
            )}
            {activeTab !== 'screenings' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeTab === 'demographics') setActiveTab('vitals');
                  else if (activeTab === 'vitals') setActiveTab('history');
                  else if (activeTab === 'history') setActiveTab('screenings');
                }}
              >
                Next Step
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={loading}>
              Save & Recalculate
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
