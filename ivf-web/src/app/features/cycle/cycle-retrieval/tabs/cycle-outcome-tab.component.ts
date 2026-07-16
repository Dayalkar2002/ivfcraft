import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CycleDetailService } from '../../../../core/services/cycle-detail.service';
import { selectAuthToken } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-cycle-outcome-tab',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cycle-outcome-tab.component.html',
  styleUrl: './cycle-tab.shared.scss',
})
export class CycleOutcomeTabComponent implements OnInit {
  @Input({ required: true }) cycleId = '';

  private fb = inject(FormBuilder);
  private store = inject(Store);
  private cycleDetail = inject(CycleDetailService);

  loading = true;
  saving = false;
  error = '';
  success = '';

  outcomeOptions = [
    { value: 0, label: 'Select' },
    { value: 1, label: 'Positive' },
    { value: 2, label: 'Negative' },
    { value: 3, label: 'Biochemical' },
  ];

  pregOptions = [
    { value: 0, label: 'Select' },
    { value: 1, label: 'Clinical' },
    { value: 2, label: 'Ectopic' },
    { value: 3, label: 'Miscarriage' },
  ];

  form = this.fb.group({
    outcomeDate: [''],
    bhcgDate: [''],
    value: [0],
    noSacs: [0],
    ptDay: [0],
    outcome: [0],
    pregOpt: [0],
    pregDelOpt: [0],
    postTreatment: [''],
    advice: [''],
    treatment: [''],
  });

  ngOnInit(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token || !this.cycleId) return;
      this.cycleDetail.loadOutcome(token, this.cycleId).subscribe({
        next: (res) => {
          this.form.patchValue(res.data.data as never);
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load outcome.';
          this.loading = false;
        },
      });
    });
  }

  save(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token) return;
      this.saving = true;
      this.error = '';
      this.success = '';
      this.cycleDetail.saveOutcome(token, this.cycleId, this.form.value as never).subscribe({
        next: (res) => {
          this.success = res.message;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save outcome.';
          this.saving = false;
        },
      });
    });
  }
}
