'use client';

import { ReactNode } from 'react';
import { usePatient } from '@/contexts/patient-context';

export function usePatientIds() {
  const { selectedPatient, selectedSatellite } = usePatient();
  const patId = selectedPatient?.id ?? 0;
  const satId = selectedPatient?.satelliteId ?? selectedSatellite?.id ?? 0;
  const patientAge = selectedPatient?.age ?? 0;
  const patientName = selectedPatient?.name ?? '';
  const ready = !!patId && !!satId;
  return { patId, satId, patientAge, patientName, ready, selectedPatient };
}

export function PatientRequired({ children }: { children: ReactNode }) {
  const { ready, selectedPatient } = usePatientIds();
  if (!selectedPatient) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Please select a patient using the bar above before opening this module.
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Satellite clinic is required. Open Change Patient, pick a satellite, then select the patient again.
      </div>
    );
  }
  return children;
}

export function ModuleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="module-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-slate-800">{title}</h1>
      {children}
    </div>
  );
}

export function ModuleAlerts({ error, success }: { error?: string; success?: string }) {
  return (
    <>
      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
    </>
  );
}
