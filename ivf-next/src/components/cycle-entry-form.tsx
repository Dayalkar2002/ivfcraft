'use client';

import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import {
  computeCycleType,
  showDonorOocyteDetails,
  showEmbryoRecipientDetails,
  showOocyteRecipientDetails,
  showSemenDonorDetails,
} from '@/lib/cycle-utils';
import { fetchCycleTypes, saveCycleEntry } from '@/lib/services/cycles';
import type { CycleEntry, SourceOption } from '@/lib/types/cycle';

const emptyForm = {
  oocyteSource: 'self_oocyte',
  semenSource: 'husband_fresh',
  cycleDate: new Date().toISOString().split('T')[0],
  donorId: '',
  donorName: '',
  oocyteCount: '',
  recipientCount: '',
  receivedFromDonorId: '',
  receivedDonorName: '',
  receivedOocyteCount: '',
  embryoDonorCoupleId: '',
  donorCoupleName: '',
  embryoBatchNo: '',
  oocyteDonorId: '',
  semenDonorId: '',
  donorSemenId: '',
  cryoStrawNo: '',
  freezingDate: '',
};

export function CycleEntryForm() {
  const router = useRouter();
  const { token } = useAuth();
  const { selectedPatient, selectedSatellite } = usePatient();

  const [form, setForm] = useState(emptyForm);
  const [oocyteSources, setOocyteSources] = useState<SourceOption[]>([]);
  const [semenSources, setSemenSources] = useState<SourceOption[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cycleType = computeCycleType(form.oocyteSource, form.semenSource);
  const today = new Date();

  useEffect(() => {
    if (!token) return;
    void fetchCycleTypes(token)
      .then((data) => {
        setOocyteSources(data.oocyteSources);
        setSemenSources(data.semenSources);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load cycle types.'));
  }, [token]);

  function updateField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(andNext = false) {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    if (!selectedSatellite) {
      alert('Please select a satellite clinic first.');
      return;
    }
    if (!token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const entry = {
        patientId: selectedPatient.id,
        satelliteId: selectedSatellite.id,
        oocyteSource: form.oocyteSource,
        semenSource: form.semenSource,
        cycleDate: form.cycleDate || undefined,
        donorOocyteDetails: showDonorOocyteDetails(form.oocyteSource)
          ? {
              donorId: form.donorId,
              donorName: form.donorName,
              oocyteCount: Number(form.oocyteCount) || 0,
              recipientCount: Number(form.recipientCount) || 0,
            }
          : null,
        oocyteRecipientDetails: showOocyteRecipientDetails(form.oocyteSource)
          ? {
              receivedFromDonorId: form.receivedFromDonorId,
              donorName: form.receivedDonorName,
              oocyteCount: Number(form.receivedOocyteCount) || 0,
            }
          : null,
        embryoRecipientDetails: showEmbryoRecipientDetails(form.oocyteSource)
          ? {
              embryoDonorCoupleId: form.embryoDonorCoupleId,
              donorCoupleName: form.donorCoupleName,
              embryoBatchNo: form.embryoBatchNo,
              oocyteDonorId: form.oocyteDonorId,
              semenDonorId: form.semenDonorId,
            }
          : null,
        semenDonorDetails: showSemenDonorDetails(form.semenSource)
          ? {
              donorSemenId: form.donorSemenId,
              cryoStrawNo: form.cryoStrawNo,
              freezingDate: form.freezingDate,
            }
          : null,
      };

      const saved = await saveCycleEntry(token, entry);
      setCurrentCycle(saved);
      setSuccess('Cycle entry saved successfully.');
      if (andNext && saved.cycleId) {
        router.push(`/cycle/retrieval/${saved.cycleId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cycle entry.');
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (currentCycle?.cycleId) {
      router.push(`/cycle/retrieval/${currentCycle.cycleId}`);
    } else {
      alert('Please save the cycle entry first.');
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-wide text-slate-800">CYCLE ENTRY MODULE</h1>
        <span className="text-sm text-slate-500">
          Date: {today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <span aria-hidden="true">💡</span>
        <span>
          Select the appropriate options below. Based on your selection, the next screen will open for
          further data entry.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SourcePanel
            title="OOCYTE SOURCE"
            icon="🥚"
            accent="border-l-emerald-500 bg-emerald-50/40"
            sources={oocyteSources}
            value={form.oocyteSource}
            onChange={(v) => updateField('oocyteSource', v)}
          />
          <SourcePanel
            title="SEMEN SOURCE"
            icon="🧪"
            accent="border-l-sky-500 bg-sky-50/40"
            sources={semenSources}
            value={form.semenSource}
            onChange={(v) => updateField('semenSource', v)}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <DetailSection
            title="DONOR OOCYTE DETAILS"
            disabled={!showDonorOocyteDetails(form.oocyteSource)}
            accent="border-amber-200 bg-amber-50/30"
          >
            <Field label="Donor ID" value={form.donorId} onChange={(v) => updateField('donorId', v)} disabled={!showDonorOocyteDetails(form.oocyteSource)} />
            <Field label="Donor Name" value={form.donorName} onChange={(v) => updateField('donorName', v)} disabled={!showDonorOocyteDetails(form.oocyteSource)} />
            <Field label="No. of Oocytes" type="number" value={form.oocyteCount} onChange={(v) => updateField('oocyteCount', v)} disabled={!showDonorOocyteDetails(form.oocyteSource)} />
            <Field label="No. of Recipients" type="number" value={form.recipientCount} onChange={(v) => updateField('recipientCount', v)} disabled={!showDonorOocyteDetails(form.oocyteSource)} />
          </DetailSection>

          <DetailSection
            title="OOCYTE RECIPIENT DETAILS"
            disabled={!showOocyteRecipientDetails(form.oocyteSource)}
            accent="border-violet-200 bg-violet-50/30"
          >
            <Field label="Received From Donor ID" value={form.receivedFromDonorId} onChange={(v) => updateField('receivedFromDonorId', v)} disabled={!showOocyteRecipientDetails(form.oocyteSource)} />
            <Field label="Donor Name" value={form.receivedDonorName} onChange={(v) => updateField('receivedDonorName', v)} disabled={!showOocyteRecipientDetails(form.oocyteSource)} />
            <Field label="No. of Oocytes" type="number" value={form.receivedOocyteCount} onChange={(v) => updateField('receivedOocyteCount', v)} disabled={!showOocyteRecipientDetails(form.oocyteSource)} />
          </DetailSection>

          <DetailSection
            title="EMBRYO RECIPIENT DETAILS"
            disabled={!showEmbryoRecipientDetails(form.oocyteSource)}
            accent="border-pink-200 bg-pink-50/30"
          >
            <Field label="Embryo Donor Couple ID" value={form.embryoDonorCoupleId} onChange={(v) => updateField('embryoDonorCoupleId', v)} disabled={!showEmbryoRecipientDetails(form.oocyteSource)} />
            <Field label="Donor Couple Name" value={form.donorCoupleName} onChange={(v) => updateField('donorCoupleName', v)} disabled={!showEmbryoRecipientDetails(form.oocyteSource)} />
            <Field label="Embryo Batch No." value={form.embryoBatchNo} onChange={(v) => updateField('embryoBatchNo', v)} disabled={!showEmbryoRecipientDetails(form.oocyteSource)} />
            <Field label="Oocyte Donor ID" value={form.oocyteDonorId} onChange={(v) => updateField('oocyteDonorId', v)} disabled={!showEmbryoRecipientDetails(form.oocyteSource)} />
            <Field label="Semen Donor ID" value={form.semenDonorId} onChange={(v) => updateField('semenDonorId', v)} disabled={!showEmbryoRecipientDetails(form.oocyteSource)} />
          </DetailSection>

          <DetailSection
            title="SEMEN DONOR / CRYO DETAILS"
            disabled={!showSemenDonorDetails(form.semenSource)}
            accent="border-cyan-200 bg-cyan-50/30"
          >
            <Field label="Donor Semen ID" value={form.donorSemenId} onChange={(v) => updateField('donorSemenId', v)} disabled={!showSemenDonorDetails(form.semenSource)} />
            <Field label="Cryo Straw No." value={form.cryoStrawNo} onChange={(v) => updateField('cryoStrawNo', v)} disabled={!showSemenDonorDetails(form.semenSource)} />
            <Field label="Freezing Date" type="date" value={form.freezingDate} onChange={(v) => updateField('freezingDate', v)} disabled={!showSemenDonorDetails(form.semenSource)} />
          </DetailSection>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <SummaryChip icon="🥚" label="Oocyte Source" value={form.oocyteSource} />
          <span className="text-xl text-slate-400">→</span>
          <SummaryChip icon="🧪" label="Semen Source" value={form.semenSource} />
          <div className="ml-auto min-w-[220px] rounded-lg bg-brand-light px-4 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cycle Type</div>
            <div className="text-sm font-bold text-brand-green">{cycleType}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">This will be used for reports, billing and statutory records.</p>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="flex flex-wrap gap-3">
          <ActionButton variant="save" disabled={saving} onClick={() => void save(true)}>
            {saving ? 'Saving…' : 'Save & Next'}
          </ActionButton>
          <ActionButton variant="next" onClick={next}>
            Next
          </ActionButton>
          <ActionButton variant="cancel" onClick={() => router.push('/dashboard')}>
            Cancel
          </ActionButton>
        </div>
      </form>
    </div>
  );
}

function SourcePanel({
  title,
  icon,
  accent,
  sources,
  value,
  onChange,
}: {
  title: string;
  icon: string;
  accent: string;
  sources: SourceOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className={`rounded-xl border border-slate-200 border-l-4 p-4 ${accent}`}>
      <h2 className="mb-3 text-sm font-extrabold tracking-wide text-slate-700">{title}</h2>
      <div className="space-y-2">
        {sources.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
              value === opt.id
                ? 'border-brand-primary bg-white shadow-sm'
                : 'border-transparent bg-white/70 hover:border-slate-200'
            }`}
          >
            <input
              type="radio"
              name={title}
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="mt-1"
            />
            <div className="flex gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <strong className="block text-sm text-slate-800">{opt.label}</strong>
                <small className="text-xs text-slate-500">{opt.description}</small>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

function DetailSection({
  title,
  disabled,
  accent,
  children,
}: {
  title: string;
  disabled: boolean;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border p-4 transition ${accent} ${disabled ? 'pointer-events-none opacity-45' : ''}`}
    >
      <h3 className="mb-3 text-xs font-extrabold tracking-wide text-slate-700">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {label}
      <input
        type={type}
        value={value}
        readOnly={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-sm read-only:bg-slate-100"
      />
    </label>
  );
}

function SummaryChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="text-[10px] uppercase text-slate-500">{label}</div>
        <strong className="text-sm text-slate-800">{value}</strong>
      </div>
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

function ActionButton({
  children,
  onClick,
  disabled,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant: 'save' | 'next' | 'cancel';
}) {
  const styles = {
    save: 'bg-brand-primary text-white hover:bg-brand-dark',
    next: 'border border-brand-primary text-brand-green hover:bg-brand-light',
    cancel: 'border border-slate-300 text-slate-600 hover:bg-slate-50',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
