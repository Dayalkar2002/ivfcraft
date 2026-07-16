import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { DoctorMasterDetail, DoctorMasterRow, MasterService } from '../../../core/services/master.service';

@Component({
  selector: 'app-doctor-master',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './doctor-master.component.html',
  styleUrl: './doctor-master.component.scss',
})
export class DoctorMasterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private masterService = inject(MasterService);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    docId: [0],
    name: [''],
    address1: [''],
    address2: [''],
    address3: [''],
    city: [''],
    phone: [''],
    mobile: [''],
    pager: [''],
    email: [''],
    degree: [''],
    speciality: [''],
  });

  rows: DoctorMasterRow[] = [];
  loading = false;
  saving = false;
  error = '';

  ngOnInit(): void {
    this.reload();
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
          return this.masterService.saveDoctor(token, this.form.getRawValue() as DoctorMasterDetail);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.saving = false;
          if (!this.form.value.docId) this.form.reset({ docId: 0 });
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Save failed.';
          this.saving = false;
        },
      });
  }

  selectRow(row: DoctorMasterRow): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.getDoctor(token, row.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          const d = res.data;
          this.form.patchValue({
            docId: d.id ?? d.docId ?? 0,
            name: d.name,
            address1: d.address1,
            address2: d.address2,
            address3: d.address3,
            city: d.city,
            phone: d.phone,
            mobile: d.mobile,
            pager: d.pager,
            email: d.email,
            degree: d.degree,
            speciality: d.speciality,
          });
        },
      });
  }

  cancel(): void {
    this.form.reset({ docId: 0 });
  }

  private reload(): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => {
          this.loading = true;
          return this.masterService.listDoctors(token);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Failed to load doctors.';
          this.loading = false;
        },
      });
  }
}
