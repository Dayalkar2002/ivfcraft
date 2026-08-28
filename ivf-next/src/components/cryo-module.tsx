'use client';

import { useCallback, useEffect, useState } from 'react';
import { ModuleAlerts, ModuleCard, PatientRequired, usePatientIds } from '@/components/clinical/clinical-shared';
import { SpDataTable } from '@/components/sp-data-table';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import type { CryoSpec } from '@/lib/module-registry';
import { executeSpDrl, type SpRow } from '@/lib/services/sp';

interface CryoModuleProps {
  title: string;
  description: string;
  spec: CryoSpec;
  note?: string;
}

export function CryoModule({ title, description, spec, note }: CryoModuleProps) {
  const { token } = useAuth();
  const { patId, satId, patientName } = usePatientIds();
  const [rows, setRows] = useState<SpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token || !patId || !satId) return;
    setLoading(true);
    setError('');
    try {
      const data = await executeSpDrl(token, {
        procName: spec.procName,
        paramNames: spec.paramNames,
        values: spec.buildListValues({ patId, satId, queryIndex: spec.listQueryIndex }),
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load cryo records.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, patId, satId, spec]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PatientRequired>
      <ModuleCard title={title}>
        <p className="mb-4 text-sm text-slate-600">{description}</p>
        {note && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{note}</p>}
        <p className="mb-3 text-sm text-slate-600">
          Patient: <span className="font-medium text-slate-800">{patientName}</span>
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Stored procedure: <code className="rounded bg-slate-100 px-1">{spec.procName}</code>
          {loading && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5">Loading…</span>}
        </p>
        <ModuleAlerts error={error} />
        <div className="mb-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
        <SpDataTable rows={rows} emptyMessage="No cryo records for this patient." />
        <p className="mt-4 text-xs text-slate-500">
          Full entry forms from legacy cryo pages will be added in a follow-up. Data loads via the generic SP executor when SQL is configured.
        </p>
      </ModuleCard>
    </PatientRequired>
  );
}
