import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Activity,
  Dna,
  ArrowRight,
  Info,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { screeningService } from '../services/screeningService';
import { Patient, ScreeningAssessment, PatientCreateInput } from '../types';
import { ScreeningAlertCard } from '../components/ScreeningAlertCard';
import { NewFollowUpModal } from '../components/NewFollowUpModal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const ScreeningAssessmentPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('custom');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState<ScreeningAssessment[]>([]);
  const [activePathwayFilter, setActivePathwayFilter] = useState<string>('all');
  
  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedAssessmentForFollowUp, setSelectedAssessmentForFollowUp] = useState<ScreeningAssessment | null>(null);

  // Form state for custom or selected patient
  const [formData, setFormData] = useState<PatientCreateInput>({
    first_name: 'Arthur',
    last_name: 'Pendleton',
    date_of_birth: '1976-06-15', // 50 years old
    sex: 'male',
    bmi: 28.4,
    systolic_bp: 136,
    diastolic_bp: 86,
    is_smoker: true,
    has_diabetes_history: false,
    has_hypertension: true,
    fasting_glucose: 112.0,
    hba1c: 6.0,
    total_cholesterol: 230.0,
    ldl_cholesterol: 150.0,
    family_history_diabetes: true,
    family_history_cad: true,
    family_history_breast_cancer: false,
    family_history_colorectal_cancer: true,
    cervix_present: false,
    last_diabetes_screen_date: '2022-01-10',
    last_lipid_panel_date: '2021-05-15',
    last_bp_check_date: '2024-02-20',
    last_colorectal_screen_date: undefined,
    colorectal_screen_type: 'colonoscopy',
  });

  useEffect(() => {
    patientService.getAll().then((data) => {
      setPatients(data);
    });
  }, []);

  const handlePatientSelect = (pid: string) => {
    setSelectedPatientId(pid);
    if (pid === 'custom') {
      return;
    }
    const found = patients.find((p) => p.id === parseInt(pid, 10));
    if (found) {
      setFormData({
        first_name: found.first_name,
        last_name: found.last_name,
        date_of_birth: found.date_of_birth,
        sex: found.sex,
        email: found.email,
        phone: found.phone,
        bmi: found.bmi,
        systolic_bp: found.systolic_bp,
        diastolic_bp: found.diastolic_bp,
        is_smoker: found.is_smoker,
        has_diabetes_history: found.has_diabetes_history,
        has_hypertension: found.has_hypertension,
        fasting_glucose: found.fasting_glucose,
        hba1c: found.hba1c,
        total_cholesterol: found.total_cholesterol,
        hdl_cholesterol: found.hdl_cholesterol,
        ldl_cholesterol: found.ldl_cholesterol,
        family_history_diabetes: found.family_history_diabetes,
        family_history_cad: found.family_history_cad,
        family_history_breast_cancer: found.family_history_breast_cancer,
        family_history_colorectal_cancer: found.family_history_colorectal_cancer,
        cervix_present: found.cervix_present,
        last_diabetes_screen_date: found.last_diabetes_screen_date,
        last_lipid_panel_date: found.last_lipid_panel_date,
        last_bp_check_date: found.last_bp_check_date,
        last_mammogram_date: found.last_mammogram_date,
        last_cervical_screen_date: found.last_cervical_screen_date,
        last_colorectal_screen_date: found.last_colorectal_screen_date,
        colorectal_screen_type: found.colorectal_screen_type,
      });

      // Fetch existing assessments for this patient
      screeningService.getByPatientId(found.id).then((assessments) => {
        setResults(assessments);
      });
    }
  };

  const handleRunAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      if (selectedPatientId !== 'custom') {
        const pid = parseInt(selectedPatientId, 10);
        // Update patient parameters and recalculate
        await patientService.update(pid, formData);
        const updated = await screeningService.reEvaluate(pid);
        setResults(updated);
      } else {
        // Run simulator endpoint
        const simulated = await screeningService.simulate(formData);
        setResults(simulated);
      }
    } catch (err) {
      console.error('Failed to run assessment:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (activePathwayFilter === 'all') return true;
    if (activePathwayFilter === 'diabetes') return r.category === 'diabetes';
    if (activePathwayFilter === 'cardiovascular') return r.category === 'cardiovascular';
    if (activePathwayFilter === 'cancer') return r.category.startsWith('cancer_');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#378C83]" />
            <span>Screening Assessment Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate adult clinical parameters against USPSTF, ADA, and ACC/AHA guidelines in real-time.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="w-full sm:w-72">
          <Select
            label="Load Patient Profile"
            value={selectedPatientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
            options={[
              { label: '★ Custom Simulator (Enter any values)', value: 'custom' },
              ...patients.map((p) => ({
                label: `${p.full_name} (${p.age}y, ${p.sex})`,
                value: String(p.id),
              })),
            ]}
          />
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Two Column Layout: Assessment Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clinical Parameters Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="py-3.5 bg-[#F6F8FB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Assessment Parameters</CardTitle>
                <span className="text-[10px] uppercase font-bold text-[#378C83] bg-[#edf7f5] px-2 py-0.5 rounded border border-[#bfe3de]">
                  {selectedPatientId === 'custom' ? 'Simulator' : 'Existing Patient'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <form onSubmit={handleRunAssessment} className="space-y-4">
                {/* Demographics */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    1. Demographics & Baseline
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Date of Birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                    />
                    <Select
                      label="Sex at Birth"
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                      options={[
                        { label: 'Male', value: 'male' },
                        { label: 'Female', value: 'female' },
                        { label: 'Other', value: 'other' },
                      ]}
                    />
                  </div>
                </div>

                {/* Vitals & Biomarkers */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    2. Vitals & Laboratory Values
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="BMI (kg/m²)"
                      type="number"
                      step="0.1"
                      value={formData.bmi || ''}
                      onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) || undefined })}
                      placeholder="25.0"
                    />
                    <Input
                      label="Systolic BP"
                      type="number"
                      value={formData.systolic_bp || ''}
                      onChange={(e) => setFormData({ ...formData, systolic_bp: parseInt(e.target.value, 10) || undefined })}
                      placeholder="120"
                    />
                    <Input
                      label="Diastolic BP"
                      type="number"
                      value={formData.diastolic_bp || ''}
                      onChange={(e) => setFormData({ ...formData, diastolic_bp: parseInt(e.target.value, 10) || undefined })}
                      placeholder="80"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Fasting Glucose (mg/dL)"
                      type="number"
                      value={formData.fasting_glucose || ''}
                      onChange={(e) => setFormData({ ...formData, fasting_glucose: parseFloat(e.target.value) || undefined })}
                      placeholder="100"
                    />
                    <Input
                      label="HbA1c (%)"
                      type="number"
                      step="0.1"
                      value={formData.hba1c || ''}
                      onChange={(e) => setFormData({ ...formData, hba1c: parseFloat(e.target.value) || undefined })}
                      placeholder="5.7"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Total Cholesterol"
                      type="number"
                      value={formData.total_cholesterol || ''}
                      onChange={(e) => setFormData({ ...formData, total_cholesterol: parseFloat(e.target.value) || undefined })}
                      placeholder="200"
                    />
                    <Input
                      label="LDL Cholesterol"
                      type="number"
                      value={formData.ldl_cholesterol || ''}
                      onChange={(e) => setFormData({ ...formData, ldl_cholesterol: parseFloat(e.target.value) || undefined })}
                      placeholder="130"
                    />
                  </div>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_smoker}
                        onChange={(e) => setFormData({ ...formData, is_smoker: e.target.checked })}
                        className="rounded text-[#173A56] focus:ring-[#378C83]"
                      />
                      <span>Active Tobacco User</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_hypertension}
                        onChange={(e) => setFormData({ ...formData, has_hypertension: e.target.checked })}
                        className="rounded text-[#173A56] focus:ring-[#378C83]"
                      />
                      <span>Diagnosed HTN</span>
                    </label>
                  </div>
                </div>

                {/* Family History */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    3. First-Degree Family History
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 bg-[#F6F8FB] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.family_history_diabetes}
                        onChange={(e) => setFormData({ ...formData, family_history_diabetes: e.target.checked })}
                        className="rounded text-[#173A56]"
                      />
                      <span>Type 2 Diabetes</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-[#F6F8FB] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.family_history_cad}
                        onChange={(e) => setFormData({ ...formData, family_history_cad: e.target.checked })}
                        className="rounded text-[#173A56]"
                      />
                      <span>Premature CAD</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-[#F6F8FB] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.family_history_breast_cancer}
                        onChange={(e) => setFormData({ ...formData, family_history_breast_cancer: e.target.checked })}
                        className="rounded text-[#173A56]"
                      />
                      <span>Breast Cancer</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 bg-[#F6F8FB] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.family_history_colorectal_cancer}
                        onChange={(e) => setFormData({ ...formData, family_history_colorectal_cancer: e.target.checked })}
                        className="rounded text-[#173A56]"
                      />
                      <span>Colorectal Cancer</span>
                    </label>
                  </div>
                </div>

                {/* Prior Screenings Dates */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    4. Prior Recorded Screening Dates
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Last Diabetes Test"
                      type="date"
                      value={formData.last_diabetes_screen_date || ''}
                      onChange={(e) => setFormData({ ...formData, last_diabetes_screen_date: e.target.value || undefined })}
                    />
                    <Input
                      label="Last Lipid Panel"
                      type="date"
                      value={formData.last_lipid_panel_date || ''}
                      onChange={(e) => setFormData({ ...formData, last_lipid_panel_date: e.target.value || undefined })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.sex === 'female' && (
                      <Input
                        label="Last Mammogram"
                        type="date"
                        value={formData.last_mammogram_date || ''}
                        onChange={(e) => setFormData({ ...formData, last_mammogram_date: e.target.value || undefined })}
                      />
                    )}
                    <Input
                      label="Last Colorectal Screen"
                      type="date"
                      value={formData.last_colorectal_screen_date || ''}
                      onChange={(e) => setFormData({ ...formData, last_colorectal_screen_date: e.target.value || undefined })}
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-slate-100">
                  <Button
                    type="submit"
                    variant="teal"
                    size="md"
                    className="w-full"
                    isLoading={evaluating}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Clinical Guidelines Assessment</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assessment Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#173A56] tracking-tight">
                Assessment Results & AI Explanations
              </h2>
              <p className="text-xs text-slate-500">
                {results.length > 0
                  ? `Evaluated against 5 USPSTF/ADA clinical pathways for ${formData.first_name} ${formData.last_name}`
                  : 'Click "Run Clinical Guidelines Assessment" to generate results'}
              </p>
            </div>

            {results.length > 0 && (
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                <button
                  onClick={() => setActivePathwayFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activePathwayFilter === 'all' ? 'bg-[#173A56] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setActivePathwayFilter('diabetes')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activePathwayFilter === 'diabetes' ? 'bg-[#173A56] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Diabetes
                </button>
                <button
                  onClick={() => setActivePathwayFilter('cardiovascular')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activePathwayFilter === 'cardiovascular' ? 'bg-[#173A56] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cardio
                </button>
                <button
                  onClick={() => setActivePathwayFilter('cancer')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activePathwayFilter === 'cancer' ? 'bg-[#173A56] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancer
                </button>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-[#378C83] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#173A56]">Ready to evaluate patient</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Fill out or adjust the clinical parameters on the left and click "Run Clinical Guidelines Assessment" to see immediate risk flags and preventive next steps.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((assessment) => (
                <ScreeningAlertCard
                  key={assessment.category}
                  assessment={assessment}
                  patientName={`${formData.first_name} ${formData.last_name}`}
                  onScheduleFollowUp={(a) => {
                    setSelectedAssessmentForFollowUp(a);
                    setIsFollowUpModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up modal if created from this page */}
      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        patientId={selectedPatientId !== 'custom' ? parseInt(selectedPatientId, 10) : 1}
        patientName={`${formData.first_name} ${formData.last_name}`}
        assessment={selectedAssessmentForFollowUp}
        onTaskCreated={() => {
          setIsFollowUpModalOpen(false);
        }}
      />
    </div>
  );
};
