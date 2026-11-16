import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Settings,
  HeartPulse,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  overdueCount?: number;
  recommendationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  overdueCount = 0,
  recommendationsCount = 0,
}) => {
  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/patients',
      label: 'Patients',
      icon: Users,
      badge: null,
    },
    {
      to: '/assessment',
      label: 'Screening Assessment',
      icon: ShieldCheck,
      badge: null,
    },
    {
      to: '/recommendations',
      label: 'Recommendations',
      icon: ClipboardList,
      badge: recommendationsCount > 0 ? recommendationsCount : null,
      badgeColor: 'bg-[#378C83]',
    },
    {
      to: '/follow-ups',
      label: 'Follow-ups',
      icon: CalendarCheck,
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'bg-rose-500',
    },
    {
      to: '/analytics',
      label: 'Population Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#173A56] text-white flex flex-col justify-between shrink-0 select-none min-h-[calc(100vh-4rem)] border-r border-[#0f2638]">
      <div className="py-6 px-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#378C83] flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">ScreenWise</span>
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-[#378C83]/30 text-[#48a89d] border border-[#378C83]/40">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Preventive Healthcare OS
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Clinical Modules
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#378C83] text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-[#244e73]/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 opacity-90" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-slate-700'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Active Guidelines Reference */}
        <div className="mt-8 mx-2 p-3 rounded-lg bg-[#0f2638]/70 border border-[#244e73]/50">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#48a89d] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Protocols</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between items-center text-slate-400">
              <span>Diabetes</span>
              <span className="font-mono text-[10px] text-slate-300">ADA/USPSTF</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Cardiovascular</span>
              <span className="font-mono text-[10px] text-slate-300">ACC/AHA</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Cancer Pathways</span>
              <span className="font-mono text-[10px] text-slate-300">USPSTF 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#244e73]/40">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#378C83] animate-pulse" />
          <div className="text-[11px] text-slate-300">
            <p className="font-medium">Clinical Engine v1.0</p>
            <p className="text-[10px] text-slate-400">Decision Support Aid</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
