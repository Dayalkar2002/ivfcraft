import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LookupItem } from './master.service';

export interface IvfCycleDate {
  cycId: string;
  cycleDate: string;
  label: string;
}

export interface IvfLookups {
  doctors: LookupItem[];
  labOptions: LookupItem[];
  mediaBrand: LookupItem[];
  mediaSeries: LookupItem[];
  incubator: LookupItem[];
  gas: LookupItem[];
}

export interface IvfRecord {
  IVFID?: string;
  IVFSGnRN?: boolean;
  IVFSLuteal?: boolean;
  IVFSStopL?: boolean;
  IVFSNone?: boolean;
  MCCDFSHDrug1?: number;
  MCCDFSHDrug2?: number;
  MCCDHMGDrug1?: number;
  MCCDHMGDrgu2?: number;
  IVFSOther?: boolean;
  IVFSOtherVal?: number;
  IVFSNaturalCycle?: boolean;
  IVFSE2Pattern1?: number;
  IVFSE2Pattern2?: number;
  IVFSE2Pattern3?: number;
  IVFSE2Pattern4?: number;
  IVFSNODStimulation?: number;
  IVFSIntervalToHCG?: number;
  IVFSIntervalFromHCGHrs?: number;
  IVFSIntervalFromHCGMin?: number;
  IVFPInsemination?: number;
  IVFPConcStandard?: boolean;
  IVFPHigh?: boolean;
  IVFPICSI?: boolean;
  IVFPSpAssHatch?: boolean;
  IVFPSpEBiopsy?: boolean;
  IVFPSpCTrans?: boolean;
  IVFPRetPerID?: number;
  IVFPTransPerID?: number;
  LabOptID?: number;
  IVFMediaBrand?: number;
  IVFMediaSeries?: number;
  IVFIncubatorUsed?: number;
  IVFGas?: number;
  IVFSType1?: number;
  IVFSType2?: number;
  IVFSType3?: number;
  IVFSType4?: number;
  IVFOIMetaII?: number;
  IVFOIMetaI?: number;
  IVFOIGV?: number;
  IVFOIDEG?: number;
  IVFFMetaII0pb?: number;
  IVFFMetaII0PN?: number;
  IVFFMetaII1PN?: number;
  IVFFMetaII2PN?: number;
  IVFFMetaII3PN?: number;
  IVFFMetaIIStuck?: number;
  IVFFMetaIICont?: boolean;
  IVFFMetaIICleaved?: number;
  IVFRIMetaIIAllocated?: number;
  IVFRIMetaIIRescued?: number;
  IVFFMetaI0pb?: number;
  IVFFMetaI0PN?: number;
  IVFFMetaI1PN?: number;
  IVFFMetaI2PN?: number;
  IVFFMetaI3PN?: number;
  IVFFMetaIStuck?: number;
  IVFFMetaICont?: boolean;
  IVFFMetaICleaved?: number;
  IVFRIMetaIAllocated?: number;
  IVFRIMetaIRescued?: number;
  IVFFGV0pb?: number;
  IVFFGV0PN?: number;
  IVFFGV1PN?: number;
  IVFFGV2PN?: number;
  IVFFGV3PN?: number;
  IVFFGVStuck?: number;
  IVFFGVCont?: boolean;
  IVFFGVCleaved?: number;
  IVFRIGVAllocated?: number;
  IVFRIGVRescued?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class IvfService {
  private readonly baseUrl = `${environment.apiUrl}/ivf`;

  constructor(private http: HttpClient) {}

  getLookups(token: string): Observable<{ success: boolean; data: IvfLookups }> {
    return this.http.get<{ success: boolean; data: IvfLookups }>(`${this.baseUrl}/lookups`, {
      headers: this.authHeaders(token),
    });
  }

  getCycleDates(token: string, patId: number, satId: number): Observable<{ success: boolean; data: IvfCycleDate[] }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId);
    return this.http.get<{ success: boolean; data: IvfCycleDate[] }>(`${this.baseUrl}/cycle-dates`, {
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
  ): Observable<{ success: boolean; data: IvfRecord | null; exists: boolean }> {
    const params = new HttpParams().set('patId', patId).set('satId', satId).set('cycId', cycId).set('cycleDate', cycleDate);
    return this.http.get<{ success: boolean; data: IvfRecord | null; exists: boolean }>(`${this.baseUrl}/load`, {
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
