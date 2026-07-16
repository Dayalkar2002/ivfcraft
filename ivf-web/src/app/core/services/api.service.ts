import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CycleEntry,
  Patient,
  RetrievalData,
  Satellite,
  SourceOption,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ success: boolean; token: string; user: User }> {
    return this.http.post<{ success: boolean; token: string; user: User }>(`${this.baseUrl}/auth/login`, {
      username,
      password,
    });
  }

  getSatellites(token: string): Observable<{ success: boolean; data: Satellite[] }> {
    return this.http.get<{ success: boolean; data: Satellite[] }>(`${this.baseUrl}/patients/satellites`, {
      headers: this.authHeaders(token),
    });
  }

  searchPatients(token: string, search: string, satelliteId?: number): Observable<{ success: boolean; data: Patient[] }> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    if (satelliteId) params['satelliteId'] = String(satelliteId);
    return this.http.get<{ success: boolean; data: Patient[] }>(`${this.baseUrl}/patients`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  getPatient(token: string, id: number): Observable<{ success: boolean; data: Patient }> {
    return this.http.get<{ success: boolean; data: Patient }>(`${this.baseUrl}/patients/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  getCycleTypes(token: string): Observable<{ success: boolean; data: { oocyteSources: SourceOption[]; semenSources: SourceOption[] } }> {
    return this.http.get<{ success: boolean; data: { oocyteSources: SourceOption[]; semenSources: SourceOption[] } }>(
      `${this.baseUrl}/cycles/types`,
      { headers: this.authHeaders(token) }
    );
  }

  saveCycleEntry(token: string, entry: CycleEntry): Observable<{ success: boolean; data: CycleEntry; message: string }> {
    return this.http.post<{ success: boolean; data: CycleEntry; message: string }>(
      `${this.baseUrl}/cycles/entry`,
      entry,
      { headers: this.authHeaders(token) }
    );
  }

  getRetrievalConfig(token: string, cycleId: string): Observable<{ success: boolean; data: unknown }> {
    return this.http.get<{ success: boolean; data: unknown }>(`${this.baseUrl}/cycles/${cycleId}/retrieval-config`, {
      headers: this.authHeaders(token),
    });
  }

  saveRetrieval(token: string, cycleId: string, sections: RetrievalData): Observable<{ success: boolean; data: CycleEntry; message: string }> {
    return this.http.post<{ success: boolean; data: CycleEntry; message: string }>(
      `${this.baseUrl}/cycles/${cycleId}/retrieval`,
      { sections },
      { headers: this.authHeaders(token) }
    );
  }

  checkDonorAadhar(
    token: string,
    donorPatId: number,
    recipientPatId: number,
    excludeCycId?: string
  ): Observable<{
    success: boolean;
    data: {
      isAllowed: boolean;
      message: string;
      donorAadhar: string;
      recipientAadhar: string;
      mappedRecipientName: string;
    };
  }> {
    const params: Record<string, string> = {
      donorPatId: String(donorPatId),
      recipientPatId: String(recipientPatId),
    };
    if (excludeCycId) params['excludeCycId'] = excludeCycId;
    return this.http.get<{
      success: boolean;
      data: {
        isAllowed: boolean;
        message: string;
        donorAadhar: string;
        recipientAadhar: string;
        mappedRecipientName: string;
      };
    }>(`${this.baseUrl}/cycles/donor-aadhar-check`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
