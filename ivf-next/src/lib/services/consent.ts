import { apiFetch } from '@/lib/api';
import type { Patient } from '@/lib/types/patient';

export interface ConsentPreset {
  id: string;
  title: string;
  art?: string;
  icmr?: string;
  pcpndt?: string;
  misc?: string;
  selected?: string[];
}

export interface ConsentFormGroup {
  id: string;
  label: string;
  forms: Array<{ id: string; label: string }>;
}

export interface ConsentPatientContext {
  patient: Patient & { mobile?: string; email?: string; address?: string; city?: string };
  cycles: Array<{ id: string; date: string | null; type: string }>;
  clinic: {
    name: string;
    address: string;
    consultant1: string;
    consultant2: string;
  };
}

export async function fetchConsentPresets(token: string): Promise<ConsentPreset[]> {
  const res = await apiFetch<{ success: boolean; data: ConsentPreset[] }>('/consent/presets', {}, token);
  return res.data;
}

export async function fetchConsentForms(token: string): Promise<ConsentFormGroup[]> {
  const res = await apiFetch<{ success: boolean; data: ConsentFormGroup[] }>('/consent/forms', {}, token);
  return res.data;
}

export async function fetchConsentPreset(token: string, id: string): Promise<ConsentPreset> {
  const res = await apiFetch<{ success: boolean; data: ConsentPreset }>(
    `/consent/presets/${id}`,
    {},
    token
  );
  return res.data;
}

export async function fetchConsentPatientContext(
  token: string,
  patId: number,
  satId: number
): Promise<ConsentPatientContext> {
  const res = await apiFetch<{ success: boolean; data: ConsentPatientContext }>(
    `/consent/patient-context?patId=${patId}&satId=${satId}`,
    {},
    token
  );
  return res.data;
}
