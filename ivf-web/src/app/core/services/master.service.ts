import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MasterRegistryItem {
  label: string;
  type: string;
  catId?: number;
  column: number;
  route: string;
}

export interface LookupItem {
  id: number;
  name: string;
}

export interface CommonMasterRow {
  id: number;
  name: string;
}

export interface PatientMasterRow {
  id: number;
  refNo: string;
  name: string;
  category: string;
  husbandName: string;
  address: string;
  dateOfCreation: string | null;
}

export interface PatientMasterDetail {
  id?: number;
  patId?: number;
  refNo: string;
  dateOfCreation: string | null;
  name: string;
  category: string;
  age: number;
  dob: string | null;
  address: string;
  city: string;
  phone: string;
  mobile: string;
  email: string;
  docId: number;
  diagId: number;
  husbandName: string;
  husbandAge: number;
  husbandDob: string | null;
  satId: number;
  refId: number;
  panCard: string;
  aadhar: string;
  husbandAadhar: string;
  husbandPan: string;
  husbandEmail: string;
  photo: string;
  husbandPhone?: string;
  maritalStatus?: string;
}

export interface DoctorMasterRow {
  id: number;
  name: string;
  city: string;
  phone: string;
  mobile: string;
  email: string;
}

export interface DoctorMasterDetail extends DoctorMasterRow {
  address1: string;
  address2: string;
  address3: string;
  pager: string;
  degree: string;
  speciality: string;
  startTime: string | null;
  endTime: string | null;
  docId?: number;
}

export interface SatelliteMasterRow {
  id: number;
  name: string;
  shortName: string;
  city: string;
  phone: string;
}

export interface SatelliteMasterDetail extends SatelliteMasterRow {
  address1: string;
  address2: string;
  drOne: string;
  drOneDeg: string;
  drTwo: string;
  drTwoDeg: string;
  mobile: string;
  fax: string;
  email: string;
  satId?: number;
}

export interface UserMasterRow {
  id: number;
  name: string;
  loginName: string;
  roleId: number;
}

@Injectable({ providedIn: 'root' })
export class MasterService {
  private readonly baseUrl = `${environment.apiUrl}/masters`;

  constructor(private http: HttpClient) {}

  getRegistry(token: string): Observable<{ success: boolean; data: MasterRegistryItem[] }> {
    return this.http.get<{ success: boolean; data: MasterRegistryItem[] }>(`${this.baseUrl}/registry`, {
      headers: this.authHeaders(token),
    });
  }

  listCommonMaster(token: string, catId: number): Observable<{ success: boolean; meta: MasterRegistryItem; data: CommonMasterRow[] }> {
    return this.http.get<{ success: boolean; meta: MasterRegistryItem; data: CommonMasterRow[] }>(
      `${this.baseUrl}/common/${catId}`,
      { headers: this.authHeaders(token) }
    );
  }

  saveCommonMaster(
    token: string,
    catId: number,
    payload: { id?: number; name: string; action: 'insert' | 'update' | 'delete' }
  ): Observable<{ success: boolean; message: string; data: CommonMasterRow[] }> {
    return this.http.post<{ success: boolean; message: string; data: CommonMasterRow[] }>(
      `${this.baseUrl}/common/${catId}`,
      payload,
      { headers: this.authHeaders(token) }
    );
  }

  getPatientLookups(token: string): Observable<{
    success: boolean;
    data: { satellites: LookupItem[]; doctors: LookupItem[]; diagnosis: LookupItem[]; refBy: LookupItem[] };
  }> {
    return this.http.get<{
      success: boolean;
      data: { satellites: LookupItem[]; doctors: LookupItem[]; diagnosis: LookupItem[]; refBy: LookupItem[] };
    }>(`${this.baseUrl}/patient/lookups`, { headers: this.authHeaders(token) });
  }

  listPatients(token: string, satelliteId?: number): Observable<{ success: boolean; data: PatientMasterRow[] }> {
    const params: Record<string, string> = {};
    if (satelliteId) params['satelliteId'] = String(satelliteId);
    return this.http.get<{ success: boolean; data: PatientMasterRow[] }>(`${this.baseUrl}/patient`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  getPatient(token: string, id: number): Observable<{ success: boolean; data: PatientMasterDetail }> {
    return this.http.get<{ success: boolean; data: PatientMasterDetail }>(`${this.baseUrl}/patient/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  savePatient(token: string, payload: PatientMasterDetail): Observable<{ success: boolean; message: string; data: PatientMasterRow[] }> {
    return this.http.post<{ success: boolean; message: string; data: PatientMasterRow[] }>(
      `${this.baseUrl}/patient`,
      { ...payload, patId: payload.patId ?? payload.id },
      { headers: this.authHeaders(token) }
    );
  }

  deletePatient(token: string, id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/patient/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  listDoctors(token: string): Observable<{ success: boolean; data: DoctorMasterRow[] }> {
    return this.http.get<{ success: boolean; data: DoctorMasterRow[] }>(`${this.baseUrl}/doctor`, {
      headers: this.authHeaders(token),
    });
  }

  getDoctor(token: string, id: number): Observable<{ success: boolean; data: DoctorMasterDetail }> {
    return this.http.get<{ success: boolean; data: DoctorMasterDetail }>(`${this.baseUrl}/doctor/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  saveDoctor(token: string, payload: DoctorMasterDetail): Observable<{ success: boolean; message: string; data: DoctorMasterRow[] }> {
    return this.http.post<{ success: boolean; message: string; data: DoctorMasterRow[] }>(
      `${this.baseUrl}/doctor`,
      { ...payload, docId: payload.docId ?? payload.id },
      { headers: this.authHeaders(token) }
    );
  }

  listSatellites(token: string): Observable<{ success: boolean; data: SatelliteMasterRow[] }> {
    return this.http.get<{ success: boolean; data: SatelliteMasterRow[] }>(`${this.baseUrl}/satellite`, {
      headers: this.authHeaders(token),
    });
  }

  getSatellite(token: string, id: number): Observable<{ success: boolean; data: SatelliteMasterDetail }> {
    return this.http.get<{ success: boolean; data: SatelliteMasterDetail }>(`${this.baseUrl}/satellite/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  saveSatellite(
    token: string,
    payload: SatelliteMasterDetail
  ): Observable<{ success: boolean; message: string; data: SatelliteMasterRow[] }> {
    return this.http.post<{ success: boolean; message: string; data: SatelliteMasterRow[] }>(
      `${this.baseUrl}/satellite`,
      { ...payload, satId: payload.satId ?? payload.id },
      { headers: this.authHeaders(token) }
    );
  }

  listUsers(token: string): Observable<{ success: boolean; data: UserMasterRow[] }> {
    return this.http.get<{ success: boolean; data: UserMasterRow[] }>(`${this.baseUrl}/user`, {
      headers: this.authHeaders(token),
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
