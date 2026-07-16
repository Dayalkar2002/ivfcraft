import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IuiListRow {
  IUIID: string;
  Indication?: string;
  IUIODateOfCreation?: string;
  IUIIDOff?: string | number;
  IUIOPostTreat?: string;
  IUIOAdvice?: string;
  IUIOID?: number;
  IsLock?: boolean | number | string;
  [key: string]: unknown;
}

export interface IuiOutcomeDetail {
  IUIID?: string;
  IUIIDOff?: string;
  IUIODate?: string;
  IUIODateOfCreation?: string;
  IUIOValue?: number;
  IUIONoSac?: number;
  IUIOPostIUIDay?: number;
  IUIOOutcome?: number;
  IUIOPregOpt?: number;
  IUIOPregDelOpt?: number;
  IUIOPostTreat?: string;
  IUIOAdvice?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class IuiService {
  private readonly baseUrl = `${environment.apiUrl}/iui`;

  constructor(private http: HttpClient) {}

  list(token: string, patId: number, satId: number): Observable<{ success: boolean; data: IuiListRow[] }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId);
    return this.http.get<{ success: boolean; data: IuiListRow[] }>(this.baseUrl, {
      headers: this.authHeaders(token),
      params,
    });
  }

  loadOutcome(
    token: string,
    iuiId: string,
    iuiOId: number,
    patId: number,
    satId: number
  ): Observable<{ success: boolean; data: IuiOutcomeDetail }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('iuiOId', iuiOId);
    return this.http.get<{ success: boolean; data: IuiOutcomeDetail }>(`${this.baseUrl}/${encodeURIComponent(iuiId)}`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  save(token: string, payload: Record<string, unknown>): Observable<{ success: boolean; message: string; data: unknown }> {
    return this.http.post<{ success: boolean; message: string; data: unknown }>(this.baseUrl, payload, {
      headers: this.authHeaders(token),
    });
  }

  unlock(
    token: string,
    payload: { patId: number; cycleId: string; patName?: string }
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/unlock`, payload, {
      headers: this.authHeaders(token),
    });
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
