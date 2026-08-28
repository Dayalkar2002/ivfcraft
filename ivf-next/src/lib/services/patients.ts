import { apiFetch } from '@/lib/api';
import type { Patient, Satellite } from '@/lib/types/patient';

export async function fetchSatellites(token: string): Promise<Satellite[]> {
  const res = await apiFetch<{ success: boolean; data: Satellite[] }>(
    '/patients/satellites',
    {},
    token
  );
  return res.data;
}

export async function searchPatients(
  token: string,
  satelliteId: number,
  search = ''
): Promise<Patient[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (satelliteId) params.set('satelliteId', String(satelliteId));
  const qs = params.toString();
  const res = await apiFetch<{ success: boolean; data: Patient[] }>(
    `/patients${qs ? `?${qs}` : ''}`,
    {},
    token
  );
  return res.data;
}
