import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarCheck,
  BookOpen,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patients', label: 'Patient Directory', icon: Users },
    { to: '/screenings', label: 'Screening Pathways', icon: ShieldCheck },
    { to: '/follow-ups', label: 'Follow-Up Tracker', icon: CalendarCheck },
    { to: '/guidelines', label: 'Clinical Guidelines', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Clinical Workflow
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Screening Pathways Quick Reference */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Surveillance</span>
          </div>
          <ul className="text-xs text-slate-500 space-y-1.5">
            <li className="flex items-center justify-between">
              <span>1. Diabetes</span>
              <span className="text-[10px] text-slate-400 font-mono">ADA / USPSTF</span>
            </li>
            <li className="flex items-center justify-between">
              <span>2. Cardiovascular</span>
              <span className="text-[10px] text-slate-400 font-mono">ACC / AHA</span>
            </li>
            <li className="flex items-center justify-between">
              <span>3. Breast Cancer</span>
              <span className="text-[10px] text-slate-400 font-mono">USPSTF 2024</span>
            </li>
            <li className="flex items-center justify-between">
              <span>4. Cervical Cancer</span>
              <span className="text-[10px] text-slate-400 font-mono">ASCCP / USPSTF</span>
            </li>
            <li className="flex items-center justify-between">
              <span>5. Colorectal Cancer</span>
              <span className="text-[10px] text-slate-400 font-mono">USPSTF 2021</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>ScreenWise Explainer AI Active</span>
        </div>
      </div>
    </aside>
  );
};
