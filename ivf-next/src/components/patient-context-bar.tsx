'use client';

interface PatientContextBarProps {
  onSelectPatient: () => void;
  patient?: {
    name: string;
    uhid?: string;
    partner?: string;
    age?: number | null;
    gender?: string;
  } | null;
}

export function PatientContextBar({ patient, onSelectPatient }: PatientContextBarProps) {
  if (patient) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-mist to-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
            {patient.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Patient</div>
            <strong className="text-slate-800">{patient.name}</strong>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">UHID</div>
            <strong className="text-slate-800">{patient.uhid || '—'}</strong>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Partner</div>
            <strong className="text-slate-800">{patient.partner || '—'}</strong>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Age / Gender</div>
            <strong className="text-slate-800">
              {patient.age ?? '—'} Y / {patient.gender || '—'}
            </strong>
          </div>
        </div>
        <button
          type="button"
          onClick={onSelectPatient}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-white px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-light"
        >
          Change Patient
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div>
        <div className="font-semibold">No patient selected</div>
        <div className="text-amber-800/80">Select a satellite clinic and patient to open clinical modules.</div>
      </div>
      <button
        type="button"
        onClick={onSelectPatient}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
      >
        Select Patient
      </button>
    </div>
  );
}
