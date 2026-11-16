import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  HeartPulse,
  Activity,
  Calendar,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Dna,
  FileText,
  AlertTriangle,
  Mail,
  Phone,
  CalendarPlus,
  Edit,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { screeningService } from '../services/screeningService';
import { followUpService } from '../services/followUpService';
import { Patient, ScreeningAssessment, FollowUpTask } from '../types';
import { ScreeningAlertCard } from '../components/ScreeningAlertCard';
import { NewFollowUpModal } from '../components/NewFollowUpModal';
import { EditPatientModal } from '../components/EditPatientModal';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id || '0', 10);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [screenings, setScreenings] = useState<ScreeningAssessment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<ScreeningAssessment | null>(null);
  const [activeSection, setActiveSection] = useState<'assessments' | 'history' | 'followups'>('assessments');

  const loadData = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const [patientData, screeningsData, followUpsData] = await Promise.all([
        patientService.getById(patientId),
        screeningService.getByPatientId(patientId),
        followUpService.getAll(patientId),
      ]);
      setPatient(patientData);
      setScreenings(screeningsData);
      setFollowUps(followUpsData);
    } catch (err) {
      console.error('Error fetching patient details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

  const handleReevaluate = async () => {
    if (!patientId) return;
    setEvaluating(true);
    try {
      const updated = await screeningService.reEvaluate(patientId);
      setScreenings(updated);
    } catch (err) {
      console.error('Failed to re-evaluate screenings:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleTaskStatus = async (task: FollowUpTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await followUpService.update(task.id, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      });
      const updatedTasks = await followUpService.getAll(patientId);
      setFollowUps(updatedTasks);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleScheduleFollowUp = (assessment: ScreeningAssessment) => {
    setSelectedAssessment(assessment);
    setIsFollowUpModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-sm font-semibold text-[#173A56]">Patient record not found.</p>
        <Link to="/patients" className="text-[#378C83] font-semibold text-xs mt-2 inline-block">
          ← Back to Patient Directory
        </Link>
      </div>
    );
  }

  const patientIdFormatted = `SW-${String(100 + patient.id).padStart(5, '0')}`;
  const overdueCount = screenings.filter((s) => s.status === 'overdue').length;
  const flaggedCount = screenings.filter((s) => s.status === 'flagged_risk').length;

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-[#F6F8FB] text-[#173A56] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {patientIdFormatted}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[#173A56]">
                {patient.full_name}
              </h1>
              <Badge variant="navy" size="sm">
                {patient.age}y • {patient.sex}
              </Badge>
              {overdueCount > 0 && (
                <Badge variant="warning" size="sm">{overdueCount} Overdue</Badge>
              )}
              {flaggedCount > 0 && (
                <Badge variant="danger" size="sm">{flaggedCount} Flagged Risk</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span>DOB: {patient.date_of_birth}</span>
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {patient.email}
                </span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {patient.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile & Vitals</span>
          </Button>
          <Button
            onClick={handleReevaluate}
            variant="outline"
            size="sm"
            isLoading={evaluating}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate AI Guidelines</span>
          </Button>
          <Button
            onClick={() => {
              setSelectedAssessment(null);
              setIsFollowUpModalOpen(true);
            }}
            variant="teal"
            size="sm"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>New Follow-Up Action</span>
          </Button>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Patient Measurements & Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* BMI */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            Body Mass Index
          </span>
          <span className="text-lg font-bold text-[#173A56]">
            {patient.bmi ? `${patient.bmi.toFixed(1)}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.bmi ? (patient.bmi >= 25 ? 'Overweight / Obese' : 'Normal weight') : 'Not measured'}
          </span>
        </Card>

        {/* Blood Pressure */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            Blood Pressure
          </span>
          <span className={`text-lg font-bold ${patient.systolic_bp && patient.systolic_bp >= 130 ? 'text-rose-600' : 'text-[#173A56]'}`}>
            {patient.systolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.systolic_bp ? (patient.systolic_bp >= 130 ? 'Stage 1/2 HTN' : 'Normal BP') : 'Unchecked'}
          </span>
        </Card>

        {/* Fasting Glucose */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            Fasting Glucose
          </span>
          <span className="text-lg font-bold text-[#173A56]">
            {patient.fasting_glucose ? `${patient.fasting_glucose}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.fasting_glucose ? (patient.fasting_glucose >= 100 ? 'mg/dL (Impaired)' : 'mg/dL (Normal)') : 'No lab'}
          </span>
        </Card>

        {/* HbA1c */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            HbA1c
          </span>
          <span className={`text-lg font-bold ${patient.hba1c && patient.hba1c >= 5.7 ? 'text-amber-600' : 'text-[#173A56]'}`}>
            {patient.hba1c ? `${patient.hba1c}%` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.hba1c ? (patient.hba1c >= 5.7 ? 'Prediabetic range' : 'Optimal glycemic') : 'No lab'}
          </span>
        </Card>

        {/* Total Cholesterol */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            Total Cholesterol
          </span>
          <span className="text-lg font-bold text-[#173A56]">
            {patient.total_cholesterol ? `${patient.total_cholesterol}` : '—'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.ldl_cholesterol ? `LDL: ${patient.ldl_cholesterol} mg/dL` : 'No lipid panel'}
          </span>
        </Card>

        {/* Tobacco Status */}
        <Card className="p-4">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
            Tobacco Use
          </span>
          <span className={`text-lg font-bold ${patient.is_smoker ? 'text-rose-600' : 'text-[#378C83]'}`}>
            {patient.is_smoker ? 'Active' : 'None'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {patient.is_smoker ? 'Elevates CVD risk' : 'Non-tobacco user'}
          </span>
        </Card>
      </div>

      {/* Tabs Row for Section Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveSection('assessments')}
          className={`pb-3 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeSection === 'assessments'
              ? 'border-[#173A56] text-[#173A56]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Screening Pathways ({screenings.length})
        </button>
        <button
          onClick={() => setActiveSection('history')}
          className={`pb-3 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeSection === 'history'
              ? 'border-[#173A56] text-[#173A56]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinical History & Screenings Log
        </button>
        <button
          onClick={() => setActiveSection('followups')}
          className={`pb-3 px-3 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
            activeSection === 'followups'
              ? 'border-[#173A56] text-[#173A56]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Follow-Up Care Orders ({followUps.length})
        </button>
      </div>

      {/* Tab 1: Screening Assessments */}
      {activeSection === 'assessments' && (
        <div className="space-y-4">
          {screenings.map((assessment) => (
            <ScreeningAlertCard
              key={assessment.category}
              assessment={assessment}
              patientName={patient.full_name}
              onScheduleFollowUp={handleScheduleFollowUp}
            />
          ))}
        </div>
      )}

      {/* Tab 2: Clinical History & Screenings Log */}
      {activeSection === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medical, Family & Lifestyle History */}
          <Card>
            <CardHeader>
              <CardTitle>Medical & Hereditary History</CardTitle>
              <p className="text-xs text-slate-500">Documented personal & familial risk factors</p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Diagnosed Hypertension:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.has_hypertension ? 'Yes (Clinical Dx)' : 'No prior diagnosis'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Family History of Diabetes:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.family_history_diabetes ? 'Positive (1st Degree)' : 'None reported'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Family History of Early CAD:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.family_history_cad ? 'Positive (Premature CVD)' : 'None reported'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Family History of Breast Cancer:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.family_history_breast_cancer ? 'Positive (Elevated risk)' : 'None reported'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Family History of Colorectal Cancer:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.family_history_colorectal_cancer ? 'Positive (Starts age 40)' : 'None reported'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Cervix Status:</span>
                <span className="font-semibold text-[#173A56]">
                  {patient.sex === 'male' ? 'N/A' : (patient.cervix_present ? 'Present (Screening eligible)' : 'Absent (Benign hysterectomy)')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Previous Screening Log */}
          <Card>
            <CardHeader>
              <CardTitle>Previous Screening Dates</CardTitle>
              <p className="text-xs text-slate-500">Documented dates and clinical screening modalities</p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Last Diabetes Test (FPG/A1c):</span>
                <span className="font-mono font-medium text-[#173A56]">
                  {patient.last_diabetes_screen_date || 'No record on file'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Last Lipid Panel:</span>
                <span className="font-mono font-medium text-[#173A56]">
                  {patient.last_lipid_panel_date || 'No record on file'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Last Clinical BP Measurement:</span>
                <span className="font-mono font-medium text-[#173A56]">
                  {patient.last_bp_check_date || 'No record on file'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Last Screening Mammogram:</span>
                <span className="font-mono font-medium text-[#173A56]">
                  {patient.last_mammogram_date || (patient.sex === 'male' ? 'Not indicated (Male)' : 'No record on file')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Last Cervical Cytology / HPV:</span>
                <span className="font-mono font-medium text-[#173A56]">
                  {patient.last_cervical_screen_date || (patient.sex === 'male' ? 'Not indicated (Male)' : 'No record on file')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Last Colorectal Screen:</span>
                <div className="text-right">
                  <span className="font-mono font-medium text-[#173A56] block">
                    {patient.last_colorectal_screen_date || 'No record on file'}
                  </span>
                  {patient.colorectal_screen_type && (
                    <span className="text-[10px] text-slate-400 capitalize">
                      Modality: {patient.colorectal_screen_type}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Follow-Up Care Orders */}
      {activeSection === 'followups' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assigned Follow-Up Care Orders</CardTitle>
              <p className="text-xs text-slate-500">Track and log diagnostic appointments and order completion</p>
            </div>
            <Button
              onClick={() => {
                setSelectedAssessment(null);
                setIsFollowUpModalOpen(true);
              }}
              variant="teal"
              size="xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Schedule Action</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {followUps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active follow-up orders for this patient. Click "Schedule Action" to assign one.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {followUps.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-[#F6F8FB] transition-colors">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`mt-0.5 p-1 rounded-md border transition-colors cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-[#378C83] border-[#378C83] text-white'
                            : 'border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                        title={task.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div>
                        <p className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#173A56]'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="capitalize">Type: {task.action_type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>Due: {task.due_date}</span>
                          {task.assigned_provider && (
                            <>
                              <span>•</span>
                              <span>Provider: {task.assigned_provider}</span>
                            </>
                          )}
                          {task.completed_date && (
                            <>
                              <span>•</span>
                              <span className="text-[#378C83] font-semibold">Done: {task.completed_date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {task.status === 'completed' ? (
                        <Badge variant="teal" size="sm">Completed</Badge>
                      ) : task.priority === 'urgent' ? (
                        <Badge variant="danger" size="sm">Urgent</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Follow-up scheduling modal */}
      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        patientId={patient.id}
        patientName={patient.full_name}
        assessment={selectedAssessment}
        onTaskCreated={() => loadData()}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onPatientUpdated={() => loadData()}
      />
    </div>
  );
};
