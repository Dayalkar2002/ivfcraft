'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ModuleAlerts, ModuleCard, PatientRequired, usePatientIds } from '@/components/clinical/clinical-shared';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import { toDateInput } from '@/lib/services/clinical-modules';
import { loadIuiOutcome, saveIui } from '@/lib/services/iui';

const today = () => new Date().toISOString().slice(0, 10);
const inputCls = 'mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm';
const labelCls = 'text-xs font-medium text-slate-600';

interface IuiEntryFormProps {
  iuiId?: string;
}

export function IuiEntryForm({ iuiId }: IuiEntryFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { patId, satId, ready } = usePatientIds();

  const isNew = !iuiId || iuiId === 'new';
  const isDeleteMode = searchParams.get('mode') === 'delete';
  const iuiOIdParam = Number(searchParams.get('iuiOId') || 1);

  const [form, setForm] = useState({
    iuiId: '',
    iuiOId: iuiOIdParam,
    iuiIdOff: '',
    iuiDate: today(),
    iuiODate: today(),
    iuioValue: 0,
    iuioNoSac: 0,
    iuioPostIuiDay: 0,
    iuioOutcome: 0,
    iuioPregOpt: 0,
    iuioPregDelOpt: 0,
    iuioPostTreat: '',
    iuioAdvice: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token || !ready || isNew || !iuiId) return;
    setLoading(true);
    setError('');
    loadIuiOutcome(token, iuiId, iuiOIdParam, patId, satId)
      .then((data) => {
        if (!data) return;
        setForm({
          iuiId: String(data.IUIID || iuiId),
          iuiOId: iuiOIdParam,
          iuiIdOff: String(data.IUIIDOff || ''),
          iuiDate: toDateInput(data.IUIODateOfCreation),
          iuiODate: toDateInput(data.IUIODate),
          iuioValue: Number(data.IUIOValue || 0),
          iuioNoSac: Number(data.IUIONoSac || 0),
          iuioPostIuiDay: Number(data.IUIOPostIUIDay || 0),
          iuioOutcome: Number(data.IUIOOutcome || 0),
          iuioPregOpt: Number(data.IUIOPregOpt || 0),
          iuioPregDelOpt: Number(data.IUIOPregDelOpt || 0),
          iuioPostTreat: String(data.IUIOPostTreat || ''),
          iuioAdvice: String(data.IUIOAdvice || ''),
        });
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load IUI record.');
      })
      .finally(() => setLoading(false));
  }, [token, ready, isNew, iuiId, iuiOIdParam, patId, satId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !ready) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await saveIui(token, {
        mode: isNew ? 'insert' : 'update',
        patId,
        satId,
        ...form,
      });
      setSuccess(res.message);
      router.push('/iui');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save IUI record.');
    } finally {
      setSaving(false);
    }
  }

  const title = isNew ? 'New IUI Entry' : isDeleteMode ? 'Delete IUI Record' : 'Edit IUI Entry';

  return (
    <PatientRequired>
      <ModuleCard title={title}>
        <Link href="/iui" className="mb-3 inline-block text-sm text-brand-primary hover:underline">
          ← Back to IUI List
        </Link>

        <ModuleAlerts error={error} success={success} />
        {loading && <p className="text-sm text-slate-500">Loading…</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-800">IUI Outcome</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelCls}>
                IUI Id
                <input value={form.iuiId} readOnly className={`${inputCls} bg-slate-50`} />
              </label>
              <label className={labelCls}>
                IUI Id Off
                <input value={form.iuiIdOff} onChange={(e) => setForm((f) => ({ ...f, iuiIdOff: e.target.value }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                IUI Date
                <input type="date" value={form.iuiDate} onChange={(e) => setForm((f) => ({ ...f, iuiDate: e.target.value }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                Outcome Date
                <input type="date" value={form.iuiODate} onChange={(e) => setForm((f) => ({ ...f, iuiODate: e.target.value }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                Value
                <input type="number" value={form.iuioValue} onChange={(e) => setForm((f) => ({ ...f, iuioValue: Number(e.target.value) }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                No. of Sac
                <input type="number" value={form.iuioNoSac} onChange={(e) => setForm((f) => ({ ...f, iuioNoSac: Number(e.target.value) }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                Post IUI Day
                <input type="number" value={form.iuioPostIuiDay} onChange={(e) => setForm((f) => ({ ...f, iuioPostIuiDay: Number(e.target.value) }))} className={inputCls} />
              </label>
              <label className={labelCls}>
                Outcome
                <select value={form.iuioOutcome} onChange={(e) => setForm((f) => ({ ...f, iuioOutcome: Number(e.target.value) }))} className={inputCls}>
                  <option value={0}>Negative</option>
                  <option value={1}>Positive</option>
                </select>
              </label>
              <label className={labelCls}>
                Pregnancy Option
                <select value={form.iuioPregOpt} onChange={(e) => setForm((f) => ({ ...f, iuioPregOpt: Number(e.target.value) }))} className={inputCls}>
                  <option value={0}>—</option>
                  <option value={1}>Clinical</option>
                  <option value={2}>Biochemical</option>
                  <option value={3}>Delivered</option>
                </select>
              </label>
              <label className={labelCls}>
                Delivery Option
                <select value={form.iuioPregDelOpt} onChange={(e) => setForm((f) => ({ ...f, iuioPregDelOpt: Number(e.target.value) }))} className={inputCls}>
                  <option value={0}>—</option>
                  <option value={1}>Live Birth</option>
                  <option value={2}>Miscarriage</option>
                </select>
              </label>
              <label className={`${labelCls} md:col-span-2 xl:col-span-3`}>
                Post Treatment
                <textarea
                  rows={4}
                  value={form.iuioPostTreat}
                  onChange={(e) => setForm((f) => ({ ...f, iuioPostTreat: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className={`${labelCls} md:col-span-2 xl:col-span-3`}>
                Advice
                <textarea
                  rows={3}
                  value={form.iuioAdvice}
                  onChange={(e) => setForm((f) => ({ ...f, iuioAdvice: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </section>

          <p className="text-xs text-slate-500">
            Analysis, uterus/ovaries, procedure details, and follicular study sections from the legacy IUI module will be added in a follow-up. Outcome save uses spIUIOutCome.
          </p>

          <div className="flex gap-2">
            {!isDeleteMode && (
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving…' : isNew ? 'Submit' : 'Update'}
              </button>
            )}
            <button type="button" onClick={() => router.push('/iui')} className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600">
              Cancel
            </button>
          </div>
        </form>
      </ModuleCard>
    </PatientRequired>
  );
}
