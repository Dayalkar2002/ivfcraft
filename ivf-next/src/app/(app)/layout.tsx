'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell';
import { RequireAuth } from '@/components/require-auth';
import { PatientProvider } from '@/contexts/patient-context';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <PatientProvider>
        <AppShell>{children}</AppShell>
      </PatientProvider>
    </RequireAuth>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
