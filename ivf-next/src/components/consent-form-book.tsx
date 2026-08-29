'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePatient } from '@/contexts/patient-context';
import {
  fetchConsentForms,
  fetchConsentPatientContext,
  fetchConsentPreset,
  fetchConsentPresets,
  type ConsentFormGroup,
  type ConsentPreset,
} from '@/lib/services/consent';

export function ConsentFormBook() {
  const { token } = useAuth();
  const { selectedPatient } = usePatient();
  const [presets, setPresets] = useState<ConsentPreset[]>([]);
  const [groups, setGroups] = useState<ConsentFormGroup[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [module, setModule] = useState('IVF');
  const [contextNote, setContextNote] = useState<string | null>(null);
  const [clinic, setClinic] = useState({ name: '', address: '', consultant1: '', consultant2: '' });
  const [cycles, setCycles] = useState<Array<{ id: string; date: string | null; type: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [p, f] = await Promise.all([fetchConsentPresets(token), fetchConsentForms(token)]);
        setPresets(p);
        setGroups(f);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Failed to load consent catalog.');
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedPatient?.id || !selectedPatient.satelliteId) {
      setContextNote(null);
      return;
    }
    (async () => {
      try {
        const ctx = await fetchConsentPatientContext(
          token,
          selectedPatient.id,
          selectedPatient.satelliteId
        );
        setClinic(ctx.clinic);
        setCycles(ctx.cycles);
        setContextNote(null);
      } catch (err) {
        setContextNote(err instanceof Error ? err.message : 'Could not load patient consent context.');
      }
    })();
  }, [token, selectedPatient?.id, selectedPatient?.satelliteId]);

  const selectedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );

  async function applyPreset(id: string) {
    setSelectedPreset(id);
    if (!token || !id) return;
    try {
      const preset = await fetchConsentPreset(token, id);
      const next: Record<string, boolean> = {};
      (preset.selected || []).forEach((formId) => {
        next[formId] = true;
      });
      setChecked(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to apply preset.');
    }
  }

  function toggleForm(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleGenerate() {
    if (!selectedPatient) {
      setMessage('Select a patient before generating the consent book.');
      return;
    }
    if (selectedCount === 0) {
      setMessage('Tick at least one consent form (or apply a case-category preset).');
      return;
    }
    setMessage(
      `Ready to generate ${selectedCount} form(s) for ${selectedPatient.name} (${module}). PDF merge uses the clinic Word/LibreOffice pipeline from the legacy ConsentForm module — wire document storage path on the API host to enable download.`
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Documents</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">Consent Form Book</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Case-category presets from legacy ConsentForm.aspx — ART / ICMR / PCPNDT packs auto-tick for the
              selected IVF path.
            </p>
          </div>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {['IVF', 'IUI', 'ICSI', 'ET', 'BT'].map((m) => (
              <option key={m} value={m}>
                Module: {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Patient details</h2>
          {!selectedPatient ? (
            <p className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
              Select a patient from the top bar to auto-fill consent fields.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Female / Wife', selectedPatient.name],
                ['Male / Husband', selectedPatient.partner || '—'],
                ['UHID', selectedPatient.uhid || '—'],
                ['Age', selectedPatient.age != null ? `${selectedPatient.age} Y` : '—'],
                ['Aadhar (Female)', selectedPatient.aadhar || '—'],
                ['Category', selectedPatient.category || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
          )}
          {contextNote && <p className="mt-3 text-xs text-amber-700">{contextNote}</p>}
          {clinic.name && (
            <div className="mt-4 rounded-2xl bg-brand-mist px-4 py-3 text-sm text-brand-ink">
              <div className="font-semibold">{clinic.name}</div>
              <div className="text-xs text-brand-dark/70">{clinic.address}</div>
              <div className="mt-2 text-xs">
                {clinic.consultant1}
                {clinic.consultant2 ? ` · ${clinic.consultant2}` : ''}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Case category preset</h2>
          <p className="mt-1 text-xs text-slate-500">Auto-ticks ART / ICMR / PCPNDT forms for the case type.</p>
          <select
            value={selectedPreset}
            onChange={(e) => applyPreset(e.target.value)}
            className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm"
          >
            <option value="">— Select case type —</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}. {p.title}
              </option>
            ))}
          </select>
          <div className="mt-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Recent cycles</div>
            {cycles.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">No cycles loaded.</div>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {cycles.map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs">
                    <span className="font-semibold">{c.id}</span>
                    <span className="ml-2 text-slate-500">{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-slate-900">Forms checklist</h2>
          <span className="rounded-full bg-brand-mist px-3 py-1 text-xs font-bold text-brand-dark">
            {selectedCount} selected
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">{group.label}</div>
              <div className="space-y-2">
                {group.forms.map((form) => (
                  <label
                    key={form.id}
                    className="flex cursor-pointer items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[form.id]}
                      onChange={() => toggleForm(form.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary"
                    />
                    <span>
                      <span className="font-semibold text-slate-800">{form.id}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{form.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-xl bg-gradient-to-r from-brand-dark to-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:opacity-95"
          >
            Generate Consent Book
          </button>
          <button
            type="button"
            onClick={() => {
              setChecked({});
              setSelectedPreset('');
              setMessage(null);
            }}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
