'use client';

import { useState } from 'react';
import { ModuleAlerts, ModuleCard, PatientRequired, usePatientIds } from '@/components/clinical/clinical-shared';
import { SpDataTable } from '@/components/sp-data-table';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import type { ReportSpec } from '@/lib/module-registry';
import { executeSpDrl, type SpRow } from '@/lib/services/sp';

const inputCls = 'h-9 rounded-lg border border-slate-300 px-3 text-sm';

function defaultFromDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultToDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ReportRunnerProps {
  title: string;
  description: string;
  spec: ReportSpec;
  note?: string;
}

export function ReportRunner({ title, description, spec, note }: ReportRunnerProps) {
  const { token } = useAuth();
  const { patId, satId, patientName, ready } = usePatientIds();
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<SpRow[]>([]);
  const [ran, setRan] = useState(false);

  const needsPatient = spec.requiresPatient !== false;
  const canRun = !!token && (!needsPatient || ready) && (!spec.requiresDateRange || (fromDate && toDate));

  async function runReport() {
    if (!token || !canRun) return;
    setLoading(true);
    setError('');
    setRan(true);
    try {
      const data = await executeSpDrl(token, {
        procName: spec.procName,
        paramNames: spec.paramNames,
        values: spec.buildValues({
          patId: needsPatient ? patId : 0,
          satId: needsPatient ? satId : 0,
          fromDate,
          toDate,
          queryIndex: spec.queryIndex,
        }),
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Report failed.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const filters = (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      {needsPatient && ready && (
        <div className="text-sm text-slate-600">
          Patient: <span className="font-medium text-slate-800">{patientName}</span> (ID {patId})
        </div>
      )}
      {spec.requiresDateRange && (
        <>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            From
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            To
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputCls} />
          </label>
        </>
      )}
      <button
        type="button"
        onClick={() => void runReport()}
        disabled={!canRun || loading}
        className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? 'Running…' : 'Run report'}
      </button>
    </div>
  );

  const body = (
    <>
      <p className="mb-4 text-sm text-slate-600">{description}</p>
      {note && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{note}</p>}
      <p className="mb-3 text-xs text-slate-500">
        Stored procedure: <code className="rounded bg-slate-100 px-1">{spec.procName}</code>
      </p>
      <ModuleAlerts error={error} />
      {filters}
      {ran && <SpDataTable rows={rows} emptyMessage="Report returned no rows." />}
    </>
  );

  if (needsPatient) {
    return (
      <PatientRequired>
        <ModuleCard title={title}>{body}</ModuleCard>
      </PatientRequired>
    );
  }

  return <ModuleCard title={title}>{body}</ModuleCard>;
}
