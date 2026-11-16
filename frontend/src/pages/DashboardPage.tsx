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
  HeartPulse,
  Dna,
  Ribbon,
  FileText,
  CalendarPlus,
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
import { analyticsService } from '../services/analyticsService';
import { DashboardStats, FollowUpTask, Patient, PopulationAnalyticsData } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [analytics, setAnalytics] = useState<PopulationAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [statsData, tasksData, patientsData, analyticsData] = await Promise.all([
        dashboardService.getStats(),
        followUpService.getAll(undefined, undefined),
        patientService.getAll(),
        analyticsService.getPopulationData(),
      ]);
      setStats(statsData);
      setTasks(tasksData.slice(0, 5));
      setPatients(patientsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTaskStatusToggle = async (task: FollowUpTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await followUpService.update(task.id, {
        status: newStatus,
        completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      });
      loadDashboardData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const chartColors = {
    upToDate: '#378C83',
    dueSoon: '#244e73',
    overdue: '#f59e0b',
    flaggedRisk: '#e11d48',
  };

  const riskPieData = stats
    ? [
        { name: 'Standard / Low', value: stats.risk_distribution.low, color: '#378C83' },
        { name: 'Moderate Risk', value: stats.risk_distribution.moderate, color: '#f59e0b' },
        { name: 'High Clinical Risk', value: stats.risk_distribution.high, color: '#e11d48' },
        { name: 'Not Indicated', value: stats.risk_distribution.not_applicable, color: '#94a3b8' },
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

  // Pathway specific data extraction
  const diabetesStats = stats?.category_breakdown.find((c) => c.category === 'diabetes');
  const cardioStats = stats?.category_breakdown.find((c) => c.category === 'cardiovascular');
  const breastStats = stats?.category_breakdown.find((c) => c.category === 'cancer_breast');
  const cervicalStats = stats?.category_breakdown.find((c) => c.category === 'cancer_cervical');
  const colorectalStats = stats?.category_breakdown.find((c) => c.category === 'cancer_colorectal');

  const totalReviewNeeded = stats ? (stats.total_overdue + stats.total_flagged_risk) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#173A56]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interactive Hackathon Evaluator Quick-Start Guide */}
      {showGuide && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#173A56] to-[#1e4d73] text-white shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#378C83] text-white font-bold text-[10px] tracking-wide uppercase">
                Evaluator Guide
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Recommended 3-Minute Hackathon Demonstration Workflow
              </h2>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs text-slate-300 hover:text-white self-start sm:self-auto cursor-pointer"
            >
              ✕ Dismiss
            </button>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed max-w-3xl relative z-10">
            Welcome to <strong>ScreenWise AI</strong>, aligned with <strong>Abu Dhabi ADPHC & DoH (IFHAS & Weqaya) Standards</strong>.
            Follow these 3 clinical steps to evaluate the live platform:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 text-xs">
            {/* Step 1 */}
            <Link
              to="/patients"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-teal-300 mb-1">
                  <span>1. Clinical Patients</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-200">
                  Select <strong>Amina Al Mansoori</strong> (48y) or <strong>Tariq</strong> (42y). Notice ADPHC colorectal screening starts at age 40 (earlier than US 45).
                </p>
              </div>
              <span className="text-[10px] text-teal-300 font-semibold mt-2">Open Directory →</span>
            </Link>

            {/* Step 2 */}
            <Link
              to="/assessment"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-teal-300 mb-1">
                  <span>2. Guidelines Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-200">
                  Test the 1-click presets: early colorectal gap, hereditary breast risk, and risk score deferral for missing lipids.
                </p>
              </div>
              <span className="text-[10px] text-teal-300 font-semibold mt-2">Test Simulator →</span>
            </Link>

            {/* Step 3 */}
            <Link
              to="/analytics"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-teal-300 mb-1">
                  <span>3. Privacy Analytics</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-[11px] text-slate-200">
                  Inspect Recharts graphs and small-cell privacy suppression (cohorts $n &lt; 5$ masked with <code>&lt; 5</code>).
                </p>
              </div>
              <span className="text-[10px] text-teal-300 font-semibold mt-2">View Analytics →</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4 Core Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-[#173A56] mt-1 tracking-tight">
                {stats?.total_patients || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Active cohort under surveillance
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#F6F8FB] text-[#173A56] border border-slate-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Patients Requiring Screening Review */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Review Required
              </p>
              <p className="text-3xl font-bold text-rose-600 mt-1 tracking-tight">
                {totalReviewNeeded}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {stats?.total_overdue || 0} overdue • {stats?.total_flagged_risk || 0} flagged risk
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Screening Actions Completed */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Actions Completed
              </p>
              <p className="text-3xl font-bold text-[#378C83] mt-1 tracking-tight">
                {stats?.completed_follow_ups || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Screening orders & labs fulfilled
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#edf7f5] text-[#2c726a] border border-[#bfe3de]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Pending Follow-ups */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Pending Follow-ups
              </p>
              <p className="text-3xl font-bold text-[#173A56] mt-1 tracking-tight">
                {stats?.pending_follow_ups || 0}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Diagnostic orders & appointments
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#e8edf2] text-[#173A56] border border-[#cbd5e1]">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Domain Pathway Overviews (Diabetes, Cardiovascular, Cancer) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#173A56] tracking-tight">
              Clinical Screening Pathways Overview
            </h2>
            <p className="text-xs text-slate-500">
              Guideline coverage across the 3 core preventive health domains
            </p>
          </div>
          <Link to="/assessment">
            <Button variant="outline" size="xs">
              <span>Assess Pathway</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Diabetes Pathway Overview */}
          <Card className="p-5 border-l-4 border-l-[#378C83]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#edf7f5] text-[#378C83]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A56]">1. Diabetes & Prediabetes</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ADA 2024 / USPSTF</span>
                </div>
              </div>
              <Badge variant={diabetesStats && (diabetesStats.overdue + diabetesStats.flagged_risk) > 0 ? 'warning' : 'teal'}>
                {diabetesStats ? `${diabetesStats.up_to_date} Compliant` : 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              FPG / HbA1c screening for adults aged 35–70 with BMI ≥ 25 or metabolic risk factors.
            </p>
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Up to Date</span>
                <span className="font-bold text-[#378C83]">{diabetesStats?.up_to_date || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Overdue</span>
                <span className="font-bold text-amber-600">{diabetesStats?.overdue || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Flagged</span>
                <span className="font-bold text-rose-600">{diabetesStats?.flagged_risk || 0}</span>
              </div>
            </div>
          </Card>

          {/* 2. Cardiovascular Pathway Overview */}
          <Card className="p-5 border-l-4 border-l-[#173A56]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#e8edf2] text-[#173A56]">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A56]">2. Cardiovascular Health</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ACC / AHA / USPSTF</span>
                </div>
              </div>
              <Badge variant={cardioStats && cardioStats.flagged_risk > 0 ? 'danger' : 'navy'}>
                {cardioStats?.flagged_risk || 0} High Risk
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Annual BP check for adults ≥40 & 5-year lipid panels for 10-year ASCVD risk stratification.
            </p>
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Up to Date</span>
                <span className="font-bold text-[#378C83]">{cardioStats?.up_to_date || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Overdue</span>
                <span className="font-bold text-amber-600">{cardioStats?.overdue || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Flagged BP/Lipid</span>
                <span className="font-bold text-rose-600">{cardioStats?.flagged_risk || 0}</span>
              </div>
            </div>
          </Card>

          {/* 3. Cancer Screening Pathways Overview */}
          <Card className="p-5 border-l-4 border-l-[#2c726a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#edf7f5] text-[#2c726a]">
                  <Dna className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#173A56]">3. Cancer Pathways</h3>
                  <span className="text-[10px] text-slate-400 font-mono">USPSTF / ASCCP</span>
                </div>
              </div>
              <Badge variant="teal">3 Sub-pathways</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Breast (Mammogram 40-74), Cervical (Cytology/hrHPV 21-65), Colorectal (Colonoscopy/FIT 45-75).
            </p>
            <div className="space-y-1 py-1 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex justify-between items-center">
                <span>Breast (Mammo):</span>
                <span className="font-medium text-slate-800">
                  {breastStats?.up_to_date || 0} OK • {breastStats?.overdue || 0} Overdue
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cervical (Pap/HPV):</span>
                <span className="font-medium text-slate-800">
                  {cervicalStats?.up_to_date || 0} OK • {cervicalStats?.overdue || 0} Overdue
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Colorectal (FIT/Colon):</span>
                <span className="font-medium text-slate-800">
                  {colorectalStats?.up_to_date || 0} OK • {colorectalStats?.overdue || 0} Overdue
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pathway Compliance Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Screening Compliance & Care Gaps</CardTitle>
              <CardDescription>
                Live surveillance status breakdown across all 5 clinical guidelines
              </CardDescription>
            </div>
            <Link to="/recommendations">
              <Button variant="ghost" size="xs">
                <span>Review Gaps</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Up to Date" fill={chartColors.upToDate} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Due Soon" fill={chartColors.dueSoon} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Overdue" fill={chartColors.overdue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Flagged Risk" fill={chartColors.flaggedRisk} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Stratification Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Assessed Risk Tiers</CardTitle>
            <CardDescription>
              Population stratification by guideline risk triggers
            </CardDescription>
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
                  paddingAngle={3}
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
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                <span className="text-slate-600">High ({stats?.risk_distribution.high || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-slate-600">Moderate ({stats?.risk_distribution.moderate || 0})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#378C83]" />
                <span className="text-slate-600">Standard ({stats?.risk_distribution.low || 0})</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Grid: Recent Activity & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity Stream</CardTitle>
              <CardDescription>
                Clinical assessments, orders created, and test completions
              </CardDescription>
            </div>
            <Link to="/analytics">
              <Button variant="ghost" size="xs">View Audit</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
                analytics.recent_activity.map((act) => (
                  <div key={act.id} className="p-4 hover:bg-[#F6F8FB] transition-colors flex items-start gap-3">
                    <div className={`mt-0.5 p-1 rounded-md ${act.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#173A56]">{act.action}</p>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No recent activity recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Follow-Up Care Actions</CardTitle>
              <CardDescription>
                Pending diagnostic tests, imaging, and consultations
              </CardDescription>
            </div>
            <Link to="/follow-ups">
              <Button variant="ghost" size="xs">
                <span>View All ({tasks.length})</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No pending follow-ups currently scheduled.
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-[#F6F8FB] transition-colors flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleTaskStatusToggle(task)}
                        className={`mt-0.5 p-1 rounded-md border transition-colors cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-[#378C83] border-[#378C83] text-white'
                            : 'border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                        title={task.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#173A56]'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-medium text-[#173A56]">{task.patient_name}</span>
                          <span>•</span>
                          <span>Due: {task.due_date}</span>
                          {task.assigned_provider && (
                            <>
                              <span>•</span>
                              <span className="truncate">{task.assigned_provider}</span>
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
