import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LookupItem } from './master.service';

export interface IcsiCycleDate {
  cycId: string;
  cycleDate: string;
  label: string;
}

export interface IcsiLookups {
  doctors: LookupItem[];
  labOptions: LookupItem[];
  mediaBrand: LookupItem[];
  mediaSeries: LookupItem[];
  incubator: LookupItem[];
  gas: LookupItem[];
}

export interface IcsiRecord {
  ICSIID?: string;
  ICSISGnRN?: boolean;
  ICSISLuteal?: boolean;
  ICSISStopL?: boolean;
  ICSISNone?: boolean;
  MCCDFSHDrug1?: number;
  MCCDFSHDrug2?: number;
  MCCDHMGDrug1?: number;
  MCCDHMGDrgu2?: number;
  ICSISOther?: boolean;
  ICSISOtherVal?: number;
  ICSISNaturalCycle?: boolean;
  ICSISE2Pattern1?: number;
  ICSISE2Pattern2?: number;
  ICSISE2Pattern3?: number;
  ICSISE2Pattern4?: number;
  ICSISNODStimulation?: number;
  ICSISIntervalToHCG?: number;
  ICSISIntervalFromHCGHrs?: number;
  ICSISIntervalFromHCGMin?: number;
  ICSIPRetPerID?: number;
  ICSIPTransPerID?: number;
  LabOptID?: number;
  MediaBrand?: number;
  MediaSeries?: number;
  IncubatorUsed?: number;
  Gas?: number;
  ICSISType1?: number;
  ICSISType2?: number;
  ICSISType3?: number;
  ICSISType4?: number;
  ICSIOIMetaII?: number;
  ICSIOIMetaI?: number;
  ICSIOIGV?: number;
  ICSIOIDEG?: number;
  ICSIPMetaIDEG?: number;
  ICSIFMetaII0pb?: number;
  ICSIFMetaII0PN?: number;
  ICSIFMetaII1PN?: number;
  ICSIFMetaII2PN?: number;
  ICSIFMetaII3PN?: number;
  ICSIFMetaIIStuck?: number;
  ICSIFMetaIICont?: boolean;
  ICSIFMetaIICleaved?: number;
  ICSIPMetaIIDEG?: number;
  ICSIFMetaI0pb?: number;
  ICSIFMetaI0PN?: number;
  ICSIFMetaI1PN?: number;
  ICSIFMetaI2PN?: number;
  ICSIFMetaI3PN?: number;
  ICSIFMetaIStuck?: number;
  ICSIFMetaICont?: boolean;
  ICSIFMetaICleaved?: number;
  ICSIPGVDEG?: number;
  ICSIFGV0pb?: number;
  ICSIFGV0PN?: number;
  ICSIFGV1PN?: number;
  ICSIFGV2PN?: number;
  ICSIFGV3PN?: number;
  ICSIFGVStuck?: number;
  ICSIFGVCont?: boolean;
  ICSIFGVCleaved?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class IcsiService {
  private readonly baseUrl = `${environment.apiUrl}/icsi`;

  constructor(private http: HttpClient) {}

  getLookups(token: string): Observable<{ success: boolean; data: IcsiLookups }> {
    return this.http.get<{ success: boolean; data: IcsiLookups }>(`${this.baseUrl}/lookups`, {
      headers: this.authHeaders(token),
    });
  }

  getCycleDates(token: string, patId: number, satId: number): Observable<{ success: boolean; data: IcsiCycleDate[] }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId);
    return this.http.get<{ success: boolean; data: IcsiCycleDate[] }>(`${this.baseUrl}/cycle-dates`, {
      headers: this.authHeaders(token),
      params,
    });
  }

  getMonitoring(
    token: string,
    patId: number,
    satId: number,
    cycId: string,
    cycleDate: string
  ): Observable<{ success: boolean; data: Record<string, unknown> | null }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('cycId', cycId).set('cycleDate', cycleDate);
    return this.http.get<{ success: boolean; data: Record<string, unknown> | null }>(`${this.baseUrl}/monitoring`, {
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
  ): Observable<{ success: boolean; data: IcsiRecord | null; exists: boolean }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('cycId', cycId).set('cycleDate', cycleDate);
    return this.http.get<{ success: boolean; data: IcsiRecord | null; exists: boolean }>(`${this.baseUrl}/load`, {
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
