import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IuiService } from '../../../core/services/iui.service';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { selectPatientWithSatellite } from '../../../store/patient/patient.selectors';

@Component({
  selector: 'app-iui-entry',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './iui-entry.component.html',
  styleUrl: './iui-entry.component.scss',
})
export class IuiEntryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private iuiService = inject(IuiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    iuiId: [''],
    iuiOId: [1],
    iuiIdOff: [''],
    iuiDate: [this.today()],
    iuiODate: [this.today()],
    iuioValue: [0],
    iuioNoSac: [0],
    iuioPostIuiDay: [0],
    iuioOutcome: [0],
    iuioPregOpt: [0],
    iuioPregDelOpt: [0],
    iuioPostTreat: [''],
    iuioAdvice: [''],
  });

  isNew = true;
  isDeleteMode = false;
  loading = false;
  saving = false;
  error = '';
  success = '';
  token = '';
  patId = 0;
  satId = 0;

  ngOnInit(): void {
    const iuiId = this.route.snapshot.paramMap.get('iuiId');
    this.isNew = !iuiId || iuiId === 'new';
    this.isDeleteMode = this.route.snapshot.queryParamMap.get('mode') === 'delete';

    combineLatest([
      this.store.select(selectAuthToken).pipe(filter((token): token is string => !!token)),
      this.store.select(selectPatientWithSatellite).pipe(filter((patient) => !!patient && !!patient.satelliteId)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([token, patient]) => {
        this.token = token;
        this.patId = patient!.id;
        this.satId = patient!.satelliteId;

        if (this.isNew) {
          return;
        }

        const iuiId = this.route.snapshot.paramMap.get('iuiId');
        const iuiOId = Number(this.route.snapshot.queryParamMap.get('iuiOId') || 1);
        this.form.patchValue({ iuiOId, iuiId: iuiId || '' });
        this.loading = true;

        this.iuiService.loadOutcome(token, iuiId!, iuiOId, patient!.id, patient!.satelliteId).subscribe({
          next: (res) => {
            if (!res?.data) {
              this.loading = false;
              return;
            }
            const data = res.data;
            this.form.patchValue({
              iuiId: String(data['IUIID'] || iuiId),
              iuiIdOff: String(data['IUIIDOff'] || ''),
              iuiDate: this.toInputDate(data['IUIODateOfCreation']),
              iuiODate: this.toInputDate(data['IUIODate']),
              iuioValue: Number(data['IUIOValue'] || 0),
              iuioNoSac: Number(data['IUIONoSac'] || 0),
              iuioPostIuiDay: Number(data['IUIOPostIUIDay'] || 0),
              iuioOutcome: Number(data['IUIOOutcome'] || 0),
              iuioPregOpt: Number(data['IUIOPregOpt'] || 0),
              iuioPregDelOpt: Number(data['IUIOPregDelOpt'] || 0),
              iuioPostTreat: String(data['IUIOPostTreat'] || ''),
              iuioAdvice: String(data['IUIOAdvice'] || ''),
            });
            this.loading = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Failed to load IUI record.';
            this.loading = false;
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (!this.token) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    const value = this.form.getRawValue();
    this.iuiService
      .save(this.token, {
        mode: this.isNew ? 'insert' : 'update',
        patId: this.patId,
        satId: this.satId,
        iuiId: value.iuiId,
        iuiOId: value.iuiOId,
        iuiIdOff: value.iuiIdOff,
        iuiDate: value.iuiDate,
        iuiODate: value.iuiODate,
        iuioValue: value.iuioValue,
        iuioNoSac: value.iuioNoSac,
        iuioPostIuiDay: value.iuioPostIuiDay,
        iuioOutcome: value.iuioOutcome,
        iuioPregOpt: value.iuioPregOpt,
        iuioPregDelOpt: value.iuioPregDelOpt,
        iuioPostTreat: value.iuioPostTreat,
        iuioAdvice: value.iuioAdvice,
      })
      .subscribe({
        next: (res) => {
          this.success = res.message;
          this.saving = false;
          this.router.navigate(['/iui']);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to save IUI record.';
          this.saving = false;
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/iui']);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toInputDate(value: unknown): string {
    if (!value) return this.today();
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? this.today() : date.toISOString().slice(0, 10);
  }
}
