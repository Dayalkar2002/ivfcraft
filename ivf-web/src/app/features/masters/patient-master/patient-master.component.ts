import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, filter, switchMap, takeUntil } from 'rxjs/operators';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import {
  LookupItem,
  MasterService,
  PatientMasterDetail,
  PatientMasterRow,
} from '../../../core/services/master.service';

@Component({
  selector: 'app-patient-master',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './patient-master.component.html',
  styleUrl: './patient-master.component.scss',
})
export class PatientMasterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private masterService = inject(MasterService);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    patId: [0],
    refNo: [''],
    dateOfCreation: [this.today()],
    name: [''],
    category: [''],
    age: [0],
    dob: [this.today()],
    address: [''],
    city: [''],
    email: [''],
    panCard: [''],
    aadhar: [''],
    mobile: [''],
    phone: [''],
    satId: [0],
    docId: [0],
    diagId: [0],
    husbandName: [''],
    husbandAge: [0],
    husbandDob: [this.today()],
    refId: [0],
    husbandPan: [''],
    husbandAadhar: [''],
    husbandEmail: [''],
    husbandPhone: [''],
    photo: [''],
    maritalStatus: ['Married'],
  });

  partnerNameLabel = 'Husband Name';
  partnerAgeLabel = 'Husband Age';
  partnerDobLabel = 'Husband Birth Date';

  satellites: LookupItem[] = [];
  doctors: LookupItem[] = [];
  diagnosis: LookupItem[] = [];
  refBy: LookupItem[] = [];
  rows: PatientMasterRow[] = [];
  loading = false;
  saving = false;
  error = '';
  success = '';
  showDetailModal = false;
  detailLoading = false;
  selectedDetail: PatientMasterDetail | null = null;

  ngOnInit(): void {
    this.form.controls.maritalStatus.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyMaritalStatusLabels();
    });

    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => {
          this.loading = true;
          this.error = '';
          return forkJoin({
            lookups: this.masterService.getPatientLookups(token).pipe(
              catchError((err) => {
                this.error = this.formatLoadError(err);
                return of({
                  success: false,
                  data: { satellites: [], doctors: [], diagnosis: [], refBy: [] },
                });
              })
            ),
            list: this.masterService.listPatients(token).pipe(
              catchError((err) => {
                if (!this.error) {
                  this.error = this.formatLoadError(err);
                }
                return of({ success: false, data: [] });
              })
            ),
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ lookups, list }) => {
          this.satellites = lookups.data.satellites;
          this.doctors = lookups.data.doctors;
          this.diagnosis = lookups.data.diagnosis;
          this.refBy = lookups.data.refBy;
          this.rows = list.data;
          this.loading = false;
        },
      });
  }

  private formatLoadError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 404) {
        return 'Master API not found. Restart the Node API: cd ivf-api && npm run dev';
      }
      if (err.status === 503) {
        return err.error?.message ?? 'Database not configured. Check ivf-api/.env settings.';
      }
      if (err.status === 401) {
        return 'Session expired. Please log in again.';
      }
      return err.error?.message ?? `Failed to load patient master (HTTP ${err.status}).`;
    }
    return 'Failed to load patient master. Ensure the API is running on http://localhost:3000';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => {
          this.saving = true;
          this.error = '';
          this.success = '';
          return this.masterService.savePatient(token, this.form.getRawValue() as unknown as PatientMasterDetail);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.success = res.message;
          this.saving = false;
          if (!this.form.value.patId) this.resetForm();
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Save failed.';
          this.saving = false;
        },
      });
  }

  selectRow(row: PatientMasterRow): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.getPatient(token, row.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.patchFormFromDetail(res.data);
        },
      });
  }

  openRowPopup(row: PatientMasterRow, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.row-actions')) {
      return;
    }

    this.showDetailModal = true;
    this.detailLoading = true;
    this.selectedDetail = null;

    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.getPatient(token, row.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.selectedDetail = res.data;
          this.detailLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Failed to load patient details.';
          this.detailLoading = false;
          this.showDetailModal = false;
        },
      });
  }

  loadDetailToForm(): void {
    if (!this.selectedDetail) return;
    this.patchFormFromDetail(this.selectedDetail);
    this.closeDetailModal();
    this.success = 'Patient loaded into form for editing.';
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDetail = null;
    this.detailLoading = false;
  }

  lookupName(list: LookupItem[], id: number): string {
    return list.find((item) => item.id === id)?.name ?? '—';
  }

  private patchFormFromDetail(p: PatientMasterDetail): void {
    this.form.patchValue({
      patId: p.id ?? p.patId ?? 0,
      refNo: p.refNo,
      dateOfCreation: this.toInputDate(p.dateOfCreation),
      name: p.name,
      category: p.category,
      age: p.age,
      dob: this.toInputDate(p.dob),
      address: p.address,
      city: p.city,
      phone: p.phone,
      mobile: p.mobile,
      email: p.email,
      docId: p.docId,
      diagId: p.diagId,
      husbandName: p.husbandName,
      husbandAge: p.husbandAge,
      husbandDob: this.toInputDate(p.husbandDob),
      satId: p.satId,
      refId: p.refId,
      panCard: p.panCard,
      aadhar: p.aadhar,
      husbandPan: p.husbandPan,
      husbandAadhar: p.husbandAadhar,
      husbandEmail: p.husbandEmail,
      maritalStatus: p.maritalStatus || 'Married',
    });
    this.applyMaritalStatusLabels();
  }

  onMaritalStatusChange(): void {
    this.applyMaritalStatusLabels();
  }

  private applyMaritalStatusLabels(): void {
    const isUnmarried = this.form.value.maritalStatus === 'Unmarried';
    this.partnerNameLabel = isUnmarried ? 'Father Name' : 'Husband Name';
    this.partnerAgeLabel = isUnmarried ? 'Father Age' : 'Husband Age';
    this.partnerDobLabel = isUnmarried ? 'Father Birth Date' : 'Husband Birth Date';
  }

  deleteRow(row: PatientMasterRow): void {
    if (!confirm(`Delete patient "${row.name}"?`)) return;
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.deletePatient(token, row.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.rows = this.rows.filter((r) => r.id !== row.id);
          this.resetForm();
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Delete failed.';
        },
      });
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      patId: 0,
      refNo: '',
      dateOfCreation: this.today(),
      name: '',
      category: '',
      age: 0,
      dob: this.today(),
      address: '',
      city: '',
      email: '',
      panCard: '',
      aadhar: '',
      mobile: '',
      phone: '',
      satId: 0,
      docId: 0,
      diagId: 0,
      husbandName: '',
      husbandAge: 0,
      husbandDob: this.today(),
      refId: 0,
      husbandPan: '',
      husbandAadhar: '',
      husbandEmail: '',
      husbandPhone: '',
      photo: '',
      maritalStatus: 'Married',
    });
    this.applyMaritalStatusLabels();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toInputDate(value: string | null | undefined): string {
    if (!value) return this.today();
    return new Date(value).toISOString().slice(0, 10);
  }
}
