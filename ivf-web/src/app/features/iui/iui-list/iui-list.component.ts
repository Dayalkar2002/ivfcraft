import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { IuiListRow, IuiService } from '../../../core/services/iui.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

@Component({
  selector: 'app-iui-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './iui-list.component.html',
  styleUrl: './iui-list.component.scss',
})
export class IuiListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private iuiService = inject(IuiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  rows: IuiListRow[] = [];
  loading = false;
  error = '';
  success = '';
  patientName = '';

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((token): token is string => !!token)),
      this.store.select(selectPatientWithSatellite).pipe(filter((patient) => !!patient && !!patient.satelliteId)),
    ])
      .pipe(
        switchMap(([token, patient]) => {
          this.patientName = patient!.name;
          this.loading = true;
          this.error = '';
          return this.iuiService.list(token, patient!.id, patient!.satelliteId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load IUI list.';
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNew(): void {
    this.router.navigate(['/iui/new']);
  }

  selectRow(row: IuiListRow): void {
    const iuiOId = Number(row.IUIOID ?? row['IUIOID']);
    this.router.navigate(['/iui', row.IUIID], { queryParams: { iuiOId } });
  }

  deleteRow(row: IuiListRow): void {
    const iuiOId = Number(row.IUIOID ?? row['IUIOID']);
    this.router.navigate(['/iui', row.IUIID], { queryParams: { iuiOId, mode: 'delete' } });
  }

  unlockRow(row: IuiListRow): void {
    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((token): token is string => !!token)),
      this.store.select(selectPatientWithSatellite).pipe(filter((patient) => !!patient && !!patient.satelliteId)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([token, patient]) => {
        this.iuiService
          .unlock(token, { patId: patient!.id, cycleId: row.IUIID, patName: patient!.name })
          .subscribe({
            next: (res) => {
              this.success = res.message;
              this.reload(token, patient!.id, patient!.satelliteId);
            },
            error: (err) => {
              this.error = err?.error?.message || 'Failed to unlock cycle.';
            },
          });
      });
  }

  isLocked(row: IuiListRow): boolean {
    const value = row.IsLock ?? row['IsLock'];
    return value === true || value === 1 || value === '1' || value === 'True';
  }

  private reload(token: string, patId: number, satId: number): void {
    this.loading = true;
    this.iuiService.list(token, patId, satId).subscribe({
      next: (res) => {
        this.rows = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
