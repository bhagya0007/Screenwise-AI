import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { NewPatientModal } from '../components/NewPatientModal';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';

export const AppLayout: React.FC = () => {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardService.getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats for layout:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col font-sans text-[#173A56] antialiased">
      {/* Top Clinical Disclaimer Banner */}
      <ClinicalDisclaimer variant="banner" />

      {/* Main Container with Persistent Sidebar */}
      <div className="flex-1 flex min-h-[calc(100vh-2rem)]">
        <Sidebar
          overdueCount={stats?.total_overdue || 0}
          recommendationsCount={stats ? (stats.total_overdue + stats.total_flagged_risk) : 0}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-[#F6F8FB]">
          <Navbar onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)} />

          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
            <ClinicalDisclaimer variant="footer" />
          </main>
        </div>
      </div>

      {/* Global New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
