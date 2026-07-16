import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { MasterService, SatelliteMasterDetail, SatelliteMasterRow } from '../../../core/services/master.service';

@Component({
  selector: 'app-satellite-master',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './satellite-master.component.html',
  styleUrl: './satellite-master.component.scss',
})
export class SatelliteMasterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private masterService = inject(MasterService);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    satId: [0],
    name: [''],
    shortName: [''],
    address1: [''],
    address2: [''],
    city: [''],
    drOne: [''],
    drOneDeg: [''],
    drTwo: [''],
    drTwoDeg: [''],
    phone: [''],
    mobile: [''],
    fax: [''],
    email: [''],
  });

  rows: SatelliteMasterRow[] = [];
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
          return this.masterService.saveSatellite(token, this.form.getRawValue() as SatelliteMasterDetail);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.saving = false;
          if (!this.form.value.satId) this.form.reset({ satId: 0 });
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Save failed.';
          this.saving = false;
        },
      });
  }

  selectRow(row: SatelliteMasterRow): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.getSatellite(token, row.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          const s = res.data;
          this.form.patchValue({
            satId: s.id ?? s.satId ?? 0,
            name: s.name,
            shortName: s.shortName,
            address1: s.address1,
            address2: s.address2,
            city: s.city,
            drOne: s.drOne,
            drOneDeg: s.drOneDeg,
            drTwo: s.drTwo,
            drTwoDeg: s.drTwoDeg,
            phone: s.phone,
            mobile: s.mobile,
            fax: s.fax,
            email: s.email,
          });
        },
      });
  }

  cancel(): void {
    this.form.reset({ satId: 0 });
  }

  private reload(): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => {
          this.loading = true;
          return this.masterService.listSatellites(token);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Failed to load satellites.';
          this.loading = false;
        },
      });
  }
}
