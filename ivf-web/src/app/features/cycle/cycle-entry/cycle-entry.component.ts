import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AsyncPipe, DatePipe,TitleCasePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CycleActions } from '../../../store/cycle/cycle.actions';
import { UiActions } from '../../../store/ui/ui.actions';
import {
  selectCycleError,
  selectCycleSaving,
  selectCycleSuccess,
  selectCycleType,
  selectOocyteSources,
  selectSemenSources,
  selectCurrentCycle,
} from '../../../store/cycle/cycle.selectors';
import { selectSelectedPatient, selectSelectedSatellite } from '../../../store/patient/patient.selectors';
import { SourceOption } from '../../../core/models';

const CYCLE_TYPE_MAP: Record<string, Record<string, string>> = {
  self_oocyte: {
    husband_fresh: 'Conventional IVF (Self Oocyte + Husband Fresh)',
    husband_cryo: 'IVF with Frozen Husband Semen',
    donor_fresh: 'IVF (Self Oocyte + Donor Fresh Semen)',
    donor_cryo: 'IVF (Self Oocyte + Donor Cryo Semen)',
    surgical_fresh: 'ICSI with Surgical Sperm (Self Oocyte)',
    surgical_frozen: 'ICSI with Frozen Surgical Sperm (Self Oocyte)',
  },
  donor_oocyte: {
    husband_fresh: 'Donor Oocyte + Husband Fresh',
    husband_cryo: 'Donor Oocyte + Husband Cryo',
    donor_fresh: 'Donor Oocyte + Donor Fresh Semen',
    donor_cryo: 'Donor Oocyte + Donor Cryo Semen',
    surgical_fresh: 'Donor Oocyte + Surgical Sperm',
    surgical_frozen: 'Donor Oocyte + Frozen Surgical Sperm',
  },
  oocyte_recipient: {
    husband_fresh: 'Oocyte Recipient + Husband Fresh',
    husband_cryo: 'Oocyte Recipient + Husband Cryo',
    donor_fresh: 'Oocyte Recipient + Donor Fresh Semen',
    donor_cryo: 'Oocyte Recipient + Donor Cryo Semen',
    surgical_fresh: 'Oocyte Recipient + Surgical Sperm',
    surgical_frozen: 'Oocyte Recipient + Frozen Surgical Sperm',
  },
  embryo_recipient: {
    husband_fresh: 'Embryo Recipient Cycle',
    husband_cryo: 'Embryo Recipient Cycle (Husband Cryo)',
    donor_fresh: 'Embryo Recipient Cycle (Donor Semen)',
    donor_cryo: 'Embryo Recipient Cycle (Donor Cryo)',
    surgical_fresh: 'Embryo Recipient Cycle (Surgical Sperm)',
    surgical_frozen: 'Embryo Recipient Cycle (Frozen Surgical)',
  },
};

@Component({
  selector: 'app-cycle-entry',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, DatePipe],
  templateUrl: './cycle-entry.component.html',
  styleUrl: './cycle-entry.component.scss',
})
export class CycleEntryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  oocyteSources$ = this.store.select(selectOocyteSources);
  semenSources$ = this.store.select(selectSemenSources);
  patient$ = this.store.select(selectSelectedPatient);
  cycleType$ = this.store.select(selectCycleType);
  saving$ = this.store.select(selectCycleSaving);
  error$ = this.store.select(selectCycleError);
  success$ = this.store.select(selectCycleSuccess);
  currentCycle$ = this.store.select(selectCurrentCycle);

  today = new Date();

  form = this.fb.group({
    oocyteSource: ['self_oocyte', Validators.required],
    semenSource: ['husband_fresh', Validators.required],
    cycleDate: [new Date().toISOString().split('T')[0]],
    donorId: [''],
    donorName: [''],
    oocyteCount: [null as number | null],
    recipientCount: [null as number | null],
    receivedFromDonorId: [''],
    receivedDonorName: [''],
    receivedOocyteCount: [null as number | null],
    embryoDonorCoupleId: [''],
    donorCoupleName: [''],
    embryoBatchNo: [''],
    oocyteDonorId: [''],
    semenDonorId: [''],
    donorSemenId: [''],
    cryoStrawNo: [''],
    freezingDate: [''],
  });

  computedCycleType = 'Conventional IVF (Self Oocyte + Husband Fresh)';
  navigateAfterSave = false;

  ngOnInit(): void {
    this.store.dispatch(CycleActions.loadTypes());
    this.updateCycleType();
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateCycleType());

    this.store
      .select(selectCurrentCycle)
      .pipe(
        takeUntil(this.destroy$),
        filter((cycle) => !!cycle?.cycleId && this.navigateAfterSave)
      )
      .subscribe((cycle) => {
        this.navigateAfterSave = false;
        this.store.dispatch(UiActions.hideLoader({}));
        this.router.navigate(['/cycle/retrieval', cycle!.cycleId]);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get oocyteSource(): string {
    return this.form.get('oocyteSource')?.value || '';
  }

  get semenSource(): string {
    return this.form.get('semenSource')?.value || '';
  }

  showDonorOocyteDetails(): boolean {
    return this.oocyteSource === 'donor_oocyte';
  }

  showOocyteRecipientDetails(): boolean {
    return this.oocyteSource === 'oocyte_recipient';
  }

  showEmbryoRecipientDetails(): boolean {
    return this.oocyteSource === 'embryo_recipient';
  }

  showSemenDonorDetails(): boolean {
    return ['husband_cryo', 'donor_fresh', 'donor_cryo', 'surgical_frozen'].includes(this.semenSource);
  }

  isSectionDisabled(section: string): boolean {
    if (section === 'donor_oocyte') return !this.showDonorOocyteDetails();
    if (section === 'oocyte_recipient') return !this.showOocyteRecipientDetails();
    if (section === 'embryo_recipient') return !this.showEmbryoRecipientDetails();
    if (section === 'semen_donor') return !this.showSemenDonorDetails();
    return false;
  }

  getOocyteLabel(opt: SourceOption): string {
    return opt.label;
  }

  updateCycleType(): void {
    const oocyte = this.form.get('oocyteSource')?.value || 'self_oocyte';
    const semen = this.form.get('semenSource')?.value || 'husband_fresh';
    this.computedCycleType = CYCLE_TYPE_MAP[oocyte]?.[semen] || 'Unknown Cycle Type';
    this.store.dispatch(CycleActions.updateSelection({ oocyteSource: oocyte, semenSource: semen, cycleType: this.computedCycleType }));
  }

  save(andNext = false): void {
    combineLatest([this.patient$, this.store.select(selectSelectedSatellite)])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([patient, satellite]) => {
      if (!patient) {
        alert('Please select a patient first.');
        return;
      }
      if (!satellite) {
        alert('Please select a satellite clinic first.');
        return;
      }

      const v = this.form.getRawValue();
      const entry = {
        patientId: patient.id,
        satelliteId: satellite.id,
        oocyteSource: v.oocyteSource!,
        semenSource: v.semenSource!,
        cycleDate: v.cycleDate || undefined,
        donorOocyteDetails: this.showDonorOocyteDetails()
          ? { donorId: v.donorId!, donorName: v.donorName!, oocyteCount: Number(v.oocyteCount) || 0, recipientCount: Number(v.recipientCount) || 0 }
          : null,
        oocyteRecipientDetails: this.showOocyteRecipientDetails()
          ? { receivedFromDonorId: v.receivedFromDonorId!, donorName: v.receivedDonorName!, oocyteCount: Number(v.receivedOocyteCount) || 0 }
          : null,
        embryoRecipientDetails: this.showEmbryoRecipientDetails()
          ? {
              embryoDonorCoupleId: v.embryoDonorCoupleId!,
              donorCoupleName: v.donorCoupleName!,
              embryoBatchNo: v.embryoBatchNo!,
              oocyteDonorId: v.oocyteDonorId!,
              semenDonorId: v.semenDonorId!,
            }
          : null,
        semenDonorDetails: this.showSemenDonorDetails()
          ? { donorSemenId: v.donorSemenId!, cryoStrawNo: v.cryoStrawNo!, freezingDate: v.freezingDate! }
          : null,
      };

      this.navigateAfterSave = andNext;
      this.store.dispatch(UiActions.showLoader({ message: 'Saving cycle entry...' }));
      this.store.dispatch(CycleActions.saveEntry({ entry }));
    }).unsubscribe();
  }

  next(): void {
    this.currentCycle$.pipe(takeUntil(this.destroy$)).subscribe((cycle) => {
      if (cycle?.cycleId) {
        this.router.navigate(['/cycle/retrieval', cycle.cycleId]);
      } else {
        alert('Please save the cycle entry first.');
      }
    }).unsubscribe();
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
