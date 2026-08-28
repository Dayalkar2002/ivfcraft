'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import {
  checkDonorAadhar,
  fetchRetrievalConfig,
  saveRetrieval,
} from '@/lib/services/cycles';
import type {
  DonorAadharCheck,
  RetrievalConfig,
  RetrievalRow,
} from '@/lib/types/cycle';
import {
  CycleHistoryTab,
  CycleMonitoringTab,
  CycleOutcomeTab,
  CycleSurvivalTab,
} from '@/components/cycle-tabs';

const emptySelfRow = (): RetrievalRow => ({
  leftOvary: null,
  rightOvary: null,
  ivf: null,
  icsi: null,
  gift: null,
  zift: null,
  damaged: null,
  total: null,
});

const emptyRecipientRow = (): RetrievalRow => ({
  leftOvary: null,
  rightOvary: null,
  ivf: null,
  icsi: null,
  total: null,
  recipientPatientId: null,
  recipientCycleId: '',
});

interface CycleRetrievalFormProps {
  cycleId: string;
}

export function CycleRetrievalForm({ cycleId }: CycleRetrievalFormProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [config, setConfig] = useState<RetrievalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState('retrieval');

  const [selfToSelf, setSelfToSelf] = useState<RetrievalRow[]>([emptySelfRow()]);
  const [donorToRecipient, setDonorToRecipient] = useState<RetrievalRow[]>([emptyRecipientRow()]);
  const [rowAadharChecks, setRowAadharChecks] = useState<Record<number, DonorAadharCheck>>({});
  const [lockedRecipientId, setLockedRecipientId] = useState<number | null>(null);

  const tabs = [
    { id: 'history', label: 'History' },
    { id: 'survival', label: 'Survival Report' },
    { id: 'monitoring', label: 'Monitoring Chart' },
    { id: 'retrieval', label: 'Retrieval' },
    { id: 'outcome', label: 'Outcome' },
  ];

  useEffect(() => {
    if (!token || !cycleId) return;
    setLoading(true);
    setError(null);
    void fetchRetrievalConfig(token, cycleId)
      .then((data) => {
        setConfig(data);
        const locked = data.lockedRecipients?.[0];
        if (locked) {
          setLockedRecipientId(locked.recipientId);
          setDonorToRecipient([
            { ...emptyRecipientRow(), recipientPatientId: locked.recipientId },
          ]);
        }
        if (data.existingRetrieval) {
          if (data.sections.showSelfToSelf && data.existingRetrieval.selfToSelf?.length) {
            setSelfToSelf(data.existingRetrieval.selfToSelf);
          }
          if (data.sections.showDonorToRecipient && data.existingRetrieval.donorToRecipient?.length) {
            setDonorToRecipient(data.existingRetrieval.donorToRecipient);
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load retrieval config.'))
      .finally(() => setLoading(false));
  }, [token, cycleId]);

  function updateSelfRow(index: number, key: keyof RetrievalRow, value: string) {
    setSelfToSelf((rows) =>
      rows.map((row, i) =>
        i === index
          ? { ...row, [key]: value === '' ? null : key === 'recipientCycleId' ? value : Number(value) }
          : row
      )
    );
  }

  function updateRecipientRow(index: number, key: keyof RetrievalRow, value: string) {
    setDonorToRecipient((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        if (key === 'recipientCycleId') return { ...row, recipientCycleId: value };
        if (key === 'recipientPatientId') return { ...row, recipientPatientId: value ? Number(value) : null };
        return { ...row, [key]: value === '' ? null : Number(value) };
      })
    );
  }

  function isRecipientLocked(recipientId: number): boolean {
    return lockedRecipientId !== null && recipientId !== lockedRecipientId;
  }

  async function onRecipientChange(rowIndex: number, recipientId: number) {
    if (!token || !config) return;

    if (!recipientId) {
      setRowAadharChecks((prev) => {
        const next = { ...prev };
        delete next[rowIndex];
        return next;
      });
      return;
    }

    const donorPatId = config.cycle.patientId;

    if (lockedRecipientId && recipientId !== lockedRecipientId) {
      setRowAadharChecks((prev) => ({
        ...prev,
        [rowIndex]: {
          donorAadhar: config.donorAadhar,
          recipientAadhar: '',
          message: 'This donor is already mapped to another recipient. Only the same recipient is allowed.',
          isAllowed: false,
        },
      }));
      return;
    }

    try {
      const check = await checkDonorAadhar(token, donorPatId, recipientId, cycleId);
      setRowAadharChecks((prev) => ({ ...prev, [rowIndex]: check }));
    } catch (err) {
      const dbUnavailable = err instanceof ApiError && err.status === 503;
      setRowAadharChecks((prev) => ({
        ...prev,
        [rowIndex]: {
          donorAadhar: config.donorAadhar,
          recipientAadhar: '',
          message: dbUnavailable ? '' : 'Unable to validate donor Aadhaar mapping.',
          isAllowed: dbUnavailable,
        },
      }));
    }
  }

  async function save() {
    if (!token || !config) return;
    setValidationError('');
    setError(null);
    setSuccess(null);

    const sections: { selfToSelf?: RetrievalRow[]; donorToRecipient?: RetrievalRow[] } = {};

    if (config.sections.showSelfToSelf) {
      sections.selfToSelf = selfToSelf;
    }

    if (config.sections.showDonorToRecipient) {
      const recipientIds = donorToRecipient
        .map((row) => Number(row.recipientPatientId))
        .filter((id) => id > 0);
      const uniqueRecipients = [...new Set(recipientIds)];
      if (uniqueRecipients.length > 1) {
        setValidationError(
          'As per government norms, one oocyte donor can donate to only one recipient. Please select the same recipient in all rows.'
        );
        return;
      }

      const invalidRow = Object.values(rowAadharChecks).find((check) => !check.isAllowed);
      if (invalidRow) {
        setValidationError(invalidRow.message);
        return;
      }

      sections.donorToRecipient = donorToRecipient;
    }

    setSaving(true);
    try {
      await saveRetrieval(token, cycleId, sections);
      setSuccess('Retrieval data saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save retrieval.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading retrieval configuration…</p>;
  }

  if (!config) {
    return <p className="text-sm text-red-600">{error ?? 'Retrieval configuration not available.'}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-800">Cycle Entry Module</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>
            <strong>CycID:</strong> {config.cycle.cycleId}
          </span>
          <span>
            <strong>Type:</strong> {config.cycle.cycleType}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? 'border border-b-0 border-slate-200 bg-white text-brand-green'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'history' && <CycleHistoryTab cycleId={cycleId} />}
      {activeTab === 'survival' && <CycleSurvivalTab cycleId={cycleId} />}
      {activeTab === 'monitoring' && <CycleMonitoringTab cycleId={cycleId} />}
      {activeTab === 'outcome' && <CycleOutcomeTab cycleId={cycleId} />}
      {activeTab === 'retrieval' && (
        <div className="space-y-6">
          {config.sections.showSelfToSelf && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
              <h3 className="mb-3 font-bold text-slate-800">Self → Self (Oocytes for own use)</h3>
              {selfToSelf.map((row, i) => (
                <div key={i} className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                  {(['leftOvary', 'rightOvary', 'ivf', 'icsi', 'gift', 'zift', 'damaged', 'total'] as const).map(
                    (key) => (
                      <input
                        key={key}
                        type="number"
                        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        value={row[key] ?? ''}
                        onChange={(e) => updateSelfRow(i, key, e.target.value)}
                        className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
                      />
                    )
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-sm font-semibold text-brand-green hover:underline"
                onClick={() => setSelfToSelf((rows) => [...rows, emptySelfRow()])}
              >
                + Add Row
              </button>
            </section>
          )}

          {config.sections.showDonorToRecipient && (
            <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-4">
              <h3 className="mb-2 font-bold text-slate-800">
                Donor → Recipient (Oocyte Donor donating to Recipient)
              </h3>
              <p className="mb-3 text-xs text-slate-600">
                As per government norms, one oocyte donor (Aadhaar) can donate to only one recipient. A
                recipient may receive from many donors.
              </p>
              {config.donorAadhar && (
                <p className="mb-3 text-sm">
                  <strong>Donor Aadhaar:</strong> {config.donorAadhar}
                </p>
              )}
              {config.lockedRecipients.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-600">Locked recipient from prior donation:</span>
                  {config.lockedRecipients.map((lr) => (
                    <span
                      key={lr.recipientId}
                      className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
                    >
                      {lr.recipientName}
                      {lr.recipientAadhar ? ` (Aadhaar: ${lr.recipientAadhar})` : ''}
                    </span>
                  ))}
                </div>
              )}

              {donorToRecipient.map((row, i) => (
                <div key={i} className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
                    <select
                      value={row.recipientPatientId ?? ''}
                      onChange={(e) => {
                        updateRecipientRow(i, 'recipientPatientId', e.target.value);
                        void onRecipientChange(i, Number(e.target.value));
                      }}
                      className="h-9 rounded-lg border border-slate-300 px-2 text-sm lg:col-span-2"
                    >
                      <option value="">Select Recipient</option>
                      {config.availableRecipients.map((r) => (
                        <option key={r.id} value={r.id} disabled={isRecipientLocked(r.id)}>
                          {r.name} ({r.uhid})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Recipient Cycle ID"
                      value={row.recipientCycleId ?? ''}
                      onChange={(e) => updateRecipientRow(i, 'recipientCycleId', e.target.value)}
                      className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
                    />
                    {(['leftOvary', 'rightOvary', 'ivf', 'icsi', 'total'] as const).map((key) => (
                      <input
                        key={key}
                        type="number"
                        placeholder={key.replace(/([A-Z])/g, ' $1')}
                        value={row[key] ?? ''}
                        onChange={(e) => updateRecipientRow(i, key, e.target.value)}
                        className="h-9 rounded-lg border border-slate-300 px-2 text-sm"
                      />
                    ))}
                  </div>
                  {rowAadharChecks[i] && (
                    <div
                      className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                        !rowAadharChecks[i].isAllowed
                          ? 'bg-red-50 text-red-700'
                          : rowAadharChecks[i].message
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {(rowAadharChecks[i].donorAadhar || rowAadharChecks[i].recipientAadhar) && (
                        <div className="flex flex-wrap gap-4">
                          <span>
                            <strong>Donor Aadhaar:</strong> {rowAadharChecks[i].donorAadhar || '—'}
                          </span>
                          <span>
                            <strong>Recipient Aadhaar:</strong>{' '}
                            {rowAadharChecks[i].recipientAadhar || '—'}
                          </span>
                        </div>
                      )}
                      {rowAadharChecks[i].message && (
                        <div className="mt-1">{rowAadharChecks[i].message}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-sm font-semibold text-brand-green hover:underline"
                onClick={() => setDonorToRecipient((rows) => [...rows, emptyRecipientRow()])}
              >
                + Add Row
              </button>
            </section>
          )}

          {config.sections.showOocyteReceivedFrom && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              Oocyte received from donor is reflected on the Master Patient page.
            </div>
          )}

          {config.sections.showEmbryoRecipient && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Embryo recipient retrieval is managed in the legacy smART module until fully ported.
            </div>
          )}

          {validationError && <Alert type="error" message={validationError} />}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Retrieval'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/cycle/entry')}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back to Cycle Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}
