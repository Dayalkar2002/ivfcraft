import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LookupItem } from './master.service';

export interface CycleHistoryFindings {
  idiopathic: boolean;
  if: boolean;
  mf: boolean;
  dor: boolean;
  ovu: boolean;
  tf: boolean;
  cf: boolean;
  endo: boolean;
  other: boolean;
}

export interface CycleHistoryAttempt {
  cycHaId: number;
  cycleDate: string;
  ivf: boolean;
  icsi: boolean;
  stimProtId: number;
  lmp: string;
  stimDetails: string;
  he2: number;
  prgs: number;
  lh: number;
  hcg: string;
  ovum: string;
  oocytes: number;
  fertilized: number;
  remark: string;
}

export interface CycleHistory {
  cycHId: number;
  height: number;
  weight: number;
  bmi: number;
  allergyId: number;
  medSurHistory: string;
  isg: number;
  isp: number;
  isAb: number;
  isEct: number;
  isDuration: number;
  findings: CycleHistoryFindings;
  endoOpt: number;
  otherTxt: string;
  indication: string;
  hispanic: { asian: boolean; black: boolean; white: boolean; other: boolean };
  hlmp: string;
  nonHispanic: { asian: boolean; black: boolean; white: boolean; unknown: boolean };
  hsg: string;
  stimProtId: number;
  attemptCount: number;
  attemptPrev: number;
  attemptEw: number;
  currentDate: string;
  comments: string;
  historyAttempts: CycleHistoryAttempt[];
}

export interface CycleSurvival {
  cycSId: number;
  conc: number;
  motility: number;
  nmph1: number;
  nmph2: number;
  date: string;
  recovery: string;
  antibodies: string;
  saResult: { positive: boolean; borderline: boolean; negative: boolean };
  gnrh: { none: boolean; stopLupron: boolean; luteal: boolean };
  dosage: boolean;
  spermSource: { donor: boolean; donorCryo: boolean; husband: boolean; husbandCryo: boolean };
  transferType: { ivf: boolean; gift: boolean; zift: boolean; cryoAll: boolean };
  consent: { icsi: boolean; hatching: boolean; cryo: boolean; immatures: boolean; apa: boolean };
  comments: string;
}

export interface MonitoringDay0 {
  cycMccdId: number;
  date: string;
  fshDrug1: number;
  fshDrug1Dose: number;
  fshDrug2: number;
  fshDrug2Dose: number;
  hmgDrug1: number;
  hmgDrug1Dose: number;
  hmgDrug2: number;
  hmgDrug2Dose: number;
  cloDrug1: number;
  cloDrug1Dose: number;
  antaDrug1: number;
  antaDrug1Dose: number;
  othDrug1: number;
  othDrug1Dose: number;
  gnrha: number;
  e2: number;
  lh: number;
  fsh: number;
  tsh: number;
  prol: number;
  prog: number;
  remarks: string;
  ultrasound: string;
  endometrium: string;
}

export interface MonitoringRemDay {
  cycMcrdId: number;
  day: number;
  date: string;
  fshDrug1: number;
  fshDrug2: number;
  hmgDrug1: number;
  hmgDrug2: number;
  cloDrug1: number;
  antaDrug1: number;
  othDrug1: number;
  hcg: boolean;
  hcgDose: number;
  hcgDate: string;
  hcgTime: string;
  ovum: boolean;
  ovumDate: string;
  ovumTime: string;
  gnrha: number;
  e2: number;
  lh: number;
  fsh: number;
  tsh: number;
  prol: number;
  prog: number;
  follicleLeft: number;
  follicleRight: number;
  endometrium: string;
  remarks: string;
  ultrasound: string;
  terminate?: boolean;
  reason?: string;
}

export interface CycleMonitoring {
  day0: MonitoringDay0;
  remDays: MonitoringRemDay[];
}

export interface CycleOutcome {
  cycOId: number;
  outcomeDate: string;
  bhcgDate: string;
  value: number;
  noSacs: number;
  ptDay: number;
  outcome: number;
  pregOpt: number;
  pregDelOpt: number;
  postTreatment: string;
  advice: string;
  treatment: string;
  cycleType?: string;
}

export interface TabMasters {
  allergies: LookupItem[];
  stimProtocols: LookupItem[];
  fshDrugs: LookupItem[];
  hmgDrugs: LookupItem[];
  cloDrugs: LookupItem[];
  antaDrugs: LookupItem[];
  otherDrugs: LookupItem[];
  catheters: LookupItem[];
}

@Injectable({ providedIn: 'root' })
export class CycleDetailService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  loadHistory(token: string, cycleId: string): Observable<{ success: boolean; data: { data: CycleHistory; masters: TabMasters } }> {
    return this.http.get<{ success: boolean; data: { data: CycleHistory; masters: TabMasters } }>(
      `${this.baseUrl}/cycles/${cycleId}/history`,
      { headers: this.authHeaders(token) }
    );
  }

  saveHistory(token: string, cycleId: string, payload: CycleHistory): Observable<{ success: boolean; data: CycleHistory; message: string }> {
    return this.http.post<{ success: boolean; data: CycleHistory; message: string }>(
      `${this.baseUrl}/cycles/${cycleId}/history`,
      payload,
      { headers: this.authHeaders(token) }
    );
  }

  loadSurvival(token: string, cycleId: string): Observable<{ success: boolean; data: { data: CycleSurvival } }> {
    return this.http.get<{ success: boolean; data: { data: CycleSurvival } }>(
      `${this.baseUrl}/cycles/${cycleId}/survival`,
      { headers: this.authHeaders(token) }
    );
  }

  saveSurvival(token: string, cycleId: string, payload: CycleSurvival): Observable<{ success: boolean; data: CycleSurvival; message: string }> {
    return this.http.post<{ success: boolean; data: CycleSurvival; message: string }>(
      `${this.baseUrl}/cycles/${cycleId}/survival`,
      payload,
      { headers: this.authHeaders(token) }
    );
  }

  loadMonitoring(token: string, cycleId: string): Observable<{ success: boolean; data: { data: CycleMonitoring; masters: TabMasters } }> {
    return this.http.get<{ success: boolean; data: { data: CycleMonitoring; masters: TabMasters } }>(
      `${this.baseUrl}/cycles/${cycleId}/monitoring`,
      { headers: this.authHeaders(token) }
    );
  }

  saveMonitoring(token: string, cycleId: string, payload: CycleMonitoring): Observable<{ success: boolean; data: CycleMonitoring; message: string }> {
    return this.http.post<{ success: boolean; data: CycleMonitoring; message: string }>(
      `${this.baseUrl}/cycles/${cycleId}/monitoring`,
      payload,
      { headers: this.authHeaders(token) }
    );
  }

  loadOutcome(token: string, cycleId: string): Observable<{ success: boolean; data: { data: CycleOutcome } }> {
    return this.http.get<{ success: boolean; data: { data: CycleOutcome } }>(
      `${this.baseUrl}/cycles/${cycleId}/outcome`,
      { headers: this.authHeaders(token) }
    );
  }

  saveOutcome(token: string, cycleId: string, payload: CycleOutcome): Observable<{ success: boolean; data: CycleOutcome; message: string }> {
    return this.http.post<{ success: boolean; data: CycleOutcome; message: string }>(
      `${this.baseUrl}/cycles/${cycleId}/outcome`,
      payload,
      { headers: this.authHeaders(token) }
    );
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
