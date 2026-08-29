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
          className={`${
            sidebarOpen ? 'w-[260px]' : 'w-0'
          } shrink-0 overflow-hidden transition-all duration-200`}
        >
          <div className="flex h-full w-[260px] flex-col bg-brand-ink text-white">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark shadow-soft">
                  <span className="font-display text-lg font-extrabold">s</span>
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold tracking-tight">smART</div>
                  <div className="text-[11px] font-medium text-teal-200/70">IVF Clinic OS</div>
                </div>
              </div>
            </div>

            <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
              {SIDE_NAV_SECTIONS.map((section) => (
                <div key={section.title} className="mb-5">
                  {!section.standalone && (
                    <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200/45">
                      {section.title}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.route);
                      return (
                        <Link
                          key={`${section.title}-${item.route}`}
                          href={item.route}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            active
                              ? 'bg-gradient-to-r from-brand-primary/30 to-brand-primary/10 text-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]'
                              : 'text-teal-50/75 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <NavIcon name={item.icon} className="h-4 w-4 shrink-0 opacity-90" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-white/10 p-4">
              <div className="rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
                <div className="text-xs text-teal-100/60">Signed in</div>
                <div className="mt-0.5 truncate text-sm font-semibold text-white">
                  {user?.userName || user?.userLoginName || 'User'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-2.5 md:px-5">
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle sidebar"
              >
                <span className="block h-0.5 w-5 bg-slate-600" />
                <span className="my-1 block h-0.5 w-5 bg-slate-600" />
                <span className="block h-0.5 w-5 bg-slate-600" />
              </button>

              <TopNav />

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(true)}
                  className="hidden rounded-xl border border-brand-primary/25 bg-brand-mist px-3 py-1.5 text-sm font-semibold text-brand-dark hover:bg-brand-light sm:inline-flex"
                >
                  {selectedPatient ? 'Change Patient' : 'Select Patient'}
                </button>
                {user && (
                  <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
                      {(user.userName || user.userLoginName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-medium text-slate-700">
                      {user.userName || user.userLoginName}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-200/80 bg-white px-4 py-3 md:px-5">
            <PatientContextBar
              patient={selectedPatient}
              onSelectPatient={() => setShowPatientModal(true)}
            />
          </div>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      <PatientSelectModal open={showPatientModal} onClose={() => setShowPatientModal(false)} />
    </>
  );
}
