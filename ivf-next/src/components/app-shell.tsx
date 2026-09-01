'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import { PatientContextBar } from '@/components/patient-context-bar';
import { PatientSelectModal } from '@/components/patient-select-modal';
import { TopNav } from '@/components/top-nav';
import { NavIcon } from '@/components/nav-icons';
import { SmartLogo } from '@/components/smart-logo';
import { SIDE_NAV_SECTIONS } from '@/lib/nav-config';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { selectedPatient } = usePatient();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('selectPatient') === '1') {
      setShowPatientModal(true);
    }
  }, [searchParams]);

  function isActive(route: string): boolean {
    const base = route.split('?')[0];
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#f4f6fa] text-slate-800">
        {/* Left Dark Navy Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-[250px]' : 'w-0'
          } shrink-0 overflow-hidden transition-all duration-200 z-30`}
        >
          <div className="flex h-full w-[250px] flex-col bg-[#181d38] text-white">
            {/* Sidebar Brand Header */}
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <SmartLogo className="h-9 w-9" />
                <div>
                  <div className="font-black text-lg tracking-tight text-white leading-none">
                    FERTITRACE
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 mt-1">
                    IVF Lab System
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Header Title */}
            <div className="px-5 pt-4 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                MAIN MENU
              </span>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-2">
              {SIDE_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.route);
                    return (
                      <Link
                        key={item.label}
                        href={item.route}
                        onClick={() => {
                          if (item.label === 'Logout') {
                            logout();
                          }
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          active
                            ? 'bg-[#6b46c1] text-white shadow-md font-semibold'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <NavIcon name={item.icon} className="h-4 w-4 shrink-0 opacity-90" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-white/10 p-4 text-center">
              <div className="font-bold tracking-wider text-white text-sm">FERTITRACE</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Version 2.0.0</div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 md:px-5">
              {/* Left Side: Logo & Menu Toggle */}
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
                  aria-label="Toggle sidebar"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>

                {/* Logo Brand */}
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <SmartLogo className="h-9 w-9" />
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black tracking-tight text-[#1d4ed8]">
                        FERTITRACE
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 leading-none">
                      IVF Laboratory Management System
                    </div>
                  </div>
                </Link>

                {/* Top Navigation Bar (Restored Previous Top Menu) */}
                <div className="ml-2 hidden lg:block">
                  <TopNav />
                </div>
              </div>

              {/* Right Side Tools & User Profile */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(true)}
                  className="hidden rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-[#6b46c1] hover:bg-purple-100 sm:inline-flex"
                >
                  {selectedPatient ? 'Change Patient' : 'Select Patient'}
                </button>

                {/* Notification Bell */}
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                  aria-label="Notifications"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    5
                  </span>
                </button>

                {/* Help Button */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    ?
                  </div>
                  <span>Help</span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6b46c1] font-bold text-xs">
                      Dr
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        Dr. Admin
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
                    </div>
                    <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
                      <div className="border-b border-slate-100 px-4 py-2">
                        <p className="text-xs font-bold text-slate-800">
                          {user?.userName || user?.userLoginName || 'Dr. Admin'}
                        </p>
                        <p className="text-[10px] text-slate-500">Dr.Admin@fertitrace.com</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPatientModal(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {selectedPatient ? `Patient: ${selectedPatient.name}` : 'Select Patient'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Patient Context Bar if active */}
          {selectedPatient && (
            <div className="border-b border-slate-200/80 bg-white px-5 py-2">
              <PatientContextBar
                patient={selectedPatient}
                onSelectPatient={() => setShowPatientModal(true)}
              />
            </div>
          )}

          {/* Main Workspace */}
          <main className="flex-1 p-5 md:p-6 bg-[#f4f6fa]">{children}</main>
        </div>
      </div>

      <PatientSelectModal open={showPatientModal} onClose={() => setShowPatientModal(false)} />
    </>
  );
}
