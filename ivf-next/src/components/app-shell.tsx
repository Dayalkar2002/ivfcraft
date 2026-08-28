'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import { PatientContextBar } from '@/components/patient-context-bar';
import { PatientSelectModal } from '@/components/patient-select-modal';
import { TopNav } from '@/components/top-nav';
import { SIDE_NAV_SECTIONS } from '@/lib/nav-config';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { selectedPatient } = usePatient();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="flex min-h-screen bg-slate-100">
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-0'} shrink-0 overflow-hidden border-r border-slate-200 bg-white transition-all duration-200`}
        >
          <div className="flex h-full w-64 flex-col">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="text-lg font-extrabold tracking-wide text-brand-green">smART</div>
              <div className="text-[11px] font-medium text-green-400">IVF & Fertility Management</div>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {SIDE_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="mb-4">
                  {!section.standalone && (
                    <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item) => (
                    <Link
                      key={item.route}
                      href={item.route}
                      className={`mb-0.5 block rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive(item.route)
                          ? 'bg-brand-light text-brand-green'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3 px-4 py-2 md:px-5">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 lg:hidden"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle sidebar"
              >
                <span className="block h-0.5 w-5 bg-slate-600" />
                <span className="my-1 block h-0.5 w-5 bg-slate-600" />
                <span className="block h-0.5 w-5 bg-slate-600" />
              </button>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-brand-green">
                  <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden="true">
                    <circle cx="20" cy="20" r="18" fill="#43a047" />
                    <ellipse cx="20" cy="22" rx="7" ry="9" fill="#e8f5e9" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">smART</div>
                  <div className="text-[10px] text-slate-500">IVF & Fertility Management</div>
                </div>
              </div>
              <TopNav />
              <div className="ml-auto flex items-center gap-3">
                {user && (
                  <span className="hidden text-sm text-slate-600 md:inline">
                    {user.userName || user.userLoginName}
                  </span>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-200 bg-white px-4 py-3 md:px-5">
            <PatientContextBar
              patient={selectedPatient}
              onSelectPatient={() => setShowPatientModal(true)}
            />
          </div>

          <main className="flex-1 p-4 md:p-5">{children}</main>
        </div>
      </div>

      <PatientSelectModal open={showPatientModal} onClose={() => setShowPatientModal(false)} />
    </>
  );
}
