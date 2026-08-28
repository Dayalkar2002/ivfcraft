'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import {
  deleteMasterPatient,
  fetchPatientLookups,
  getMasterPatient,
  listMasterPatients,
  saveMasterPatient,
} from '@/lib/services/masters';
import type { LookupItem, PatientMasterDetail, PatientMasterRow } from '@/lib/types/master';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): PatientMasterDetail & { patId: number } => ({
  patId: 0,
  refNo: '',
  dateOfCreation: today(),
  name: '',
  category: '',
  age: 0,
  dob: today(),
  address: '',
  city: '',
  phone: '',
  mobile: '',
  email: '',
  docId: 0,
  diagId: 0,
  husbandName: '',
  husbandAge: 0,
  husbandDob: today(),
  satId: 0,
  refId: 0,
  panCard: '',
  aadhar: '',
  husbandPan: '',
  husbandAadhar: '',
  husbandEmail: '',
  husbandPhone: '',
  photo: '',
  maritalStatus: 'Married',
});

function toInputDate(value: string | null | undefined): string {
  if (!value) return today();
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PatientMasterForm() {
  const { token } = useAuth();
  const [form, setForm] = useState(emptyForm());
  const [satellites, setSatellites] = useState<LookupItem[]>([]);
  const [doctors, setDoctors] = useState<LookupItem[]>([]);
  const [diagnosis, setDiagnosis] = useState<LookupItem[]>([]);
  const [refBy, setRefBy] = useState<LookupItem[]>([]);
  const [rows, setRows] = useState<PatientMasterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<PatientMasterDetail | null>(null);

  const isUnmarried = form.maritalStatus === 'Unmarried';
  const partnerNameLabel = isUnmarried ? 'Father Name' : 'Husband Name';
  const partnerAgeLabel = isUnmarried ? 'Father Age' : 'Husband Age';
  const partnerDobLabel = isUnmarried ? 'Father Birth Date' : 'Husband Birth Date';

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [lookups, list] = await Promise.all([
        fetchPatientLookups(token),
        listMasterPatients(token),
      ]);
      setSatellites(lookups.satellites);
      setDoctors(lookups.doctors);
      setDiagnosis(lookups.diagnosis);
      setRefBy(lookups.refBy);
      setRows(list);
    } catch (err) {
      setError(formatLoadError(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'maritalStatus' && value === 'Unmarried') {
        next.phone = '';
        next.husbandPan = '';
        next.husbandAadhar = '';
        next.husbandEmail = '';
      }
      return next;
    });
  }

  function patchForm(detail: PatientMasterDetail) {
    setForm({
      patId: detail.id ?? detail.patId ?? 0,
      refNo: detail.refNo,
      dateOfCreation: toInputDate(detail.dateOfCreation),
      name: detail.name,
      category: detail.category,
      age: detail.age,
      dob: toInputDate(detail.dob),
      address: detail.address,
      city: detail.city,
      phone: detail.phone,
      mobile: detail.mobile,
      email: detail.email,
      docId: detail.docId,
      diagId: detail.diagId,
      husbandName: detail.husbandName,
      husbandAge: detail.husbandAge,
      husbandDob: toInputDate(detail.husbandDob),
      satId: detail.satId,
      refId: detail.refId,
      panCard: detail.panCard,
      aadhar: detail.aadhar,
      husbandPan: detail.husbandPan,
      husbandAadhar: detail.husbandAadhar,
      husbandEmail: detail.husbandEmail,
      husbandPhone: detail.husbandPhone ?? '',
      photo: detail.photo,
      maritalStatus: detail.maritalStatus || 'Married',
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await saveMasterPatient(token, form);
      setRows(res.data);
      setSuccess(res.message);
      if (!form.patId) setForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function selectRow(row: PatientMasterRow) {
    if (!token) return;
    try {
      const detail = await getMasterPatient(token, row.id);
      patchForm(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient.');
    }
  }

  async function openRowPopup(row: PatientMasterRow) {
    if (!token) return;
    setShowDetailModal(true);
    setDetailLoading(true);
    setSelectedDetail(null);
    try {
      const detail = await getMasterPatient(token, row.id);
      setSelectedDetail(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient details.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteRow(row: PatientMasterRow) {
    if (!token || !confirm(`Delete patient "${row.name}"?`)) return;
    try {
      await deleteMasterPatient(token, row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setForm(emptyForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  function lookupName(list: LookupItem[], id: number) {
    return list.find((item) => item.id === id)?.name ?? '—';
  }

  return (
    <div className="master-page rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Patient Master</h1>
        {loading && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Loading…</span>}
      </div>

      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Name" value={form.name} onChange={(v) => updateField('name', v)} />
        <Field label="Ref No" value={form.refNo} onChange={(v) => updateField('refNo', v)} />
        <Field label="Category" value={form.category} onChange={(v) => updateField('category', v)} readOnly title="Updated automatically from cycles and donation activity" />
        <label className="text-xs font-medium text-slate-600">
          Marital Status
          <select value={form.maritalStatus} onChange={(e) => updateField('maritalStatus', e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm">
            <option value="Married">Married</option>
            <option value="Unmarried">Unmarried</option>
          </select>
        </label>
        <Field label="Date" type="date" value={form.dateOfCreation ?? ''} onChange={(v) => updateField('dateOfCreation', v)} />
        <Field label="Birth Date" type="date" value={form.dob ?? ''} onChange={(v) => updateField('dob', v)} />
        <Field label="Age" type="number" value={String(form.age)} onChange={(v) => updateField('age', Number(v))} />
        <label className="text-xs font-medium text-slate-600 md:col-span-2 xl:col-span-3">
          Address
          <textarea value={form.address} onChange={(e) => updateField('address', e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <Field label="City" value={form.city} onChange={(v) => updateField('city', v)} />
        <Field label="Email" value={form.email} onChange={(v) => updateField('email', v)} />
        <Field label="Patient PAN" value={form.panCard} onChange={(v) => updateField('panCard', v)} />
        <Field label="Patient Aadhar" value={form.aadhar} onChange={(v) => updateField('aadhar', v)} />
        <Field label="Mobile" value={form.mobile} onChange={(v) => updateField('mobile', v)} />
        <Field label="Phone" value={form.phone} onChange={(v) => updateField('phone', v)} />
        <SelectField label="Satellite" value={form.satId} options={satellites} onChange={(v) => updateField('satId', v)} />
        <SelectField label="Doctor Name" value={form.docId} options={doctors} onChange={(v) => updateField('docId', v)} />
        <SelectField label="Diagnosis" value={form.diagId} options={diagnosis} onChange={(v) => updateField('diagId', v)} />
        <Field label={partnerNameLabel} value={form.husbandName} onChange={(v) => updateField('husbandName', v)} />
        <Field label={partnerAgeLabel} type="number" value={String(form.husbandAge)} onChange={(v) => updateField('husbandAge', Number(v))} />
        <Field label={partnerDobLabel} type="date" value={form.husbandDob ?? ''} onChange={(v) => updateField('husbandDob', v)} />
        <SelectField label="Ref By" value={form.refId} options={refBy} onChange={(v) => updateField('refId', v)} />
        {!isUnmarried && (
          <>
            <Field label="Husband PAN" value={form.husbandPan} onChange={(v) => updateField('husbandPan', v)} />
            <Field label="Husband Aadhar" value={form.husbandAadhar} onChange={(v) => updateField('husbandAadhar', v)} />
            <Field label="Husband Email" value={form.husbandEmail} onChange={(v) => updateField('husbandEmail', v)} />
          </>
        )}
        <Field label="Husband Phone" value={form.husbandPhone ?? ''} onChange={(v) => updateField('husbandPhone', v)} />
        <div className="flex gap-2 md:col-span-2 xl:col-span-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {form.patId ? 'Update' : 'Submit'}
          </button>
          <button type="button" onClick={() => setForm(emptyForm())} className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600">
            Cancel
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-slate-500">Click any row in the list below to open patient details in a popup.</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <th className="p-2">Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Husband Name</th>
              <th className="p-2">Address</th>
              <th className="p-2">Date of Creation</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => void openRowPopup(row)}>
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.category}</td>
                <td className="p-2">{row.husbandName}</td>
                <td className="p-2">{row.address}</td>
                <td className="p-2">{formatDate(row.dateOfCreation)}</td>
                <td className="p-2" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="mr-2 text-brand-green hover:underline" onClick={() => void selectRow(row)}>Edit</button>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => void deleteRow(row)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-500">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Patient Details</h2>
              <button type="button" onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>
            {detailLoading ? (
              <p className="text-sm text-slate-500">Loading patient details…</p>
            ) : selectedDetail ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem label="Name" value={selectedDetail.name} />
                  <DetailItem label="Ref No" value={selectedDetail.refNo} />
                  <DetailItem label="Category" value={selectedDetail.category} />
                  <DetailItem label="Marital Status" value={selectedDetail.maritalStatus || 'Married'} />
                  <DetailItem label="Date" value={formatDate(selectedDetail.dateOfCreation)} />
                  <DetailItem label="Birth Date" value={formatDate(selectedDetail.dob)} />
                  <DetailItem label="Age" value={String(selectedDetail.age ?? '—')} />
                  <DetailItem label="Address" value={selectedDetail.address} className="sm:col-span-2" />
                  <DetailItem label="City" value={selectedDetail.city} />
                  <DetailItem label="Mobile" value={selectedDetail.mobile} />
                  <DetailItem label="Phone" value={selectedDetail.phone} />
                  <DetailItem label="Email" value={selectedDetail.email} />
                  <DetailItem label="Patient PAN" value={selectedDetail.panCard} />
                  <DetailItem label="Patient Aadhar" value={selectedDetail.aadhar} />
                  <DetailItem label="Satellite" value={lookupName(satellites, selectedDetail.satId)} />
                  <DetailItem label="Doctor" value={lookupName(doctors, selectedDetail.docId)} />
                  <DetailItem label="Diagnosis" value={lookupName(diagnosis, selectedDetail.diagId)} />
                  <DetailItem label="Ref By" value={lookupName(refBy, selectedDetail.refId)} />
                  <DetailItem label={partnerNameLabel} value={selectedDetail.husbandName} />
                  <DetailItem label={partnerAgeLabel} value={String(selectedDetail.husbandAge ?? '—')} />
                  <DetailItem label={partnerDobLabel} value={formatDate(selectedDetail.husbandDob)} />
                  {selectedDetail.maritalStatus !== 'Unmarried' && (
                    <>
                      <DetailItem label="Husband PAN" value={selectedDetail.husbandPan} />
                      <DetailItem label="Husband Aadhar" value={selectedDetail.husbandAadhar} />
                      <DetailItem label="Husband Email" value={selectedDetail.husbandEmail} />
                    </>
                  )}
                </div>
                <div className="mt-6 flex gap-2">
                  <button type="button" className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white" onClick={() => { patchForm(selectedDetail); setShowDetailModal(false); setSuccess('Patient loaded into form for editing.'); }}>
                    Load to Form
                  </button>
                  <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm" onClick={() => setShowDetailModal(false)}>Close</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly, title }: { label: string; value: string; onChange: (v: string) => void; type?: string; readOnly?: boolean; title?: string }) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <input type={type} value={value} readOnly={readOnly} title={title} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm read-only:bg-slate-100" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: number; options: LookupItem[]; onChange: (v: number) => void }) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm">
        <option value={0}>Select…</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}

function DetailItem({ label, value, className = '' }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-xs text-slate-500">{label}</div>
      <strong className="text-sm text-slate-800">{value || '—'}</strong>
    </div>
  );
}

function formatLoadError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'Master API not found. Restart the Node API: cd ivf-api && npm run dev';
    if (err.status === 503) return err.message;
    if (err.status === 401) return 'Session expired. Please log in again.';
    return err.message;
  }
  return err instanceof Error ? err.message : 'Failed to load patient master.';
}
