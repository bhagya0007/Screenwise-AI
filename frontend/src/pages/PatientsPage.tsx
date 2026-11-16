import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  UserPlus,
  ArrowRight,
  Filter,
  ShieldCheck,
  Heart,
  Activity,
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { NewPatientModal } from '../components/NewPatientModal';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
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
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const filteredPatients = patients.filter((p) => {
    if (genderFilter === 'all') return true;
    return p.sex === genderFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Adult preventive care surveillance cohort and screening compliance registry.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} variant="primary" size="md">
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by patient name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Sex:
            </span>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  genderFilter === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  genderFilter === 'female' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Female
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  genderFilter === 'male' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Male
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Patients Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading patient cohort...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold">No patients found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new patient.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Sex</th>
                  <th className="py-3 px-4">Vitals & Markers</th>
                  <th className="py-3 px-4">Key Risk Factors</th>
                  <th className="py-3 px-4">Last Screened</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                      >
                        {patient.full_name}
                      </Link>
                      {patient.email && (
                        <p className="text-slate-400 text-[11px] mt-0.5">{patient.email}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="capitalize">{patient.sex}</span>, {patient.age}y
                      <p className="text-slate-400 text-[11px]">DOB: {patient.date_of_birth}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {patient.bmi && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">BMI:</span>
                            <span className={`font-semibold ${patient.bmi >= 25 ? 'text-amber-600' : 'text-slate-800'}`}>
                              {patient.bmi.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {patient.systolic_bp && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">BP:</span>
                            <span className={`font-semibold ${patient.systolic_bp >= 130 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {patient.systolic_bp}/{patient.diastolic_bp}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {patient.is_smoker && (
                          <Badge variant="danger" size="sm">Smoker</Badge>
                        )}
                        {patient.family_history_diabetes && (
                          <Badge variant="warning" size="sm">Fam. Diabetes</Badge>
                        )}
                        {patient.family_history_breast_cancer && (
                          <Badge variant="danger" size="sm">Fam. Breast CA</Badge>
                        )}
                        {patient.family_history_colorectal_cancer && (
                          <Badge variant="danger" size="sm">Fam. Colorectal</Badge>
                        )}
                        {patient.family_history_cad && (
                          <Badge variant="warning" size="sm">Fam. CAD</Badge>
                        )}
                        {!patient.is_smoker &&
                          !patient.family_history_diabetes &&
                          !patient.family_history_breast_cancer &&
                          !patient.family_history_colorectal_cancer &&
                          !patient.family_history_cad && (
                            <span className="text-slate-400">Standard risk</span>
                          )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="text-[11px] space-y-0.5">
                        {patient.last_diabetes_screen_date && (
                          <div>A1c: {patient.last_diabetes_screen_date}</div>
                        )}
                        {patient.last_mammogram_date && (
                          <div>Mammo: {patient.last_mammogram_date}</div>
                        )}
                        {patient.last_colorectal_screen_date && (
                          <div>Colo: {patient.last_colorectal_screen_date}</div>
                        )}
                        {!patient.last_diabetes_screen_date &&
                          !patient.last_mammogram_date &&
                          !patient.last_colorectal_screen_date && (
                            <span className="text-amber-600 font-medium">None logged</span>
                          )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm" className="font-semibold text-xs">
                          <span>Assess</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientCreated={() => {
          fetchPatients();
        }}
      />
    </div>
  );
};
