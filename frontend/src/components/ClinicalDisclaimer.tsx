import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface ClinicalDisclaimerProps {
  variant?: 'banner' | 'compact' | 'footer';
}

export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({ variant = 'banner' }) => {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Screening Decision Support Tool — Not a Diagnostic System. Verify with primary care provider.</span>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600">ScreenWise AI — Clinical Decision Support Platform</p>
        <p className="mt-1 max-w-3xl mx-auto">
          Notice: ScreenWise AI provides automated preventive screening schedule tracking based on USPSTF, ADA, ACC/AHA, and ASCCP clinical guidelines. 
          This software is an assistive screening support tool and does not provide medical diagnoses or establish physician-patient relationships. 
          All clinical actions must be confirmed by a licensed medical professional.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 via-amber-50/60 to-blue-50/50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong className="font-semibold text-amber-800">Preventive Care Notice:</strong> ScreenWise AI is an evidence-based screening support tool, <span className="underline decoration-amber-400 font-bold">NOT a diagnostic system</span>. All flagged recommendations support clinical workflow and require licensed clinician verification.
          </p>
        </div>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-800 uppercase tracking-wider">
          Decision Support
        </span>
      </div>
    </div>
  );
};
