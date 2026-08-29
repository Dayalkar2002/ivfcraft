'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import { fetchDashboardSummary, type DashboardSummary } from '@/lib/services/dashboard';

const QUICK_ACTIONS = [
  { label: 'Cycle Entry', href: '/cycle/entry', tone: 'from-teal-500 to-emerald-500', icon: 'cycle' },
  { label: 'IUI', href: '/iui', tone: 'from-cyan-500 to-teal-500', icon: 'iui' },
  { label: 'IVF', href: '/ivf', tone: 'from-violet-500 to-fuchsia-500', icon: 'ivf' },
  { label: 'ICSI', href: '/icsi', tone: 'from-indigo-500 to-blue-500', icon: 'icsi' },
  { label: 'ET', href: '/et', tone: 'from-rose-500 to-orange-400', icon: 'et' },
  { label: 'Consent', href: '/consent', tone: 'from-amber-500 to-orange-500', icon: 'consent' },
];

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n || 0);
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { selectedPatient } = usePatient();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardSummary(token, {
          patId: selectedPatient?.id,
          satId: selectedPatient?.satelliteId,
        });
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, selectedPatient?.id, selectedPatient?.satelliteId]);

  const kpis = summary?.kpis;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-ink via-brand-dark to-brand-primary p-6 text-white shadow-soft md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 right-20 h-32 w-32 rounded-full bg-brand-rose/30 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-teal-100/80">{greeting}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {user?.userName || user?.userLoginName || 'Clinician'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-teal-50/85">
            {selectedPatient
              ? `Working with ${selectedPatient.name}. Jump into cycle entry, IUI, IVF, or consent forms.`
              : 'Select a patient to unlock clinical workflows, or explore clinic-wide KPIs below.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={selectedPatient ? '/cycle/entry' : '/dashboard?selectPatient=1'}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-dark shadow-sm hover:bg-teal-50"
            >
              {selectedPatient ? 'Open Cycle Entry' : 'Select Patient'}
            </Link>
            <Link
              href="/masters"
              className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Masters Hub
            </Link>
            <Link
              href="/reports"
              className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Reports
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Patients', value: kpis?.patients, hint: 'PatientMaster' },
          { label: 'Cycles', value: kpis?.cycles, hint: 'CycOutCome' },
          { label: 'IUI', value: kpis?.iui, hint: 'IUIOutCome' },
          { label: 'IVF', value: kpis?.ivf, hint: 'IVFOutCome' },
          { label: 'ET', value: kpis?.et, hint: 'ETOutCome' },
          { label: 'BT', value: kpis?.bt, hint: 'BTOutCome' },
          { label: 'Satellites', value: kpis?.satellites, hint: 'spSatelliteMasterExtDRL' },
          {
            label: 'Active focus',
            value: selectedPatient ? 1 : 0,
            hint: selectedPatient ? selectedPatient.name : 'No patient',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{card.label}</div>
                <div className="mt-2 font-display text-3xl font-extrabold text-slate-900">
                  {loading ? '—' : formatCount(card.value ?? 0)}
                </div>
              </div>
              <div className="kpi-ring h-10 w-10 rounded-full p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-dark">
                  KPI
                </div>
              </div>
            </div>
            <div className="mt-3 truncate text-xs text-slate-500">{card.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Quick actions</h2>
            <span className="text-xs font-medium text-slate-400">Clinical modules</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 p-4 transition hover:border-transparent hover:shadow-soft"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.tone} opacity-0 transition group-hover:opacity-100`}
                />
                <div className="relative">
                  <div className="font-semibold text-slate-800 group-hover:text-white">{action.label}</div>
                  <div className="mt-1 text-xs text-slate-500 group-hover:text-white/80">Open module →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Patient snapshot</h2>
          {selectedPatient ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-brand-mist px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-wide text-brand-dark/60">Name</div>
                <div className="font-semibold text-slate-900">{selectedPatient.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">UHID</div>
                  <div className="font-semibold">{selectedPatient.uhid || '—'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Age</div>
                  <div className="font-semibold">{selectedPatient.age ?? '—'} Y</div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="text-[10px] font-bold uppercase text-slate-400">Partner</div>
                <div className="font-semibold">{selectedPatient.partner || '—'}</div>
              </div>
              <Link
                href="/consent"
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-brand-dark px-3 py-2.5 text-sm font-bold text-white hover:bg-brand-green"
              >
                Open Consent Form
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Select a patient to see cycle and IUI activity here.
              <div className="mt-3">
                <Link
                  href="/dashboard?selectPatient=1"
                  className="font-semibold text-brand-dark hover:underline"
                >
                  Select Patient
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Recent cycles</h2>
          <p className="mt-1 text-xs text-slate-500">via spCycOutComeExtDRL</p>
          <div className="mt-4 space-y-2">
            {(summary?.recentCycles?.length ?? 0) === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                {selectedPatient ? 'No cycle rows for this patient.' : 'Select a patient to load cycles.'}
              </div>
            ) : (
              summary?.recentCycles.map((row) => (
                <div
                  key={String(row.id)}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{row.id || 'Cycle'}</div>
                    <div className="text-xs text-slate-500">{row.type || '—'}</div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Module volume</h2>
          <p className="mt-1 text-xs text-slate-500">Clinic totals from SQL tables</p>
          <div className="mt-4 space-y-3">
            {(summary?.modules ?? []).map((mod) => {
              const max = Math.max(...(summary?.modules.map((m) => m.count) || [1]), 1);
              const pct = Math.round((mod.count / max) * 100);
              return (
                <Link key={mod.key} href={mod.href} className="block">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{mod.label}</span>
                    <span className="text-slate-500">{formatCount(mod.count)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-dark to-brand-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
