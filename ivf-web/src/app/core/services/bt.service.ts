import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LookupItem } from './master.service';
import { ET_ACTION_OPTIONS, ET_CELLER_OPTIONS, ET_GRADE_OPTIONS, MEDIA_OPTIONS, PROTOCOL_OPTIONS, TransferCycleDate } from './et.service';

export interface BtBlastocystRow {
  btBdId?: number;
  source?: string;
  celler?: number;
  grade?: number;
  teGrade?: number;
  action?: number;
  remark?: string;
  donPatId?: number;
  location?: string;
  recipientBt?: number;
  recipientCycleBt?: string;
  inUse?: boolean;
  isNew?: boolean;
}

export interface BtRecord {
  transferNote?: Record<string, unknown>;
  blastocystRows?: BtBlastocystRow[];
  summary?: Record<string, unknown>;
}

export {
  ET_CELLER_OPTIONS as BT_CELLER_OPTIONS,
  ET_GRADE_OPTIONS as BT_GRADE_OPTIONS,
  ET_ACTION_OPTIONS as BT_ACTION_OPTIONS,
  MEDIA_OPTIONS as BT_MEDIA_OPTIONS,
  PROTOCOL_OPTIONS as BT_PROTOCOL_OPTIONS,
};
export type { TransferCycleDate } from './et.service';

@Injectable({ providedIn: 'root' })
export class BtService {
  private readonly baseUrl = `${environment.apiUrl}/bt`;

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
  ): Observable<{ success: boolean; data: BtRecord | null; exists: boolean }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('cycId', cycId).set('cycleDate', cycleDate);
    return this.http.get<{ success: boolean; data: BtRecord | null; exists: boolean }>(`${this.baseUrl}/load`, {
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
