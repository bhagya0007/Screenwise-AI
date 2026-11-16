import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  ArrowRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { NewPatientModal } from '../components/NewPatientModal';

type SortField = 'id' | 'name' | 'age' | 'status';
type SortOrder = 'asc' | 'desc';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_review' | 'compliant'>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await patientService.getAll(search);
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatients();
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Helper to determine clinical screening status for a patient
  const getPatientScreeningStatus = (patient: Patient) => {
    // If patient has unaddressed flags or overdue tests
    const isOverdue = 
      (patient.age >= 45 && !patient.last_colorectal_screen_date) ||
      (patient.sex === 'female' && patient.age >= 40 && !patient.last_mammogram_date) ||
      (patient.age >= 35 && (patient.bmi || 0) >= 25 && !patient.last_diabetes_screen_date);
    
    const isFlagged = 
      (patient.systolic_bp && patient.systolic_bp >= 130) ||
      (patient.hba1c && patient.hba1c >= 5.7) ||
      patient.is_smoker;

    if (isFlagged) return { label: 'Flagged Risk', variant: 'danger' as const };
    if (isOverdue) return { label: 'Review Needed', variant: 'warning' as const };
    return { label: 'Up to Date', variant: 'teal' as const };
  };

  const filteredAndSortedPatients = useMemo(() => {
    return patients
      .filter((p) => {
        if (genderFilter !== 'all' && p.sex !== genderFilter) return false;
        const status = getPatientScreeningStatus(p);
        if (statusFilter === 'needs_review' && status.variant === 'teal') return false;
        if (statusFilter === 'compliant' && status.variant !== 'teal') return false;
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'id') comparison = a.id - b.id;
        else if (sortField === 'name') comparison = a.last_name.localeCompare(b.last_name);
        else if (sortField === 'age') comparison = a.age - b.age;
        else if (sortField === 'status') {
          const statusA = getPatientScreeningStatus(a).label;
          const statusB = getPatientScreeningStatus(b).label;
          comparison = statusA.localeCompare(statusB);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [patients, genderFilter, statusFilter, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56]">Patient Cohort Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Surveillance registry of adult patients tracked for preventive screening compliance.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="teal" size="sm">
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register New Patient</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#173A56] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#378C83] focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Status:</span>
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === 'all' ? 'bg-white shadow-xs text-[#173A56] font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({patients.length})
                </button>
                <button
                  onClick={() => setStatusFilter('needs_review')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === 'needs_review' ? 'bg-white shadow-xs text-amber-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Review Needed
                </button>
                <button
                  onClick={() => setStatusFilter('compliant')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === 'compliant' ? 'bg-white shadow-xs text-[#2c726a] font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Compliant
                </button>
              </div>
            </div>

            {/* Sex Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Sex:</span>
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    genderFilter === 'all' ? 'bg-white shadow-xs text-[#173A56] font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setGenderFilter('female')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    genderFilter === 'female' ? 'bg-white shadow-xs text-[#173A56] font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Female
                </button>
                <button
                  onClick={() => setGenderFilter('male')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    genderFilter === 'male' ? 'bg-white shadow-xs text-[#173A56] font-semibold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56] mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading patients...</p>
          </div>
        ) : filteredAndSortedPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-semibold text-[#173A56]">No patients found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust your search or register a new patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F8FB] border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[10px]">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#173A56]"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Patient ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#173A56]"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#173A56]"
                    onClick={() => handleSort('age')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Age & Sex</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-[#173A56]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Screening Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Biomarkers & Vitals</th>
                  <th className="py-3 px-4">Last Assessment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedPatients.map((patient) => {
                  const status = getPatientScreeningStatus(patient);
                  const patientIdFormatted = `SW-${String(100 + patient.id).padStart(5, '0')}`;
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="hover:bg-[#F6F8FB] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        {patientIdFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          to={`/patients/${patient.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-[#173A56] hover:text-[#378C83] text-xs transition-colors"
                        >
                          {patient.full_name}
                        </Link>
                        {patient.email && (
                          <p className="text-slate-400 text-[10px]">{patient.email}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium">{patient.age}y</span> • <span className="capitalize text-slate-500">{patient.sex}</span>
                        <p className="text-[10px] text-slate-400">{patient.date_of_birth}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-600">
                        <div className="space-y-0.5">
                          {patient.bmi && (
                            <div>
                              <span className="text-slate-400">BMI:</span>{' '}
                              <span className={patient.bmi >= 25 ? 'font-semibold text-amber-700' : ''}>
                                {patient.bmi.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {patient.systolic_bp && (
                            <div>
                              <span className="text-slate-400">BP:</span>{' '}
                              <span className={patient.systolic_bp >= 130 ? 'font-semibold text-rose-700' : ''}>
                                {patient.systolic_bp}/{patient.diastolic_bp}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {new Date(patient.updated_at || patient.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/patients/${patient.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="xs">
                              <span>Profile</span>
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientCreated={() => fetchPatients()}
      />
    </div>
  );
};
