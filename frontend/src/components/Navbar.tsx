import React, { useEffect, useState } from 'react';
import { Activity, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { dashboardService } from '../services/dashboardService';

interface NavbarProps {
  onOpenNewPatientModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewPatientModal }) => {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    dashboardService.getHealth()
      .then((res) => {
        setBackendHealthy(res.status === 'healthy');
      })
      .catch(() => {
        setBackendHealthy(false);
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">ScreenWise AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Preventive Health
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Adult Preventive Care & Screening Surveillance Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Health Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
            {backendHealthy === null ? (
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
            ) : backendHealthy ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-700">API Connected</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-rose-700">API Offline</span>
              </>
            )}
          </div>

          <Button
            onClick={onOpenNewPatientModal}
            variant="primary"
            size="sm"
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
