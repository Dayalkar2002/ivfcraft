import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';
import { LookupItem } from '../../../core/services/master.service';
import { IvfCycleDate, IvfRecord, IvfService } from '../../../core/services/ivf.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

@Component({
  selector: 'app-ivf-entry',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './ivf-entry.component.html',
  styleUrl: './ivf-entry.component.scss',
})
export class IvfEntryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private ivfService = inject(IvfService);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    cycId: [''],
    cycleDate: [''],
    ivfId: [''],
    gnrhFollicular: [true],
    gnrhLuteal: [false],
    gnrhStopL: [false],
    gnrhNone: [false],
    fshDrug1: [0],
    fshDrug2: [0],
    hmgDrug1: [0],
    hmgDrug2: [0],
    otherCycle: [true],
    otherCycleVal: [0],
    naturalCycle: [true],
    e2Pattern1: [0],
    e2Pattern2: [0],
    e2Pattern3: [0],
    e2Pattern4: [0],
    daysStimulation: [0],
    intervalToHcg: [0],
    intervalFromHcgHrs: [0],
    intervalFromHcgMin: [0],
    inseminationHours: [0],
    concStandard: [true],
    concHigh: [false],
    concIcsi: [false],
    spAssHatch: [true],
    spEmbryoBiopsy: [false],
    spImsi: [false],
    retPerId: [0],
    transPerId: [0],
    labOptId: [0],
    mediaBrand: [0],
    mediaSeries: [0],
    incubatorUsed: [0],
    gas: [0],
    semenType1: [0],
    semenType2: [0],
    semenType3: [0],
    semenType4: [0],
    oiMetaII: [0],
    oiMetaI: [0],
    oiGV: [0],
    oiDeg: [0],
    fMetaII0pb: [0], fMetaII0PN: [0], fMetaII1PN: [0], fMetaII2PN: [0], fMetaII3PN: [0], fMetaIIStuck: [0], fMetaIICont: [false], fMetaIICleaved: [0], riMetaIIAllocated: [0], riMetaIIRescued: [0],
    fMetaI0pb: [0], fMetaI0PN: [0], fMetaI1PN: [0], fMetaI2PN: [0], fMetaI3PN: [0], fMetaIStuck: [0], fMetaICont: [false], fMetaICleaved: [0], riMetaIAllocated: [0], riMetaIRescued: [0],
    fGV0pb: [0], fGV0PN: [0], fGV1PN: [0], fGV2PN: [0], fGV3PN: [0], fGVStuck: [0], fGVCont: [false], fGVCleaved: [0], riGVAllocated: [0], riGVRescued: [0],
  });

  cycleDates: IvfCycleDate[] = [];
  doctors: LookupItem[] = [];
  labOptions: LookupItem[] = [];
  mediaBrand: LookupItem[] = [];
  mediaSeries: LookupItem[] = [];
  incubator: LookupItem[] = [];
  gas: LookupItem[] = [];

  loading = false;
  saving = false;
  showForm = false;
  isUpdate = false;
  error = '';
  success = '';
  balanceText = '';
  token = '';
  patId = 0;
  satId = 0;
  patientAge = 0;
  private cycleWatchStarted = false;

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((token): token is string => !!token)),
      this.store.select(selectPatientWithSatellite),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([token, patient]) => {
        if (!patient) {
          this.error = 'Please select a patient to continue.';
          this.loading = false;
          return;
        }

        if (!patient.satelliteId) {
          this.error = 'Satellite clinic is required. Open Change Patient, pick a satellite, then select the patient again.';
          this.loading = false;
          return;
        }

        if (patient.age && patient.age > 50) {
          this.error = 'IVF is not allowed for patients with age greater than 50.';
          this.loading = false;
          this.showForm = false;
          this.patientAge = patient.age;
          return;
        }

        this.token = token;
        this.patId = patient.id;
        this.satId = patient.satelliteId;
        this.patientAge = patient.age ?? 0;
        this.error = '';
        this.loading = true;

        forkJoin({
          cycleDates: this.ivfService.getCycleDates(token, patient.id, patient.satelliteId),
          lookups: this.ivfService
            .getLookups(token)
            .pipe(catchError(() => of({ success: true, data: { doctors: [], labOptions: [], mediaBrand: [], mediaSeries: [], incubator: [], gas: [] } }))),
        }).subscribe({
          next: ({ cycleDates, lookups }) => {
            this.cycleDates = cycleDates.data || [];
            this.doctors = lookups.data?.doctors || [];
            this.labOptions = lookups.data?.labOptions || [];
            this.mediaBrand = lookups.data?.mediaBrand || [];
            this.mediaSeries = lookups.data?.mediaSeries || [];
            this.incubator = lookups.data?.incubator || [];
            this.gas = lookups.data?.gas || [];
            this.loading = false;
            if (!this.cycleWatchStarted) {
              this.cycleWatchStarted = true;
              this.watchCycleSelection();
            }
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load IVF module.';
            this.loading = false;
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private watchCycleSelection(): void {
    this.form.controls.cycId.valueChanges
      .pipe(
        filter((cycId): cycId is string => !!cycId),
        switchMap((cycId) => {
          const selected = this.findCycle(cycId);
          if (!selected || !this.token) {
            return of(null);
          }
          return this.loadCycleData(selected);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        if (!result) return;
        this.applyCycleLoadResult(result);
      });

    const current = this.form.controls.cycId.value;
    if (current) {
      const selected = this.findCycle(current);
      if (selected) {
        this.loadCycleData(selected).subscribe((result) => {
          if (result) this.applyCycleLoadResult(result);
        });
      }
    }
  }

  onCycleChange(event: Event): void {
    const cycId = (event.target as HTMLSelectElement).value;
    if (!cycId) {
      this.showForm = false;
      return;
    }
    this.form.controls.cycId.setValue(cycId, { emitEvent: true });
  }

  private findCycle(cycId: string): IvfCycleDate | undefined {
    return this.cycleDates.find((item) => String(item.cycId) === String(cycId));
  }

  private loadCycleData(selected: IvfCycleDate) {
    this.form.patchValue({ cycleDate: selected.cycleDate });
    this.loading = true;
    this.error = '';

    const cycleDate = this.formatCycleDate(selected.cycleDate);

    return forkJoin({
      monitoring: this.ivfService
        .getMonitoring(this.token, this.patId, this.satId, String(selected.cycId), cycleDate)
        .pipe(catchError(() => of({ success: true, data: null }))),
      record: this.ivfService
        .loadRecord(this.token, this.patId, this.satId, String(selected.cycId), cycleDate)
        .pipe(catchError(() => of({ success: true, data: null, exists: false }))),
    });
  }

  private applyCycleLoadResult(result: {
    monitoring: { data: Record<string, unknown> | null };
    record: { data: IvfRecord | null; exists: boolean };
  }): void {
    const chart = result.monitoring.data;
    if (chart) {
      this.form.patchValue({
        fshDrug1: Number(chart['MCCDFSHDrug1'] || 0),
        fshDrug2: Number(chart['MCCDFSHDrug2'] || 0),
        hmgDrug1: Number(chart['MCCDHMGDrug1'] || 0),
        hmgDrug2: Number(chart['MCCDHMGDrug2'] || 0),
      });
    }

    if (result.record.exists && result.record.data) {
      this.applyRecord(result.record.data);
      this.isUpdate = true;
    } else {
      this.resetForNewCycle();
      this.isUpdate = false;
    }

    // Match legacy IVF.aspx: tblMainIVF.Style["display"] = "block" after cycle select
    this.showForm = true;
    this.updateBalance();
    this.loading = false;
  }

  private resetForNewCycle(): void {
    this.form.patchValue({
      ivfId: '',
      gnrhFollicular: true,
      gnrhLuteal: false,
      gnrhStopL: false,
      gnrhNone: false,
      otherCycle: true,
      naturalCycle: true,
      concStandard: true,
      spAssHatch: true,
      concHigh: false,
      concIcsi: false,
      spEmbryoBiopsy: false,
      spImsi: false,
    });
  }

  private formatCycleDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toISOString();
  }

  save(): void {
    if (!this.token || !this.form.value.cycId) return;
    if (this.patientAge > 50) {
      this.error = 'IVF is not allowed for patients with age greater than 50.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    const value = this.form.getRawValue();
    const { cycId, cycleDate, ivfId, ...rest } = value;
    this.ivfService
      .save(this.token, {
        mode: this.isUpdate ? 'update' : 'insert',
        patId: this.patId,
        satId: this.satId,
        cycId,
        cycleDate,
        ivfId,
        ...rest,
      })
      .subscribe({
        next: (res) => {
          this.success = res.message;
          this.isUpdate = true;
          const saved = res.data as { ivfId?: string };
          if (saved?.ivfId) {
            this.form.patchValue({ ivfId: saved.ivfId });
          }
          this.saving = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save IVF record.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.showForm = false;
    this.form.patchValue({ cycId: '', cycleDate: '', ivfId: '' });
    this.isUpdate = false;
    this.success = '';
    this.error = '';
  }

  updateBalance(): void {
    const v = this.form.getRawValue();
    const metaII =
      Number(v.fMetaII0pb) + Number(v.fMetaII0PN) + Number(v.fMetaII1PN) + Number(v.fMetaII2PN) + Number(v.fMetaII3PN) - Number(v.oiMetaII);
    const metaI =
      Number(v.fMetaI0pb) + Number(v.fMetaI0PN) + Number(v.fMetaI1PN) + Number(v.fMetaI2PN) + Number(v.fMetaI3PN) - Number(v.oiMetaI);
    const gv = Number(v.fGV0pb) + Number(v.fGV0PN) + Number(v.fGV1PN) + Number(v.fGV2PN) + Number(v.fGV3PN) - Number(v.oiGV);
    this.balanceText = `Metaphase II: ${metaII} | Metaphase I: ${metaI} | GV: ${gv}`;
  }

  private applyRecord(data: IvfRecord): void {
    this.form.patchValue({
      ivfId: String(data.IVFID || ''),
      gnrhFollicular: this.asBool(data.IVFSGnRN),
      gnrhLuteal: this.asBool(data.IVFSLuteal),
      gnrhStopL: this.asBool(data.IVFSStopL),
      gnrhNone: this.asBool(data.IVFSNone),
      fshDrug1: Number(data.MCCDFSHDrug1 || 0),
      fshDrug2: Number(data.MCCDFSHDrug2 || 0),
      hmgDrug1: Number(data.MCCDHMGDrug1 || 0),
      hmgDrug2: Number(data.MCCDHMGDrgu2 || 0),
      otherCycle: this.asBool(data.IVFSOther),
      otherCycleVal: Number(data.IVFSOtherVal || 0),
      naturalCycle: this.asBool(data.IVFSNaturalCycle),
      e2Pattern1: Number(data.IVFSE2Pattern1 || 0),
      e2Pattern2: Number(data.IVFSE2Pattern2 || 0),
      e2Pattern3: Number(data.IVFSE2Pattern3 || 0),
      e2Pattern4: Number(data.IVFSE2Pattern4 || 0),
      daysStimulation: Number(data.IVFSNODStimulation || 0),
      intervalToHcg: Number(data.IVFSIntervalToHCG || 0),
      intervalFromHcgHrs: Number(data.IVFSIntervalFromHCGHrs || 0),
      intervalFromHcgMin: Number(data.IVFSIntervalFromHCGMin || 0),
      inseminationHours: Number(data.IVFPInsemination || 0),
      concStandard: this.asBool(data.IVFPConcStandard),
      concHigh: this.asBool(data.IVFPHigh),
      concIcsi: this.asBool(data.IVFPICSI),
      spAssHatch: this.asBool(data.IVFPSpAssHatch),
      spEmbryoBiopsy: this.asBool(data.IVFPSpEBiopsy),
      spImsi: this.asBool(data.IVFPSpCTrans),
      retPerId: Number(data.IVFPRetPerID || 0),
      transPerId: Number(data.IVFPTransPerID || 0),
      labOptId: Number(data.LabOptID || 0),
      mediaBrand: Number(data.IVFMediaBrand || 0),
      mediaSeries: Number(data.IVFMediaSeries || 0),
      incubatorUsed: Number(data.IVFIncubatorUsed || 0),
      gas: Number(data.IVFGas || 0),
      semenType1: Number(data.IVFSType1 || 0),
      semenType2: Number(data.IVFSType2 || 0),
      semenType3: Number(data.IVFSType3 || 0),
      semenType4: Number(data.IVFSType4 || 0),
      oiMetaII: Number(data.IVFOIMetaII || 0),
      oiMetaI: Number(data.IVFOIMetaI || 0),
      oiGV: Number(data.IVFOIGV || 0),
      oiDeg: Number(data.IVFOIDEG || 0),
      fMetaII0pb: Number(data.IVFFMetaII0pb || 0),
      fMetaII0PN: Number(data.IVFFMetaII0PN || 0),
      fMetaII1PN: Number(data.IVFFMetaII1PN || 0),
      fMetaII2PN: Number(data.IVFFMetaII2PN || 0),
      fMetaII3PN: Number(data.IVFFMetaII3PN || 0),
      fMetaIIStuck: Number(data.IVFFMetaIIStuck || 0),
      fMetaIICont: this.asBool(data.IVFFMetaIICont),
      fMetaIICleaved: Number(data.IVFFMetaIICleaved || 0),
      riMetaIIAllocated: Number(data.IVFRIMetaIIAllocated || 0),
      riMetaIIRescued: Number(data.IVFRIMetaIIRescued || 0),
      fMetaI0pb: Number(data.IVFFMetaI0pb || 0),
      fMetaI0PN: Number(data.IVFFMetaI0PN || 0),
      fMetaI1PN: Number(data.IVFFMetaI1PN || 0),
      fMetaI2PN: Number(data.IVFFMetaI2PN || 0),
      fMetaI3PN: Number(data.IVFFMetaI3PN || 0),
      fMetaIStuck: Number(data.IVFFMetaIStuck || 0),
      fMetaICont: this.asBool(data.IVFFMetaICont),
      fMetaICleaved: Number(data.IVFFMetaICleaved || 0),
      riMetaIAllocated: Number(data.IVFRIMetaIAllocated || 0),
      riMetaIRescued: Number(data.IVFRIMetaIRescued || 0),
      fGV0pb: Number(data.IVFFGV0pb || 0),
      fGV0PN: Number(data.IVFFGV0PN || 0),
      fGV1PN: Number(data.IVFFGV1PN || 0),
      fGV2PN: Number(data.IVFFGV2PN || 0),
      fGV3PN: Number(data.IVFFGV3PN || 0),
      fGVStuck: Number(data.IVFFGVStuck || 0),
      fGVCont: this.asBool(data.IVFFGVCont),
      fGVCleaved: Number(data.IVFFGVCleaved || 0),
      riGVAllocated: Number(data.IVFRIGVAllocated || 0),
      riGVRescued: Number(data.IVFRIGVRescued || 0),
    });
  }

  private asBool(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'True';
  }
}
