'use client';

import Link from 'next/link';
import { usePatient } from '@/contexts/patient-context';

export default function DashboardPage() {
  const { selectedPatient } = usePatient();

  const quickLinks = [
    { label: 'Cycle Entry', href: '/cycle/entry', status: 'Ready' },
    { label: 'IUI', href: '/iui', status: 'Ready' },
    { label: 'Patient Master', href: '/masters/patient', status: 'Ready' },
    { label: 'Master Hub', href: '/masters', status: 'Ready' },
    { label: 'Reports', href: '/reports', status: 'Hub' },
    { label: 'Cryo – Semen Self', href: '/cryo/semen-self', status: 'Pending UI' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        {selectedPatient
          ? `Working with ${selectedPatient.name}. Open Cycle Entry or a clinical module from the sidebar.`
          : 'Select a patient from the bar above to begin clinical workflows.'}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-slate-200 p-4 transition hover:border-brand-primary hover:bg-brand-light/40"
          >
            <div className="font-semibold text-slate-800">{item.label}</div>
            <div className={`mt-1 text-xs ${item.status === 'Ready' ? 'text-brand-green' : 'text-slate-500'}`}>{item.status}</div>
          </Link>
        ))}
        <Link
          href={selectedPatient ? '/cycle/entry' : '/dashboard?selectPatient=1'}
          className="rounded-lg border border-slate-200 p-4 transition hover:border-brand-primary hover:bg-brand-light/40"
        >
          <div className="font-semibold text-slate-800">Retrieval</div>
          <div className="mt-1 text-xs text-slate-500">Open via Cycle Entry → Save & Next</div>
        </Link>
      </div>
    </div>
  );
}
