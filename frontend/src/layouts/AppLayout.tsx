import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ClinicalDisclaimer } from '../components/ClinicalDisclaimer';
import { NewPatientModal } from '../components/NewPatientModal';

export const AppLayout: React.FC = () => {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Clinical Disclaimer Banner */}
      <ClinicalDisclaimer variant="banner" />

      {/* Main Navbar */}
      <Navbar onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)} />

      {/* Body with Sidebar and Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 min-w-0">
          <Outlet />
          <ClinicalDisclaimer variant="footer" />
        </main>
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
