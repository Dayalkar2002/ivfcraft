'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ModuleAlerts, ModuleCard, PatientRequired, usePatientIds } from '@/components/clinical/clinical-shared';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import { asBool } from '@/lib/services/clinical-modules';
import { IuiListRow, listIui, unlockIui } from '@/lib/services/iui';

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function IuiList() {
  const router = useRouter();
  const { token } = useAuth();
  const { patId, satId, patientName, ready } = usePatientIds();
  const [rows, setRows] = useState<IuiListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!token || !ready) return;
    setLoading(true);
    setError('');
    try {
      setRows(await listIui(token, patId, satId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load IUI list.');
    } finally {
      setLoading(false);
    }
  }, [token, ready, patId, satId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUnlock(row: IuiListRow) {
    if (!token) return;
    setError('');
    setSuccess('');
    try {
      const res = await unlockIui(token, { patId, cycleId: row.IUIID, patName: patientName });
      setSuccess(res.message);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to unlock cycle.');
    }
  }

  return (
    <PatientRequired>
      <ModuleCard title="IUI List of Patient">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">Patient: {patientName}</p>
          <Link
            href="/iui/new"
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Add New
          </Link>
        </div>

        <ModuleAlerts error={error} success={success} />

        {loading ? (
          <p className="text-sm text-slate-500">Loading IUI records…</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">IUI Id</th>
                  <th className="px-3 py-2">Indication</th>
                  <th className="px-3 py-2">IUI Date</th>
                  <th className="px-3 py-2">IUI Id Off</th>
                  <th className="px-3 py-2">Post Treatment</th>
                  <th className="px-3 py-2">Advice</th>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const iuiOId = Number(row.IUIOID ?? 0);
                  const locked = asBool(row.IsLock);
                  return (
                    <tr key={`${row.IUIID}-${iuiOId}`} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/iui/${encodeURIComponent(row.IUIID)}?iuiOId=${iuiOId}`)}
                          className="text-brand-primary hover:underline"
                        >
                          Select
                        </button>
                      </td>
                      <td className="px-3 py-2">{row.IUIID}</td>
                      <td className="px-3 py-2">{row.Indication || '—'}</td>
                      <td className="px-3 py-2">{formatDate(row.IUIODateOfCreation as string | undefined)}</td>
                      <td className="px-3 py-2">{row.IUIIDOff || '—'}</td>
                      <td className="max-w-xs px-3 py-2">{row.IUIOPostTreat || '—'}</td>
                      <td className="max-w-xs px-3 py-2">{row.IUIOAdvice || '—'}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/iui/${encodeURIComponent(row.IUIID)}?iuiOId=${iuiOId}&mode=delete`)
                          }
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {locked && (
                          <button type="button" onClick={() => void handleUnlock(row)} className="text-brand-primary hover:underline">
                            Unlock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                      No IUI records found for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </ModuleCard>
    </PatientRequired>
  );
}
