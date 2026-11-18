import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ExternalLink,
  Building2,
  X,
} from 'lucide-react';
import { Button } from './ui/Button';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';
import { Patient } from '../types';

interface NavbarProps {
  onOpenNewPatientModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewPatientModal }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notifications dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Profile dropdown
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Page titles mapping
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/' || path === '/overview') {
      return { title: 'Overview Dashboard', subtitle: 'Population screening metrics & urgent care needs' };
    }
    if (path.startsWith('/patients/')) {
      return { title: 'Patient Profile', subtitle: 'Clinical history, vitals, biomarkers & screening assessment' };
    }
    if (path === '/patients') {
      return { title: 'Patient Directory', subtitle: 'Surveillance cohort and screening status registry' };
    }
    if (path === '/assessment') {
      return { title: 'Screening Assessment', subtitle: 'Interactive guideline assessment engine & simulator' };
    }
    if (path === '/recommendations') {
      return { title: 'Clinical Recommendations', subtitle: 'Preventive care action pathways requiring provider review' };
    }
    if (path === '/follow-ups') {
      return { title: 'Follow-Up Care Tracker', subtitle: 'Active diagnostic orders, test completion & scheduling' };
    }
    if (path === '/analytics') {
      return { title: 'Population Analytics', subtitle: 'Screening coverage rates, care gaps & demographic adherence' };
    }
    if (path === '/settings') {
      return { title: 'System & Guideline Settings', subtitle: 'Clinical parameters, practice configuration & system health' };
    }
    return { title: 'ScreenWise AI', subtitle: 'Adult Preventive Healthcare Support Platform' };
  };

  const { title, subtitle } = getPageMeta();

  // Handle global search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      patientService.getAll(searchQuery)
        .then((data) => {
          setSearchResults(data);
          setShowSearchResults(true);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsSearching(false));
    }, 200);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle outside clicks to close menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const dummyNotifications = [
    {
      id: 1,
      title: 'Robert Chen (52y): Colorectal Screening Overdue',
      desc: 'No screening colonoscopy or FIT on record. Paternal history of CRC.',
      type: 'danger',
      time: '10m ago',
      patientId: 1,
    },
    {
      id: 2,
      title: 'Elena Rodriguez (42y): Mammogram Recommended',
      desc: 'USPSTF 2024 age window reached; first-degree family history noted.',
      type: 'warning',
      time: '1h ago',
      patientId: 2,
    },
    {
      id: 3,
      title: 'Marcus Washington (64y): Fasting Glucose Flagged',
      desc: 'Impaired glucose (119 mg/dL) meets prediabetes surveillance criteria.',
      type: 'warning',
      time: '3h ago',
      patientId: 3,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-16 px-6 flex items-center justify-between">
      {/* Page Title & Subtitle */}
      <div className="min-w-0 pr-4">
        <h1 className="text-base font-bold text-[#173A56] tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[11px] text-slate-500 truncate hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Center Search & Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative w-52 sm:w-72 md:w-80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, ID, DOB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchResults(true);
              }}
              className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#173A56] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#378C83] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Matching Patients ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching patients found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                        navigate(`/patients/${patient.id}`);
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-[#F6F8FB] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#173A56]">{patient.full_name}</p>
                        <p className="text-[10px] text-slate-500">
                          {patient.age}y • {patient.sex} • DOB: {patient.date_of_birth}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-400">
                        SW-{100 + patient.id}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Action: Add Patient */}
        <Button
          onClick={onOpenNewPatientModal}
          variant="teal"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Patient</span>
        </Button>

        {/* Notifications Popover */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-[#173A56] hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Clinical Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[#173A56] text-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold tracking-tight">Clinical Alerts & Overdue Needs</h4>
                  <p className="text-[10px] text-slate-300">Preventive screening surveillance feed</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  3 Overdue
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {dummyNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/patients/${notif.patientId}`);
                    }}
                    className="p-3.5 hover:bg-[#F6F8FB] transition-colors cursor-pointer flex gap-3 items-start"
                  >
                    <div className="mt-0.5 p-1 rounded-md bg-rose-50 text-rose-600 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#173A56]">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                        {notif.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/recommendations"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#378C83] hover:text-[#2c726a]"
                >
                  View All Recommendations →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown & Safe Demo Switcher */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-[#173A56] text-white flex items-center justify-center font-bold text-[10px]">
              FA
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-[#173A56] leading-none">Dr. Fatima Al Suwaidi</p>
              <p className="text-[10px] text-[#378C83] font-medium leading-none mt-0.5">Lead Clinician (SEHA)</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#173A56]">Dr. Fatima Al Suwaidi, MD</p>
                  <span className="text-[9px] bg-teal-50 text-[#378C83] border border-teal-200 px-1.5 py-0.5 rounded font-semibold">Clinician</span>
                </div>
                <p className="text-[11px] text-slate-500">Consultant Family Medicine</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#378C83] font-medium">
                  <Building2 className="w-3 h-3" />
                  <span>Abu Dhabi Health Services (SEHA)</span>
                </div>
              </div>

              {/* Safe Demo Role Switcher */}
              <div className="py-2 px-2 bg-slate-50 rounded-lg my-1.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Hackathon Role Switcher
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={async () => {
                      localStorage.setItem('screenwise_role', 'clinician');
                      await authService.switchDemoRole('clinician');
                      setShowProfileMenu(false);
                      window.location.reload();
                    }}
                    className="p-1.5 text-left rounded border border-[#173A56] bg-white text-[#173A56] font-semibold text-[10px] hover:bg-slate-100 cursor-pointer"
                  >
                    Dr. Fatima (MD)
                  </button>
                  <button
                    onClick={async () => {
                      localStorage.setItem('screenwise_role', 'nurse');
                      await authService.switchDemoRole('nurse');
                      setShowProfileMenu(false);
                      window.location.reload();
                    }}
                    className="p-1.5 text-left rounded border border-[#378C83] bg-white text-[#378C83] font-semibold text-[10px] hover:bg-slate-100 cursor-pointer"
                  >
                    Nurse Maryam (RN)
                  </button>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/landing"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Platform Overview & Presentation
                </Link>
                <Link
                  to="/guidelines"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  ADPHC Guidelines Library
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Clinical System Preferences
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1 mt-1 px-3 py-1.5 text-[10px] text-slate-400">
                Abu Dhabi ADPHC & DoH 2024 Engine • HIPAA/DoH Safe Demo
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
