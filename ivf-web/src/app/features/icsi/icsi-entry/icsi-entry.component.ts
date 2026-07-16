import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';
import { LookupItem } from '../../../core/services/master.service';
import { IcsiCycleDate, IcsiRecord, IcsiService } from '../../../core/services/icsi.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

@Component({
  selector: 'app-icsi-entry',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './icsi-entry.component.html',
  styleUrl: './icsi-entry.component.scss',
})
export class IcsiEntryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private icsiService = inject(IcsiService);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    cycId: [''],
    cycleDate: [''],
    icsiId: [''],
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
    fMetaII0pb: [0], fMetaII0PN: [0], fMetaII1PN: [0], fMetaII2PN: [0], fMetaII3PN: [0], fMetaIIStuck: [0], fMetaIICont: [false], fMetaIICleaved: [0],
    fMetaI0pb: [0], fMetaI0PN: [0], fMetaI1PN: [0], fMetaI2PN: [0], fMetaI3PN: [0], fMetaIStuck: [0], fMetaICont: [false], fMetaICleaved: [0],
    fGV0pb: [0], fGV0PN: [0], fGV1PN: [0], fGV2PN: [0], fGV3PN: [0], fGVStuck: [0], fGVCont: [false], fGVCleaved: [0],
  });

  cycleDates: IcsiCycleDate[] = [];
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
        this.token = token;
        this.patId = patient.id;
        this.satId = patient.satelliteId;
        this.error = '';
        this.loading = true;

        forkJoin({
          cycleDates: this.icsiService.getCycleDates(token, patient.id, patient.satelliteId),
          lookups: this.icsiService
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
            this.error = err?.error?.message || 'Failed to load ICSI module.';
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
          if (!selected || !this.token) return of(null);
          return this.loadCycleData(selected);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((result) => {
        if (!result) return;
        this.applyCycleLoadResult(result);
      });
  }

  onCycleChange(event: Event): void {
    const cycId = (event.target as HTMLSelectElement).value;
    if (!cycId) {
      this.showForm = false;
      return;
    }
    this.form.controls.cycId.setValue(cycId, { emitEvent: true });
  }

  private findCycle(cycId: string): IcsiCycleDate | undefined {
    return this.cycleDates.find((item) => String(item.cycId) === String(cycId));
  }

  private loadCycleData(selected: IcsiCycleDate) {
    this.form.patchValue({ cycleDate: selected.cycleDate });
    this.loading = true;
    this.error = '';
    const cycleDate = this.formatCycleDate(selected.cycleDate);
    return forkJoin({
      monitoring: this.icsiService
        .getMonitoring(this.token, this.patId, this.satId, String(selected.cycId), cycleDate)
        .pipe(catchError(() => of({ success: true, data: null }))),
      record: this.icsiService
        .loadRecord(this.token, this.patId, this.satId, String(selected.cycId), cycleDate)
        .pipe(catchError(() => of({ success: true, data: null, exists: false }))),
    });
  }

  private applyCycleLoadResult(result: {
    monitoring: { data: Record<string, unknown> | null };
    record: { data: IcsiRecord | null; exists: boolean };
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
    this.showForm = true;
    this.updateBalance();
    this.loading = false;
  }

  private resetForNewCycle(): void {
    this.form.patchValue({
      icsiId: '',
      gnrhFollicular: true,
      gnrhLuteal: false,
      gnrhStopL: false,
      gnrhNone: false,
      otherCycle: true,
      naturalCycle: true,
    });
  }

  private formatCycleDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toISOString();
  }

  save(): void {
    if (!this.token || !this.form.value.cycId) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    const { cycId, cycleDate, icsiId, ...rest } = value;
    this.icsiService
      .save(this.token, {
        mode: this.isUpdate ? 'update' : 'insert',
        patId: this.patId,
        satId: this.satId,
        cycId,
        cycleDate,
        icsiId,
        ...rest,
      })
      .subscribe({
        next: (res) => {
          this.success = res.message;
          this.isUpdate = true;
          const saved = res.data as { icsiId?: string };
          if (saved?.icsiId) this.form.patchValue({ icsiId: saved.icsiId });
          this.saving = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save ICSI record.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.showForm = false;
    this.form.patchValue({ cycId: '', cycleDate: '', icsiId: '' });
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

  private applyRecord(data: IcsiRecord): void {
    this.form.patchValue({
      icsiId: String(data.ICSIID || ''),
      gnrhFollicular: this.asBool(data.ICSISGnRN),
      gnrhLuteal: this.asBool(data.ICSISLuteal),
      gnrhStopL: this.asBool(data.ICSISStopL),
      gnrhNone: this.asBool(data.ICSISNone),
      fshDrug1: Number(data.MCCDFSHDrug1 || 0),
      fshDrug2: Number(data.MCCDFSHDrug2 || 0),
      hmgDrug1: Number(data.MCCDHMGDrug1 || 0),
      hmgDrug2: Number(data.MCCDHMGDrgu2 || 0),
      otherCycle: this.asBool(data.ICSISOther),
      otherCycleVal: Number(data.ICSISOtherVal || 0),
      naturalCycle: this.asBool(data.ICSISNaturalCycle),
      e2Pattern1: Number(data.ICSISE2Pattern1 || 0),
      e2Pattern2: Number(data.ICSISE2Pattern2 || 0),
      e2Pattern3: Number(data.ICSISE2Pattern3 || 0),
      e2Pattern4: Number(data.ICSISE2Pattern4 || 0),
      daysStimulation: Number(data.ICSISNODStimulation || 0),
      intervalToHcg: Number(data.ICSISIntervalToHCG || 0),
      intervalFromHcgHrs: Number(data.ICSISIntervalFromHCGHrs || 0),
      intervalFromHcgMin: Number(data.ICSISIntervalFromHCGMin || 0),
      retPerId: Number(data.ICSIPRetPerID || 0),
      transPerId: Number(data.ICSIPTransPerID || 0),
      labOptId: Number(data.LabOptID || 0),
      mediaBrand: Number(data.MediaBrand || 0),
      mediaSeries: Number(data.MediaSeries || 0),
      incubatorUsed: Number(data.IncubatorUsed || 0),
      gas: Number(data.Gas || 0),
      semenType1: Number(data.ICSISType1 || 0),
      semenType2: Number(data.ICSISType2 || 0),
      semenType3: Number(data.ICSISType3 || 0),
      semenType4: Number(data.ICSISType4 || 0),
      oiMetaII: Number(data.ICSIOIMetaII || 0),
      oiMetaI: Number(data.ICSIOIMetaI || 0),
      oiGV: Number(data.ICSIOIGV || 0),
      oiDeg: Number(data.ICSIOIDEG || 0),
      fMetaII0pb: Number(data.ICSIFMetaII0pb || 0),
      fMetaII0PN: Number(data.ICSIFMetaII0PN || 0),
      fMetaII1PN: Number(data.ICSIFMetaII1PN || 0),
      fMetaII2PN: Number(data.ICSIFMetaII2PN || 0),
      fMetaII3PN: Number(data.ICSIFMetaII3PN || 0),
      fMetaIIStuck: Number(data.ICSIFMetaIIStuck || 0),
      fMetaIICont: this.asBool(data.ICSIFMetaIICont),
      fMetaIICleaved: Number(data.ICSIFMetaIICleaved || 0),
      fMetaI0pb: Number(data.ICSIFMetaI0pb || 0),
      fMetaI0PN: Number(data.ICSIFMetaI0PN || 0),
      fMetaI1PN: Number(data.ICSIFMetaI1PN || 0),
      fMetaI2PN: Number(data.ICSIFMetaI2PN || 0),
      fMetaI3PN: Number(data.ICSIFMetaI3PN || 0),
      fMetaIStuck: Number(data.ICSIFMetaIStuck || 0),
      fMetaICont: this.asBool(data.ICSIFMetaICont),
      fMetaICleaved: Number(data.ICSIFMetaICleaved || 0),
      fGV0pb: Number(data.ICSIFGV0pb || 0),
      fGV0PN: Number(data.ICSIFGV0PN || 0),
      fGV1PN: Number(data.ICSIFGV1PN || 0),
      fGV2PN: Number(data.ICSIFGV2PN || 0),
      fGV3PN: Number(data.ICSIFGV3PN || 0),
      fGVStuck: Number(data.ICSIFGVStuck || 0),
      fGVCont: this.asBool(data.ICSIFGVCont),
      fGVCleaved: Number(data.ICSIFGVCleaved || 0),
    });
  }

  private asBool(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'True';
  }
}
