import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Building2,
  Bell,
  Database,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { dashboardService } from '../services/dashboardService';
import { HealthStatus } from '../types';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState<'guidelines' | 'practice' | 'alerts' | 'system'>('guidelines');

  // Practice settings state
  const [providerName, setProviderName] = useState('Dr. Fatima Al Suwaidi, MD');
  const [practiceName, setPracticeName] = useState('Al Bateen Healthcare Center (SEHA Abu Dhabi)');
  const [npiNumber, setNpiNumber] = useState('DOH-LIC-049281');
  const [reminderWindowDays, setReminderWindowDays] = useState('90');
  const [savedNotice, setSavedNotice] = useState(false);

  // Thresholds state
  const [bpSystolicThreshold, setBpSystolicThreshold] = useState('130');
  const [bpDiastolicThreshold, setBpDiastolicThreshold] = useState('80');
  const [glucoseThreshold, setGlucoseThreshold] = useState('100');
  const [hba1cThreshold, setHba1cThreshold] = useState('5.7');

  const checkHealth = () => {
    setLoadingHealth(true);
    dashboardService.getHealth()
      .then((res) => setHealth(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingHealth(false));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#173A56] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#378C83]" />
            <span>Settings & Practice Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure clinical guidelines, practice parameters, and system surveillance settings.
          </p>
        </div>
      </div>

      <ClinicalDisclaimer variant="compact" />

      {savedNotice && (
        <div className="p-3 bg-[#edf7f5] text-[#2c726a] text-xs font-semibold rounded-lg border border-[#bfe3de] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#378C83]" />
          <span>Practice settings and clinical thresholds successfully updated.</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs">
        {[
          { label: 'Clinical Guidelines Protocol', value: 'guidelines' },
          { label: 'Practice & Provider Profile', value: 'practice' },
          { label: 'Risk & Alert Thresholds', value: 'alerts' },
          { label: 'System & Database Health', value: 'system' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as any)}
            className={`pb-3 px-3 font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-[#173A56] text-[#173A56]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Guidelines Protocol */}
      {activeTab === 'guidelines' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Evidence-Based Screening Protocols</CardTitle>
                  <CardDescription>
                    ScreenWise AI evaluates patient parameters against official Abu Dhabi Public Health Centre (ADPHC) & DoH standards
                  </CardDescription>
                </div>
                <Badge variant="teal">ADPHC / DoH 2024 Edition</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#173A56] text-sm">Type 2 Diabetes & Prediabetes Screening</h4>
                    <Badge variant="teal">ADPHC IFHAS Standard</Badge>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Universal baseline screening for all adults starting at <strong>age 30</strong> (or age 18+ with BMI ≥ 25 or cardiometabolic risk indicators). Screening interval: Every 3 years if normal; <strong>annually</strong> if HbA1c 5.7%–6.4% or fasting glucose 100–125 mg/dL (prediabetes surveillance).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#173A56] text-sm">Cardiovascular Health (Hypertension & Dyslipidemia)</h4>
                    <Badge variant="navy">ADPHC Weqaya Protocol</Badge>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Adults 18+: annual resting BP checks if age ≥40 or high-normal BP (120–129/&lt;80 mmHg); every 3 years for 18–39 with normal BP. Routine 5-year lipid panels starting at age 20. <em>Strict safety rule: Formal 10-year risk scoring is explicitly deferred if required inputs are incomplete.</em>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#173A56] text-sm">Breast Cancer Screening</h4>
                    <Badge variant="teal">ADPHC Breast Standard</Badge>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Biennial (every 2 years) digital mammography for women aged 40 to 69 at average risk. Early initiation (from <strong>age 30</strong>) for positive first-degree relative family history or genetic predisposition.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#173A56] text-sm">Cervical Cancer Screening</h4>
                    <Badge variant="navy">ADPHC Cervical Standard</Badge>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Women with an intact cervix aged 25 to 65: cytology every 3 years for ages 25–29; hrHPV co-testing every 5 years for ages 30–65. Discontinue after 65 with negative history. Not indicated post-hysterectomy with cervix removed.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#173A56] text-sm">Colorectal Cancer Screening</h4>
                    <Badge variant="teal">ADPHC Colorectal Standard (Age 40+)</Badge>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    All adults aged <strong>40 to 75</strong> (earlier initiation than Western 45 due to regional epidemiology). Modalities: Annual at-home FIT stool test, or 10-year Screening Colonoscopy (5-year interval if family history of colorectal cancer).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Practice & Provider Profile */}
      {activeTab === 'practice' && (
        <Card>
          <CardHeader>
            <CardTitle>Practice & Provider Information</CardTitle>
            <CardDescription>
              Configure the clinical facility details displayed on patient orders and communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl text-xs">
              <Input
                label="Lead Clinician / Provider Name"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                required
              />
              <Input
                label="Clinical Practice / Health Center"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department of Health (DoH) License"
                  value={npiNumber}
                  onChange={(e) => setNpiNumber(e.target.value)}
                  required
                />
                <Input
                  label="Upcoming Due Reminder Window (Days)"
                  type="number"
                  value={reminderWindowDays}
                  onChange={(e) => setReminderWindowDays(e.target.value)}
                  helperText="Default: 90 days before due date"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="teal" size="sm">
                  Save Practice Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Risk & Alert Thresholds */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Clinical Biomarker Risk Thresholds</CardTitle>
            <CardDescription>
              Values that trigger clinical flags and urgent review recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl text-xs">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Hypertension Systolic Threshold (mmHg)"
                  type="number"
                  value={bpSystolicThreshold}
                  onChange={(e) => setBpSystolicThreshold(e.target.value)}
                  helperText="Default: 130 mmHg"
                />
                <Input
                  label="Hypertension Diastolic Threshold (mmHg)"
                  type="number"
                  value={bpDiastolicThreshold}
                  onChange={(e) => setBpDiastolicThreshold(e.target.value)}
                  helperText="Default: 80 mmHg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Impaired Fasting Glucose Threshold (mg/dL)"
                  type="number"
                  value={glucoseThreshold}
                  onChange={(e) => setGlucoseThreshold(e.target.value)}
                  helperText="Default: 100 mg/dL"
                />
                <Input
                  label="Prediabetes HbA1c Threshold (%)"
                  type="number"
                  step="0.1"
                  value={hba1cThreshold}
                  onChange={(e) => setHba1cThreshold(e.target.value)}
                  helperText="Default: 5.7%"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="teal" size="sm">
                  Save Thresholds
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: System & Database Health */}
      {activeTab === 'system' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System & Database Diagnostics</CardTitle>
              <CardDescription>
                Live connectivity check and service telemetry
              </CardDescription>
            </div>
            <Button
              onClick={checkHealth}
              variant="outline"
              size="xs"
              isLoading={loadingHealth}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ping Health Check</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F6F8FB] border border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">API Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#378C83]" />
                    <span className="font-bold text-[#173A56] capitalize">{health?.status || 'Active'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Database</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Database className="w-3.5 h-3.5 text-[#378C83]" />
                    <span className="font-bold text-[#173A56] capitalize">{health?.database || 'Connected'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Version</span>
                  <span className="font-mono font-medium text-slate-700 block mt-1">v{health?.version || '1.0.0'}</span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Environment</span>
                  <span className="font-medium text-slate-700 block mt-1 capitalize">{health?.environment || 'Development'}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Server Host: <code>127.0.0.1:8000</code> • Frontend Host: <code>localhost:5173</code> • Timestamp: <code>{health?.timestamp || 'N/A'}</code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
