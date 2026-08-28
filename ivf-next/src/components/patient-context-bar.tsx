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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-primary/20 bg-brand-light/60 px-4 py-3">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-slate-500">Patient:</span>{' '}
            <strong className="text-slate-800">{patient.name}</strong>
          </div>
          <div>
            <span className="text-slate-500">UHID:</span>{' '}
            <strong className="text-slate-800">{patient.uhid || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Partner:</span>{' '}
            <strong className="text-slate-800">{patient.partner || '—'}</strong>
          </div>
          <div>
            <span className="text-slate-500">Age / Gender:</span>{' '}
            <strong className="text-slate-800">
              {patient.age ?? '—'} Y / {patient.gender || '—'}
            </strong>
          </div>
        </div>
        <button
          type="button"
          onClick={onSelectPatient}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-primary/30 bg-white px-3 py-1.5 text-sm font-semibold text-brand-green hover:bg-brand-light"
        >
          <UserPlusIcon />
          Change Patient
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>No patient selected. Please select a patient to continue.</span>
      <button
        type="button"
        onClick={onSelectPatient}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
      >
        <UserPlusIcon />
        Select Patient
      </button>
    </div>
  );
}

function UserPlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 20c0-3 2.7-5.5 6-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 11v6M13 14h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
