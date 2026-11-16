import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface ClinicalDisclaimerProps {
  variant?: 'banner' | 'compact' | 'footer';
}

export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({ variant = 'banner' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-[#378C83]" />
        <span>
          <strong>Clinical Decision Support Tool:</strong> ScreenWise AI assists in screening gap identification. It does not establish clinical diagnoses.
        </span>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="border-t border-slate-200/80 mt-12 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-[#173A56]">ScreenWise AI — Adult Preventive Care Decision Support Platform</p>
        <p className="mt-1 max-w-3xl mx-auto text-slate-500 leading-relaxed text-[11px]">
          Clinical Notice: Preventive screening recommendations are evaluated against evidence-based parameters from USPSTF, ADA, ACC/AHA, and ASCCP guidelines. 
          This software is an assistive surveillance tool and does not formulate medical diagnoses or replace physician judgment. All care plans must be tailored by licensed healthcare professionals.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#173A56] text-white px-4 py-2 text-xs border-b border-[#0f2638]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#378C83] shrink-0" />
          <p className="text-slate-200">
            <strong className="text-white font-semibold">Clinical Support Aid:</strong> ScreenWise AI identifies overdue preventive screenings. <span className="text-[#48a89d] font-medium">NOT a diagnostic system</span>. All recommendations require licensed clinician confirmation.
          </p>
        </div>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#378C83]/30 text-[#48a89d] border border-[#378C83]/40 uppercase tracking-wider">
          Decision Support
        </span>
      </div>
    </div>
  );
};
