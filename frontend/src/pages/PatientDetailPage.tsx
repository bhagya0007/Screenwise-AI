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
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { screeningService } from '../services/screeningService';
import { followUpService } from '../services/followUpService';
import { Patient, ScreeningAssessment, FollowUpTask } from '../types';
import { ScreeningAlertCard } from '../components/ScreeningAlertCard';
import { NewFollowUpModal } from '../components/NewFollowUpModal';
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
  const [selectedAssessment, setSelectedAssessment] = useState<ScreeningAssessment | null>(null);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p className="text-base font-semibold">Patient record not found.</p>
        <Link to="/patients" className="text-blue-600 font-semibold text-xs mt-2 inline-block">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  const overdueCount = screenings.filter((s) => s.status === 'overdue').length;
  const flaggedCount = screenings.filter((s) => s.status === 'flagged_risk').length;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/patients"
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {patient.full_name}
              </h1>
              <Badge variant="secondary" size="md">
                Age {patient.age} ({patient.sex})
              </Badge>
              {overdueCount > 0 && (
                <Badge variant="warning">{overdueCount} Overdue</Badge>
              )}
              {flaggedCount > 0 && (
                <Badge variant="danger">{flaggedCount} Flagged Risk</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              DOB: {patient.date_of_birth} • Patient ID: #{patient.id} • Registered:{' '}
              {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            variant="primary"
            size="sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Follow-Up Task</span>
          </Button>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Patient Clinical Profile Summary Card */}
      <Card>
        <CardHeader className="bg-slate-50/70 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Clinical Profile & Screening Parameters</span>
            </span>
            <span className="text-xs text-slate-400">
              Biomarkers used for USPSTF & ADA risk engines
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Body Mass Index</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.bmi ? `${patient.bmi.toFixed(1)} kg/m²` : 'Not recorded'}
              </span>
              {patient.bmi && patient.bmi >= 25 && (
                <span className="text-[10px] text-amber-600 font-medium block mt-0.5">Overweight</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Blood Pressure</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.systolic_bp ? `${patient.systolic_bp}/${patient.diastolic_bp} mmHg` : 'Unchecked'}
              </span>
              {patient.systolic_bp && patient.systolic_bp >= 130 && (
                <span className="text-[10px] text-rose-600 font-medium block mt-0.5">Stage 1/2 HTN</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Fasting Glucose</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.fasting_glucose ? `${patient.fasting_glucose} mg/dL` : 'No lab'}
              </span>
              {patient.fasting_glucose && patient.fasting_glucose >= 100 && (
                <span className="text-[10px] text-amber-600 font-medium block mt-0.5">Impaired</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">HbA1c</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.hba1c ? `${patient.hba1c}%` : 'No lab'}
              </span>
              {patient.hba1c && patient.hba1c >= 5.7 && (
                <span className="text-[10px] text-amber-600 font-medium block mt-0.5">Prediabetes</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Total Cholesterol</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.total_cholesterol ? `${patient.total_cholesterol} mg/dL` : 'No lipid panel'}
              </span>
              {patient.ldl_cholesterol && (
                <span className="text-[10px] text-slate-500 block mt-0.5">LDL: {patient.ldl_cholesterol}</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-1">Tobacco Use</span>
              <span className="text-sm font-bold text-slate-800">
                {patient.is_smoker ? 'Active Smoker' : 'Non-smoker'}
              </span>
              {patient.is_smoker && (
                <span className="text-[10px] text-rose-600 font-medium block mt-0.5">Elevates CVD</span>
              )}
            </div>
          </div>

          {/* Family histories */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Family & Clinical Histories:</span>
            {patient.family_history_diabetes && <Badge variant="warning">Fam. Diabetes</Badge>}
            {patient.family_history_cad && <Badge variant="warning">Fam. Early CAD</Badge>}
            {patient.family_history_breast_cancer && <Badge variant="danger">Fam. Breast Cancer</Badge>}
            {patient.family_history_colorectal_cancer && <Badge variant="danger">Fam. Colorectal Cancer</Badge>}
            {!patient.cervix_present && <Badge variant="secondary">Prior Hysterectomy (Cervix absent)</Badge>}
            {!patient.family_history_diabetes &&
              !patient.family_history_cad &&
              !patient.family_history_breast_cancer &&
              !patient.family_history_colorectal_cancer && (
                <span className="text-slate-400 italic">No significant hereditary flags reported.</span>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Screening Assessments List across 5 Pathways */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Adult Screening Pathways Assessment</span>
            </h2>
            <p className="text-xs text-slate-500">
              Evidence-based evaluation across Diabetes, Cardiovascular, and Cancer pathways.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            5 Pathways Evaluated
          </span>
        </div>

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
      </div>

      {/* Follow-up Care Tracker for this Patient */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Patient Follow-Up Actions & Orders</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Track clinical orders, screening appointments, and completion status.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedAssessment(null);
              setIsFollowUpModalOpen(true);
            }}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Action</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {followUps.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No follow-up tasks currently assigned for this patient. Click "Schedule Follow-Up" on any flagged pathway.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {followUps.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`mt-0.5 p-1 rounded-full border transition-colors cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 text-transparent hover:border-slate-400'
                      }`}
                      title={task.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="capitalize">Type: {task.action_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Target: {task.due_date}</span>
                        {task.assigned_provider && (
                          <>
                            <span>•</span>
                            <span>Provider: {task.assigned_provider}</span>
                          </>
                        )}
                        {task.completed_date && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">Completed: {task.completed_date}</span>
                          </>
                        )}
                      </div>
                      {task.clinical_notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          Notes: {task.clinical_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    {task.status === 'completed' ? (
                      <Badge variant="success">Completed</Badge>
                    ) : task.priority === 'urgent' ? (
                      <Badge variant="danger">Urgent Action</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-up modal */}
      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        patientId={patient.id}
        patientName={patient.full_name}
        assessment={selectedAssessment}
        onTaskCreated={() => {
          loadData();
        }}
      />
    </div>
  );
};
