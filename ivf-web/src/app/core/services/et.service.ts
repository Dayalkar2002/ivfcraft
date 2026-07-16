import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LookupItem } from './master.service';

export interface TransferCycleDate {
  cycId: string;
  cycleDate: string;
  label: string;
}

export interface EtEmbryoRow {
  etEdId?: number;
  source?: string;
  celler?: number;
  grade?: number;
  action?: number;
  remark?: string;
  donPatId?: number;
  location?: string;
  recipientEt?: number;
  recipientCycleEt?: string;
  inUse?: boolean;
  isNew?: boolean;
}

export interface EtRecord {
  transferNote?: Record<string, unknown>;
  embryoRows?: EtEmbryoRow[];
  summary?: Record<string, unknown>;
}

export const ET_CELLER_OPTIONS = [
  { id: 0, name: 'Select' },
  { id: 1, name: '2 Celler' },
  { id: 2, name: '3 Celler' },
  { id: 3, name: '4 Celler' },
  { id: 4, name: '5 Celler' },
  { id: 5, name: '6 Celler' },
  { id: 6, name: '7 Celler' },
  { id: 7, name: '8 Celler' },
  { id: 8, name: '9 Celler' },
  { id: 9, name: '10 Celler' },
  { id: 10, name: 'Multi Celler' },
];

export const ET_GRADE_OPTIONS = [
  { id: 0, name: 'Select' },
  { id: 1, name: 'Grade I' },
  { id: 2, name: 'Grade II' },
  { id: 3, name: 'Grade III' },
  { id: 4, name: 'Grade IV' },
];

export const ET_ACTION_OPTIONS = [
  { id: 0, name: 'Select' },
  { id: 1, name: 'Transfer' },
  { id: 2, name: 'Freeze' },
  { id: 3, name: 'Stuck' },
  { id: 4, name: 'KeepForBlast' },
  { id: 5, name: 'Discard' },
  { id: 7, name: 'DonatedForResearch' },
];

export const MEDIA_OPTIONS = [
  { id: 1, name: 'Kitazato' },
  { id: 2, name: 'Origio' },
  { id: 3, name: 'Cook' },
];

export const PROTOCOL_OPTIONS = [
  { id: 1, name: 'Slow Freezing' },
  { id: 2, name: 'Rapid Freezing' },
  { id: 3, name: 'Vitrification' },
];

@Injectable({ providedIn: 'root' })
export class EtService {
  private readonly baseUrl = `${environment.apiUrl}/et`;

  constructor(private http: HttpClient) {}

  getLookups(token: string): Observable<{ success: boolean; data: { doctors: LookupItem[] } }> {
    return this.http.get<{ success: boolean; data: { doctors: LookupItem[] } }>(`${this.baseUrl}/lookups`, {
      headers: this.authHeaders(token),
    });
  }

  getCycleDates(token: string, patId: number, satId: number): Observable<{ success: boolean; data: TransferCycleDate[] }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId);
    return this.http.get<{ success: boolean; data: TransferCycleDate[] }>(`${this.baseUrl}/cycle-dates`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  loadRecord(
    token: string,
    patId: number,
    satId: number,
    cycId: string,
    cycleDate: string
  ): Observable<{ success: boolean; data: EtRecord | null; exists: boolean }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('cycId', cycId).set('cycleDate', cycleDate);
    return this.http.get<{ success: boolean; data: EtRecord | null; exists: boolean }>(`${this.baseUrl}/load`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  save(token: string, payload: Record<string, unknown>): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.post<{ success: boolean; message: string; data: unknown }>(this.baseUrl, payload, {
      headers: this.authHeaders(token),
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
