import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CycleActions } from '../../../store/cycle/cycle.actions';
import { UiActions } from '../../../store/ui/ui.actions';
import {
  selectCurrentCycle,
  selectCycleError,
  selectCycleLoading,
  selectCycleSaving,
  selectCycleSuccess,
  selectRetrievalConfig,
} from '../../../store/cycle/cycle.selectors';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { ApiService } from '../../../core/services/api.service';
import { RetrievalData, RetrievalRow, RetrievalSections } from '../../../core/models';
import { CycleState } from '../../../store/cycle/cycle.state';
import { CycleHistoryTabComponent } from './tabs/cycle-history-tab.component';
import { CycleSurvivalTabComponent } from './tabs/cycle-survival-tab.component';
import { CycleMonitoringTabComponent } from './tabs/cycle-monitoring-tab.component';
import { CycleOutcomeTabComponent } from './tabs/cycle-outcome-tab.component';

interface DonorAadharRowCheck {
  donorAadhar: string;
  recipientAadhar: string;
  message: string;
  isAllowed: boolean;
}

@Component({
  selector: 'app-cycle-retrieval',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    CycleHistoryTabComponent,
    CycleSurvivalTabComponent,
    CycleMonitoringTabComponent,
    CycleOutcomeTabComponent,
  ],
  templateUrl: './cycle-retrieval.component.html',
  styleUrl: './cycle-retrieval.component.scss',
})
export class CycleRetrievalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  cycleId = '';
  token = '';
  donorPatId = 0;
  donorAadhar = '';
  lockedRecipientId: number | null = null;
  rowAadharChecks: Record<number, DonorAadharRowCheck> = {};
  currentConfig: CycleState['retrievalConfig'] = null;
  validationError = '';

  config$ = this.store.select(selectRetrievalConfig);
  currentCycle$ = this.store.select(selectCurrentCycle);
  loading$ = this.store.select(selectCycleLoading);
  saving$ = this.store.select(selectCycleSaving);
  error$ = this.store.select(selectCycleError);
  success$ = this.store.select(selectCycleSuccess);

  form = this.fb.group({
    selfToSelf: this.fb.array([this.createRowGroup()]),
    donorToRecipient: this.fb.array([this.createRecipientRowGroup()]),
  });

  tabs = [
    { id: 'history', label: 'History' },
    { id: 'survival', label: 'Survival Report' },
    { id: 'monitoring', label: 'Monitoring Chart' },
    { id: 'retrieval', label: 'Retrieval' },
    { id: 'outcome', label: 'Outcome' },
  ];
  activeTab = 'retrieval';

  ngOnInit(): void {
    this.cycleId = this.route.snapshot.paramMap.get('cycleId') || '';
    this.store.dispatch(UiActions.showLoader({ message: 'Loading retrieval configuration...' }));
    this.store.dispatch(CycleActions.loadRetrievalConfig({ cycleId: this.cycleId }));

    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((t): t is string => !!t)),
      this.config$.pipe(filter((c) => !!c)),
      this.currentCycle$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([token, config, cycle]) => {
        this.token = token;
        this.donorPatId = cycle?.patientId ?? 0;
        this.currentConfig = config;
        this.donorAadhar = config!.donorAadhar || '';
        this.store.dispatch(UiActions.hideLoader({}));

        const locked = config!.lockedRecipients?.[0];
        if (locked) {
          this.lockedRecipientId = locked.recipientId;
          this.donorToRecipient.at(0)?.patchValue({ recipientPatientId: locked.recipientId });
        }

        if (config!.existingRetrieval) {
          this.patchExistingRetrieval(config!.existingRetrieval, config!.sections);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selfToSelf(): FormArray {
    return this.form.get('selfToSelf') as FormArray;
  }

  get donorToRecipient(): FormArray {
    return this.form.get('donorToRecipient') as FormArray;
  }

  createRowGroup() {
    return this.fb.group({
      leftOvary: [null],
      rightOvary: [null],
      ivf: [null],
      icsi: [null],
      gift: [null],
      zift: [null],
      damaged: [null],
      total: [null],
    });
  }

  createRecipientRowGroup() {
    return this.fb.group({
      leftOvary: [null],
      rightOvary: [null],
      ivf: [null],
      icsi: [null],
      total: [null],
      recipientPatientId: [null],
      recipientCycleId: [''],
    });
  }

  addRow(array: FormArray): void {
    array.push(this.createRecipientRowGroup());
  }

  isRecipientLocked(recipientId: number | null | undefined): boolean {
    return this.lockedRecipientId !== null && recipientId !== this.lockedRecipientId;
  }

  onRecipientChange(rowIndex: number): void {
    const recipientId = Number(this.donorToRecipient.at(rowIndex)?.value.recipientPatientId);
    if (!recipientId || !this.token || !this.donorPatId) {
      delete this.rowAadharChecks[rowIndex];
      return;
    }

    if (this.lockedRecipientId && recipientId !== this.lockedRecipientId) {
      this.rowAadharChecks[rowIndex] = {
        donorAadhar: this.donorAadhar,
        recipientAadhar: '',
        message: 'This donor is already mapped to another recipient. Only the same recipient is allowed.',
        isAllowed: false,
      };
      return;
    }

    this.api.checkDonorAadhar(this.token, this.donorPatId, recipientId, this.cycleId).subscribe({
      next: (res) => {
        this.rowAadharChecks[rowIndex] = {
          donorAadhar: res.data.donorAadhar,
          recipientAadhar: res.data.recipientAadhar,
          message: res.data.message,
          isAllowed: res.data.isAllowed,
        };
      },
    });
  }

  save(): void {
    this.validationError = '';
    const config = this.currentConfig;
    const sections: RetrievalData = {};

    if (config?.sections.showSelfToSelf) {
      sections.selfToSelf = this.selfToSelf.value as RetrievalRow[];
    }
    if (config?.sections.showDonorToRecipient) {
      const invalidRow = Object.values(this.rowAadharChecks).find((check) => !check.isAllowed);
      if (invalidRow) {
        this.validationError = invalidRow.message;
        return;
      }
      sections.donorToRecipient = this.donorToRecipient.value as RetrievalRow[];
    }

    this.store.dispatch(UiActions.showLoader({ message: 'Saving retrieval data...' }));
    this.store.dispatch(CycleActions.saveRetrieval({ cycleId: this.cycleId, sections }));

    this.success$
      .pipe(filter((m) => !!m), takeUntil(this.destroy$))
      .subscribe(() => this.store.dispatch(UiActions.hideLoader({})));
  }

  back(): void {
    this.router.navigate(['/cycle']);
  }

  private patchExistingRetrieval(data: RetrievalData, sections: RetrievalSections): void {
    if (sections.showSelfToSelf && data.selfToSelf?.length) {
      this.selfToSelf.clear();
      data.selfToSelf.forEach((row) => this.selfToSelf.push(this.fb.group(row)));
    }
    if (sections.showDonorToRecipient && data.donorToRecipient?.length) {
      this.donorToRecipient.clear();
      data.donorToRecipient.forEach((row) => this.donorToRecipient.push(this.fb.group(row)));
    }
  }
}
