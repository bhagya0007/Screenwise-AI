import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  CalendarCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { followUpService } from '../services/followUpService';
import { patientService } from '../services/patientService';
import { DashboardStats, FollowUpTask, Patient } from '../types';
import { MetricStatCard } from '../components/MetricStatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData, patientsData] = await Promise.all([
          dashboardService.getStats(),
          followUpService.getAll(undefined, undefined),
          patientService.getAll(),
        ]);
        setStats(statsData);
        setTasks(tasksData.slice(0, 5));
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const RISK_COLORS = {
    high: '#f43f5e',
    moderate: '#f59e0b',
    low: '#10b981',
    not_applicable: '#94a3b8',
  };

  const riskPieData = stats
    ? [
        { name: 'High Risk', value: stats.risk_distribution.high, color: RISK_COLORS.high },
        { name: 'Moderate Risk', value: stats.risk_distribution.moderate, color: RISK_COLORS.moderate },
        { name: 'Standard / Low', value: stats.risk_distribution.low, color: RISK_COLORS.low },
        { name: 'Not Indicated', value: stats.risk_distribution.not_applicable, color: RISK_COLORS.not_applicable },
      ].filter((item) => item.value > 0)
    : [];

  const chartData = stats
    ? stats.category_breakdown.map((c) => ({
        name: c.label.replace('Type 2 ', '').replace(' Health', '').replace(' Cancer', ''),
        'Up to Date': c.up_to_date,
        'Due Soon': c.due_soon,
        'Overdue': c.overdue,
        'Flagged Risk': c.flagged_risk,
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
              Surveillance Dashboard
            </span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-300">
              <Sparkles className="w-3 h-3" /> AI Guideline Engine Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Preventive Healthcare Intelligence
          </h1>
          <p className="text-blue-100/80 text-sm mt-1 max-w-2xl">
            Real-time screening tracking across Diabetes, Cardiovascular health, and Cancer pathways (Breast, Cervical, Colorectal).
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/screenings">
            <Button variant="secondary" size="md" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              Assess Pathway
            </Button>
          </Link>
          <Link to="/patients">
            <Button variant="primary" size="md">
              View All Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          title="Active Patients"
          value={stats?.total_patients || 0}
          subtitle="Monitored in surveillance cohort"
          icon={Users}
          variant="blue"
        />
        <MetricStatCard
          title="Overdue Screenings"
          value={stats?.total_overdue || 0}
          subtitle="Missed clinical intervals"
          icon={AlertTriangle}
          variant="amber"
        />
        <MetricStatCard
          title="Flagged Clinical Risks"
          value={stats?.total_flagged_risk || 0}
          subtitle="Elevated biomarkers / histories"
          icon={ShieldAlert}
          variant="rose"
        />
        <MetricStatCard
          title="Pending Follow-Ups"
          value={stats?.pending_follow_ups || 0}
          subtitle={`${stats?.completed_follow_ups || 0} completed`}
          icon={CalendarCheck}
          variant="emerald"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pathway Breakdown Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Screening Pathway Status</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Compliance distribution across all 5 clinical guidelines
              </p>
            </div>
            <Link to="/screenings" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>Deep Dive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Up to Date" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Due Soon" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Overdue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Flagged Risk" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Assessed Risk Tiers</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Stratification by guideline risk indicators
            </p>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">High ({stats?.risk_distribution.high || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Moderate ({stats?.risk_distribution.moderate || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Low ({stats?.risk_distribution.low || 0})</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Patients Needing Attention & Follow-up Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Patients List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Patients Requiring Action</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Identified with overdue or flagged clinical screening needs
              </p>
            </div>
            <Link to="/patients" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {patients.slice(0, 4).map((patient) => (
                <div key={patient.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                      >
                        {patient.full_name}
                      </Link>
                      <span className="text-xs text-slate-500">
                        ({patient.age}y, {patient.sex})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      {patient.bmi && <span>BMI: {patient.bmi.toFixed(1)}</span>}
                      {patient.systolic_bp && (
                        <span>BP: {patient.systolic_bp}/{patient.diastolic_bp}</span>
                      )}
                      {patient.is_smoker && (
                        <Badge variant="danger" size="sm">Smoker</Badge>
                      )}
                    </div>
                  </div>

                  <Link to={`/patients/${patient.id}`}>
                    <Button variant="outline" size="sm">
                      Evaluate
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Follow-Up Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Follow-Up Actions</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Preventive orders, consultations, and diagnostic tests
              </p>
            </div>
            <Link to="/follow-ups" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>All Tasks ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active follow-up tasks currently pending.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="text-slate-700 font-medium">{task.patient_name}</span>
                        <span>•</span>
                        <span>Due: {task.due_date}</span>
                        {task.assigned_provider && (
                          <>
                            <span>•</span>
                            <span>{task.assigned_provider}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {task.status === 'completed' ? (
                        <Badge variant="success">Completed</Badge>
                      ) : task.status === 'scheduled' ? (
                        <Badge variant="info">Scheduled</Badge>
                      ) : task.priority === 'urgent' ? (
                        <Badge variant="danger">Urgent</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
