import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, forkJoin, of } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { LookupItem } from '../../../core/services/master.service';
import {
  BT_ACTION_OPTIONS,
  BT_CELLER_OPTIONS,
  BT_GRADE_OPTIONS,
  BT_MEDIA_OPTIONS,
  BT_PROTOCOL_OPTIONS,
  BtBlastocystRow,
  BtService,
  TransferCycleDate,
} from '../../../core/services/bt.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

type BtTab = 'transfer' | 'blastocysts' | 'summary';

@Component({
  selector: 'app-bt-entry',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './bt-entry.component.html',
  styleUrl: './bt-entry.component.scss',
})
export class BtEntryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private btService = inject(BtService);
  private destroy$ = new Subject<void>();

  cycleForm = this.fb.group({ cycId: [''], cycleDate: [''], btId: [''] });

  transferForm = this.fb.group({
    transferDate: [new Date().toISOString().split('T')[0]],
    diagnosis: [''],
    procedure: [''],
    embryologist: [''],
    surgeon: [0],
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
    difficultyNone: [true],
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
    transfer: [0],
    freeze: [0],
    blastocyst: [0],
    stuck: [0],
    discard: [0],
    donate: [0],
    remark: [''],
  });

  cycleDates: TransferCycleDate[] = [];
  doctors: LookupItem[] = [];
  blastocystRows: BtBlastocystRow[] = [];
  cellerOptions = BT_CELLER_OPTIONS;
  gradeOptions = BT_GRADE_OPTIONS;
  actionOptions = BT_ACTION_OPTIONS;
  mediaOptions = BT_MEDIA_OPTIONS;
  protocolOptions = BT_PROTOCOL_OPTIONS;

  activeTab: BtTab = 'transfer';
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
          cycleDates: this.btService.getCycleDates(token, patient.id, patient.satelliteId),
          lookups: this.btService.getLookups(token).pipe(catchError(() => of({ success: true, data: { doctors: [] } }))),
        }).subscribe({
          next: ({ cycleDates, lookups }) => {
            this.cycleDates = cycleDates.data || [];
            this.doctors = lookups.data?.doctors || [];
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load BT module.';
            this.loading = false;
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: BtTab): void {
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

    this.btService.loadRecord(this.token, this.patId, this.satId, cycId, cycleDate).subscribe({
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
        this.error = err?.error?.message || 'Failed to load BT record.';
        this.loading = false;
      },
    });
  }

  addBlastocystRow(): void {
    this.blastocystRows = [
      ...this.blastocystRows,
      { source: 'IVF', celler: 0, grade: 0, teGrade: 0, action: 0, remark: '', location: '', isNew: true },
    ];
  }

  removeBlastocystRow(index: number): void {
    this.blastocystRows = this.blastocystRows.filter((_, i) => i !== index);
  }

  save(): void {
    if (!this.token || !this.cycleForm.value.cycId) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    const { cycId, cycleDate, btId } = this.cycleForm.getRawValue();
    this.btService
      .save(this.token, {
        mode: this.isUpdate ? 'update' : 'insert',
        patId: this.patId,
        satId: this.satId,
        cycId,
        cycleDate,
        btId,
        transferNote: this.transferForm.getRawValue(),
        protocolUsed: this.transferForm.value.protocolUsed,
        mediaUsed: this.transferForm.value.mediaUsed,
        procedureDoneBy: this.transferForm.value.procedureDoneBy,
        blastocystRows: this.blastocystRows,
        summary: this.summaryForm.getRawValue(),
      })
      .subscribe({
        next: (res) => {
          this.success = res.message;
          this.isUpdate = true;
          const saved = res.data as { btId?: string };
          if (saved?.btId) this.cycleForm.patchValue({ btId: saved.btId });
          this.saving = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save BT record.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.showForm = false;
    this.cycleForm.reset({ cycId: '', cycleDate: '', btId: '' });
    this.isUpdate = false;
    this.success = '';
    this.error = '';
  }

  private resetForNew(): void {
    this.cycleForm.patchValue({ btId: '' });
    this.blastocystRows = [];
    this.transferForm.patchValue({
      transferDate: new Date().toISOString().split('T')[0],
      catheterCcd: true,
      difficultyNone: true,
      nextDifficultyNone: true,
    });
  }

  private applyRecord(data: { transferNote?: Record<string, unknown>; blastocystRows?: BtBlastocystRow[]; summary?: Record<string, unknown> }): void {
    const tn = data.transferNote || {};
    this.cycleForm.patchValue({ btId: String(tn['BTID'] || '') });
    this.transferForm.patchValue({
      transferDate: this.toDateInput(tn['BTTNDate']),
      diagnosis: String(tn['BTTNDiagnosis'] || ''),
      procedure: String(tn['BTTNProc'] || ''),
      embryologist: String(tn['BTTNEmbryologist'] || ''),
      surgeon: Number(tn['BTTNSurgeon'] || 0),
      anesthesia: Number(tn['BTTNAnesthesia'] || 0),
      anesthesiaOther: String(tn['BTTNAnesOther'] || ''),
      complication: Number(tn['BTTNComplication'] || 0),
      complicationNote: String(tn['BTTNCompNote'] || ''),
      fbe: Number(tn['BTTNFBE'] || 0),
      fav: this.asBool(tn['BTTNFAV']),
      frv: this.asBool(tn['BTTNFRV']),
      fax: this.asBool(tn['BTTNFAx']),
      ftr: Number(tn['BTTNFTR'] || 0),
      fmtd: Number(tn['BTTNFMTD'] || 0),
      fdr: Number(tn['BTTNFDR'] || 0),
      fug: Number(tn['BTTNFUG'] || 0),
      catheterCcd: this.asBool(tn['BTTNCCCD']),
      catheterLaboTech: this.asBool(tn['BTTNCLaboTech']),
      catheterSoftPass: this.asBool(tn['BTTNCSoftPass']),
      catheterCook: this.asBool(tn['BTTNCCook']),
      difficultyNone: this.asBool(tn['BTTNCDNone']),
      difficultySome: this.asBool(tn['BTTNCDSome']),
      difficultyModerate: this.asBool(tn['BTTNCDModerate']),
      difficultySignificant: this.asBool(tn['BTTNCDSignificant']),
      nextCatheter: this.asBool(tn['BTTNNCatheter']),
      nextWallace: this.asBool(tn['BTTNNWallace']),
      nextMarrs: this.asBool(tn['BTTNNMarrs']),
      nextDifficult: this.asBool(tn['BTTNNDifficult']),
      nextDifficultyNone: this.asBool(tn['BTTNNDNone']),
      nextDifficultySome: this.asBool(tn['BTTNNDSome']),
      nextDifficultyModerate: this.asBool(tn['BTTNNDModerate']),
      nextDifficultySignificant: this.asBool(tn['BTTNNDSignificant']),
      depthOfPlacement: Number(tn['BTTNDepthOfPlacement'] || 0),
      bloodOnCatheter: Number(tn['BTTNBloodOnCatheter'] || 0),
      embryoRemaining: Number(tn['BTTNEmbryoRemaining'] || 0),
      operTech: String(tn['BTTNOperTech'] || ''),
      comments: String(tn['BTTNComments'] || ''),
      protocolUsed: Number(tn['BTBDProtocolUsed'] || 1),
      mediaUsed: Number(tn['BTBDMediaUsed'] || 1),
      procedureDoneBy: String(tn['BTBDProcedureDoneBy'] || ''),
    });

    this.blastocystRows = (data.blastocystRows || []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        btBdId: Number(r['BTBDID'] || r['btBdId'] || 0),
        source: String(r['BTBDSource'] || r['source'] || ''),
        celler: Number(r['BTBDCeller'] || r['celler'] || 0),
        grade: Number(r['BTBDGrade'] || r['grade'] || 0),
        teGrade: Number(r['BTTEGrade'] || r['teGrade'] || 0),
        action: Number(r['BTBDAction'] || r['action'] || 0),
        remark: String(r['BTBDRemark'] || r['remark'] || ''),
        donPatId: Number(r['BTBDDonPatID'] || r['donPatId'] || 0),
        location: String(r['BTBDLocation'] || r['location'] || ''),
        recipientBt: Number(r['BTBDRecipientBT'] || r['recipientBt'] || 0),
        recipientCycleBt: String(r['BTBDRecipientCycleBT'] || r['recipientCycleBt'] || ''),
        inUse: this.asBool(r['BTBDInUse'] || r['inUse']),
        isNew: false,
      };
    });

    const sum = data.summary || {};
    this.summaryForm.patchValue({
      transfer: Number(sum['BTBDSTransfer'] || 0),
      freeze: Number(sum['BTBDSFreeze'] || 0),
      blastocyst: Number(sum['BTBDSBlastocyst'] || 0),
      stuck: Number(sum['BTBDSStuck'] || 0),
      discard: Number(sum['BTBDSDiscard'] || 0),
      donate: Number(sum['BTBDSDonate'] || 0),
      remark: String(sum['BTBDSRemark'] || ''),
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
