import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Activity,
  HeartPulse,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { screeningService } from '../services/screeningService';
import { Patient, ScreeningAssessment } from '../types';
import { ScreeningAlertCard } from '../components/ScreeningAlertCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const ScreeningAssessmentPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [screenings, setScreenings] = useState<ScreeningAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePathwayTab, setActivePathwayTab] = useState<'all' | 'diabetes' | 'cardiovascular' | 'cancer'>('all');

  useEffect(() => {
    patientService.getAll().then((data) => {
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatientId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setLoading(true);
      screeningService.getByPatientId(selectedPatientId)
        .then((data) => setScreenings(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedPatientId]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const filteredScreenings = screenings.filter((s) => {
    if (activePathwayTab === 'all') return true;
    if (activePathwayTab === 'diabetes') return s.category === 'diabetes';
    if (activePathwayTab === 'cardiovascular') return s.category === 'cardiovascular';
    if (activePathwayTab === 'cancer') return s.category.startsWith('cancer_');
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Preventive Screening Pathways</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated clinical decision evaluation across Diabetes, Cardiovascular, and Cancer screening pathways.
          </p>
        </div>

        {patients.length > 0 && (
          <div className="w-72">
            <Select
              label="Select Patient to Assess"
              value={selectedPatientId || ''}
              onChange={(e) => setSelectedPatientId(parseInt(e.target.value, 10))}
              options={patients.map((p) => ({
                label: `${p.full_name} (${p.age}y, ${p.sex})`,
                value: p.id,
              }))}
            />
          </div>
        )}
      </div>

      <ClinicalDisclaimer variant="compact" />

      {/* Domain Pathway Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActivePathwayTab('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activePathwayTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All 5 Pathways ({screenings.length})
        </button>
        <button
          onClick={() => setActivePathwayTab('diabetes')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activePathwayTab === 'diabetes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          1. Diabetes Pathway
        </button>
        <button
          onClick={() => setActivePathwayTab('cardiovascular')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activePathwayTab === 'cardiovascular'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          2. Cardiovascular Pathway
        </button>
        <button
          onClick={() => setActivePathwayTab('cancer')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
            activePathwayTab === 'cancer'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          3. Cancer Screening Pathways (Breast, Cervical, Colorectal)
        </button>
      </div>

      {/* Selected Patient Banner */}
      {selectedPatient && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                Evaluating: {selectedPatient.full_name}
              </p>
              <p className="text-xs text-slate-500">
                Age {selectedPatient.age} ({selectedPatient.sex}) • BMI: {selectedPatient.bmi || 'N/A'} • BP: {selectedPatient.systolic_bp || 'N/A'}/{selectedPatient.diastolic_bp || 'N/A'} mmHg
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="purple">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Decision Rationale Enabled</span>
            </Badge>
          </div>
        </div>
      )}

      {/* Assessments list */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Evaluating clinical guidelines...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScreenings.map((assessment) => (
            <ScreeningAlertCard
              key={assessment.category}
              assessment={assessment}
              patientName={selectedPatient?.full_name}
            />
          ))}
        </div>
      )}
    </div>
  );
};
