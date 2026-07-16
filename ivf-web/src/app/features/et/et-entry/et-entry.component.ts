import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { LookupItem } from '../../../core/services/master.service';
import {
  ET_ACTION_OPTIONS,
  ET_CELLER_OPTIONS,
  ET_GRADE_OPTIONS,
  EtEmbryoRow,
  EtService,
  MEDIA_OPTIONS,
  PROTOCOL_OPTIONS,
  TransferCycleDate,
} from '../../../core/services/et.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

type EtTab = 'transfer' | 'embryos' | 'summary';

@Component({
  selector: 'app-et-entry',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './et-entry.component.html',
  styleUrl: './et-entry.component.scss',
})
export class EtEntryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private etService = inject(EtService);
  private destroy$ = new Subject<void>();

  cycleForm = this.fb.group({ cycId: [''], cycleDate: [''], etId: [''] });

  transferForm = this.fb.group({
    transferDate: [new Date().toISOString().split('T')[0]],
    diagnosis: [''],
    procedure: [''],
    embryologist: [''],
    surgeon: [''],
    anesthesia: [0],
    anesthesiaOther: [''],
    complication: [0],
    complicationNote: [''],
    fbe: [0],
    fav: [false],
    frv: [false],
    fax: [false],
    ftr: [0],
    fmtd: [0],
    fdr: [0],
    fug: [0],
    catheterCcd: [true],
    catheterLaboTech: [false],
    catheterSoftPass: [false],
    catheterCook: [false],
    difficultyNone: [false],
    difficultySome: [false],
    difficultyModerate: [false],
    difficultySignificant: [false],
    nextCatheter: [false],
    nextWallace: [false],
    nextMarrs: [false],
    nextDifficult: [false],
    nextDifficultyNone: [true],
    nextDifficultySome: [false],
    nextDifficultyModerate: [false],
    nextDifficultySignificant: [false],
    depthOfPlacement: [0],
    bloodOnCatheter: [0],
    embryoRemaining: [0],
    operTech: [''],
    comments: [''],
    protocolUsed: [1],
    mediaUsed: [1],
    procedureDoneBy: [''],
  });

  summaryForm = this.fb.group({
    etDate: [new Date().toISOString().split('T')[0]],
    transfer: [0],
    freeze: [0],
    blastocyst: [0],
    stuck: [0],
    discard: [0],
    donate: [0],
    donateResearch: [0],
    remark: [''],
  });

  cycleDates: TransferCycleDate[] = [];
  doctors: LookupItem[] = [];
  embryoRows: EtEmbryoRow[] = [];
  cellerOptions = ET_CELLER_OPTIONS;
  gradeOptions = ET_GRADE_OPTIONS;
  actionOptions = ET_ACTION_OPTIONS;
  mediaOptions = MEDIA_OPTIONS;
  protocolOptions = PROTOCOL_OPTIONS;

  activeTab: EtTab = 'transfer';
  loading = false;
  saving = false;
  showForm = false;
  isUpdate = false;
  error = '';
  success = '';
  token = '';
  patId = 0;
  satId = 0;

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((token): token is string => !!token)),
      this.store.select(selectPatientWithSatellite),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([token, patient]) => {
        if (!patient) {
          this.error = 'Please select a patient to continue.';
          return;
        }
        if (!patient.satelliteId) {
          this.error = 'Satellite clinic is required.';
          return;
        }
        this.token = token;
        this.patId = patient.id;
        this.satId = patient.satelliteId;
        this.error = '';
        this.loading = true;

        forkJoin({
          cycleDates: this.etService.getCycleDates(token, patient.id, patient.satelliteId),
          lookups: this.etService.getLookups(token).pipe(catchError(() => of({ success: true, data: { doctors: [] } }))),
        }).subscribe({
          next: ({ cycleDates, lookups }) => {
            this.cycleDates = cycleDates.data || [];
            this.doctors = lookups.data?.doctors || [];
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load ET module.';
            this.loading = false;
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: EtTab): void {
    this.activeTab = tab;
  }

  onCycleChange(event: Event): void {
    const cycId = (event.target as HTMLSelectElement).value;
    if (!cycId) {
      this.showForm = false;
      return;
    }
    const selected = this.cycleDates.find((c) => String(c.cycId) === cycId);
    if (!selected) return;

    this.cycleForm.patchValue({ cycId, cycleDate: selected.cycleDate });
    this.loading = true;
    this.error = '';
    const cycleDate = this.formatDate(selected.cycleDate);

    this.etService.loadRecord(this.token, this.patId, this.satId, cycId, cycleDate).subscribe({
      next: (res) => {
        if (res.exists && res.data) {
          this.applyRecord(res.data);
          this.isUpdate = true;
        } else {
          this.resetForNew();
          this.isUpdate = false;
        }
        this.showForm = true;
        this.activeTab = 'transfer';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load ET record.';
        this.loading = false;
      },
    });
  }

  addEmbryoRow(): void {
    this.embryoRows = [
      ...this.embryoRows,
      { source: 'IVF', celler: 0, grade: 0, action: 0, remark: '', location: '', isNew: true },
    ];
  }

  removeEmbryoRow(index: number): void {
    this.embryoRows = this.embryoRows.filter((_, i) => i !== index);
  }

  save(): void {
    if (!this.token || !this.cycleForm.value.cycId) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    const { cycId, cycleDate, etId } = this.cycleForm.getRawValue();
    this.etService
      .save(this.token, {
        mode: this.isUpdate ? 'update' : 'insert',
        patId: this.patId,
        satId: this.satId,
        cycId,
        cycleDate,
        etId,
        etDate: this.summaryForm.value.etDate,
        transferNote: this.transferForm.getRawValue(),
        protocolUsed: this.transferForm.value.protocolUsed,
        mediaUsed: this.transferForm.value.mediaUsed,
        procedureDoneBy: this.transferForm.value.procedureDoneBy,
        embryoRows: this.embryoRows,
        summary: this.summaryForm.getRawValue(),
      })
      .subscribe({
        next: (res) => {
          this.success = res.message;
          this.isUpdate = true;
          const saved = res.data as { etId?: string };
          if (saved?.etId) this.cycleForm.patchValue({ etId: saved.etId });
          this.saving = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save ET record.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.showForm = false;
    this.cycleForm.reset({ cycId: '', cycleDate: '', etId: '' });
    this.isUpdate = false;
    this.success = '';
    this.error = '';
  }

  private resetForNew(): void {
    this.cycleForm.patchValue({ etId: '' });
    this.embryoRows = [];
    this.transferForm.patchValue({
      transferDate: new Date().toISOString().split('T')[0],
      catheterCcd: true,
      nextDifficultyNone: true,
    });
    this.summaryForm.patchValue({ etDate: new Date().toISOString().split('T')[0] });
  }

  private applyRecord(data: { transferNote?: Record<string, unknown>; embryoRows?: EtEmbryoRow[]; summary?: Record<string, unknown> }): void {
    const tn = data.transferNote || {};
    this.cycleForm.patchValue({ etId: String(tn['ETID'] || '') });
    this.transferForm.patchValue({
      transferDate: this.toDateInput(tn['ETTNDate']),
      diagnosis: String(tn['ETTNDiagnosis'] || ''),
      procedure: String(tn['ETTNProc'] || ''),
      embryologist: String(tn['ETTNEmbryologist'] || ''),
      surgeon: String(tn['ETTNSurgeon'] || ''),
      anesthesia: Number(tn['ETTNAnesthesia'] || 0),
      anesthesiaOther: String(tn['ETTNAnesOther'] || ''),
      complication: Number(tn['ETTNComplication'] || 0),
      complicationNote: String(tn['ETTNCompNote'] || ''),
      fbe: Number(tn['ETTNFBE'] || 0),
      fav: this.asBool(tn['ETTNFAV']),
      frv: this.asBool(tn['ETTNFRV']),
      fax: this.asBool(tn['ETTNFAx']),
      ftr: Number(tn['ETTNFTR'] || 0),
      fmtd: Number(tn['ETTNFMTD'] || 0),
      fdr: Number(tn['ETTNFDR'] || 0),
      fug: Number(tn['ETTNFUG'] || 0),
      catheterCcd: this.asBool(tn['ETTNCCCD']),
      catheterLaboTech: this.asBool(tn['ETTNCLaboTech']),
      catheterSoftPass: this.asBool(tn['ETTNCSoftPass']),
      catheterCook: this.asBool(tn['ETTNCCook']),
      difficultyNone: this.asBool(tn['ETTNCDNone']),
      difficultySome: this.asBool(tn['ETTNCDSome']),
      difficultyModerate: this.asBool(tn['ETTNCDModerate']),
      difficultySignificant: this.asBool(tn['ETTNCDSignificant']),
      nextCatheter: this.asBool(tn['ETTNNCatheter']),
      nextWallace: this.asBool(tn['ETTNNWallace']),
      nextMarrs: this.asBool(tn['ETTNNMarrs']),
      nextDifficult: this.asBool(tn['ETTNNDifficult']),
      nextDifficultyNone: this.asBool(tn['ETTNNDNone']),
      nextDifficultySome: this.asBool(tn['ETTNNDSome']),
      nextDifficultyModerate: this.asBool(tn['ETTNNDModerate']),
      nextDifficultySignificant: this.asBool(tn['ETTNNDSignificant']),
      depthOfPlacement: Number(tn['ETTNDepthOfPlacement'] || 0),
      bloodOnCatheter: Number(tn['ETTNBloodOnCatheter'] || 0),
      embryoRemaining: Number(tn['ETTNEmbryoRemaining'] || 0),
      operTech: String(tn['ETTNOperTech'] || ''),
      comments: String(tn['ETTNComments'] || ''),
      protocolUsed: Number(tn['ETEDProtocolUsed'] || 1),
      mediaUsed: Number(tn['ETEDMediaUsed'] || 1),
      procedureDoneBy: String(tn['ETEDProcedureDoneBy'] || ''),
    });

    this.embryoRows = (data.embryoRows || []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        etEdId: Number(r['ETEDID'] || r['etEdId'] || 0),
        source: String(r['ETEDSource'] || r['source'] || ''),
        celler: Number(r['ETEDCeller'] || r['celler'] || 0),
        grade: Number(r['ETEDGrade'] || r['grade'] || 0),
        action: Number(r['ETEDAction'] || r['action'] || 0),
        remark: String(r['ETEDRemark'] || r['remark'] || ''),
        donPatId: Number(r['ETEDDonPatID'] || r['donPatId'] || 0),
        location: String(r['ETEDLocation'] || r['location'] || ''),
        recipientEt: Number(r['ETEDRecipientET'] || r['recipientEt'] || 0),
        recipientCycleEt: String(r['ETEDRecipientCycleET'] || r['recipientCycleEt'] || ''),
        inUse: this.asBool(r['ETEDInUse'] || r['inUse']),
        isNew: false,
      };
    });

    const sum = data.summary || {};
    this.summaryForm.patchValue({
      etDate: this.toDateInput(sum['ETDate']),
      transfer: Number(sum['ETEDSTransfer'] || 0),
      freeze: Number(sum['ETEDSFreeze'] || 0),
      blastocyst: Number(sum['ETEDSBlastocyst'] || 0),
      stuck: Number(sum['ETEDSStuck'] || 0),
      discard: Number(sum['ETEDSDiscard'] || 0),
      donate: Number(sum['ETEDSDonate'] || 0),
      donateResearch: Number(sum['ETEDSDonateResearch'] || 0),
      remark: String(sum['ETEDSRemark'] || ''),
    });
  }

  private formatDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
  }

  private toDateInput(value: unknown): string {
    if (!value) return new Date().toISOString().split('T')[0];
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
  }

  private asBool(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'True';
  }
}
