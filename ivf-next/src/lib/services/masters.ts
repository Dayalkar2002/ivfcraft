import { apiFetch } from '@/lib/api';
import type {
  CommonMasterRow,
  PatientLookups,
  PatientMasterDetail,
  PatientMasterRow,
  UserMasterRow,
} from '@/lib/types/master';

export async function fetchPatientLookups(token: string): Promise<PatientLookups> {
  const res = await apiFetch<{ success: boolean; data: PatientLookups }>(
    '/masters/patient/lookups',
    {},
    token
  );
  return res.data;
}

export async function listMasterPatients(token: string): Promise<PatientMasterRow[]> {
  const res = await apiFetch<{ success: boolean; data: PatientMasterRow[] }>(
    '/masters/patient',
    {},
    token
  );
  return res.data;
}

export async function getMasterPatient(token: string, id: number): Promise<PatientMasterDetail> {
  const res = await apiFetch<{ success: boolean; data: PatientMasterDetail }>(
    `/masters/patient/${id}`,
    {},
    token
  );
  return res.data;
}

export async function saveMasterPatient(
  token: string,
  payload: PatientMasterDetail
): Promise<{ message: string; data: PatientMasterRow[] }> {
  const res = await apiFetch<{ success: boolean; message: string; data: PatientMasterRow[] }>(
    '/masters/patient',
    {
      method: 'POST',
      body: JSON.stringify({ ...payload, patId: payload.patId ?? payload.id }),
    },
    token
  );
  return { message: res.message, data: res.data };
}

export async function deleteMasterPatient(token: string, id: number): Promise<void> {
  await apiFetch(`/masters/patient/${id}`, { method: 'DELETE' }, token);
}

export interface DoctorMasterRow {
  id: number;
  name: string;
  city: string;
  phone: string;
  mobile: string;
  email: string;
}

export interface DoctorMasterDetail {
  id?: number;
  docId?: number;
  name: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  phone: string;
  mobile: string;
  pager: string;
  email: string;
  degree: string;
  speciality: string;
}

export interface SatelliteMasterRow {
  id: number;
  name: string;
  shortName: string;
  city: string;
  phone: string;
}

export interface SatelliteMasterDetail {
  id?: number;
  satId?: number;
  name: string;
  shortName: string;
  address1: string;
  address2: string;
  city: string;
  drOne: string;
  drOneDeg: string;
  drTwo: string;
  drTwoDeg: string;
  phone: string;
  mobile: string;
  fax: string;
  email: string;
}

export async function listDoctors(token: string): Promise<DoctorMasterRow[]> {
  const res = await apiFetch<{ success: boolean; data: DoctorMasterRow[] }>('/masters/doctor', {}, token);
  return res.data;
}

export async function getDoctor(token: string, id: number): Promise<DoctorMasterDetail> {
  const res = await apiFetch<{ success: boolean; data: DoctorMasterDetail }>(`/masters/doctor/${id}`, {}, token);
  return res.data;
}

export async function saveDoctor(token: string, payload: DoctorMasterDetail) {
  const res = await apiFetch<{ success: boolean; message: string; data: DoctorMasterRow[] }>(
    '/masters/doctor',
    { method: 'POST', body: JSON.stringify({ ...payload, docId: payload.docId ?? payload.id }) },
    token
  );
  return res;
}

export async function listMasterSatellites(token: string): Promise<SatelliteMasterRow[]> {
  const res = await apiFetch<{ success: boolean; data: SatelliteMasterRow[] }>('/masters/satellite', {}, token);
  return res.data;
}

export async function getSatellite(token: string, id: number): Promise<SatelliteMasterDetail> {
  const res = await apiFetch<{ success: boolean; data: SatelliteMasterDetail }>(`/masters/satellite/${id}`, {}, token);
  return res.data;
}

export async function saveSatellite(token: string, payload: SatelliteMasterDetail) {
  const res = await apiFetch<{ success: boolean; message: string; data: SatelliteMasterRow[] }>(
    '/masters/satellite',
    { method: 'POST', body: JSON.stringify({ ...payload, satId: payload.satId ?? payload.id }) },
    token
  );
  return res;
}

export async function listCommonMaster(token: string, catId: number): Promise<CommonMasterRow[]> {
  const res = await apiFetch<{ success: boolean; data: CommonMasterRow[] }>(
    `/masters/common/${catId}`,
    {},
    token
  );
  return res.data;
}

export async function saveCommonMaster(
  token: string,
  catId: number,
  payload: { id?: number; name: string; action: 'insert' | 'update' | 'delete' }
): Promise<{ message: string; data: CommonMasterRow[] }> {
  const res = await apiFetch<{ success: boolean; message: string; data: CommonMasterRow[] }>(
    `/masters/common/${catId}`,
    { method: 'POST', body: JSON.stringify(payload) },
    token
  );
  return { message: res.message, data: res.data };
}

export async function listUsers(token: string): Promise<UserMasterRow[]> {
  const res = await apiFetch<{ success: boolean; data: UserMasterRow[] }>('/masters/user', {}, token);
  return res.data;
}
