import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CycleDetailService } from '../../../../core/services/cycle-detail.service';
import { selectAuthToken } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-cycle-survival-tab',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cycle-survival-tab.component.html',
  styleUrl: './cycle-tab.shared.scss',
})
export class CycleSurvivalTabComponent implements OnInit {
  @Input({ required: true }) cycleId = '';

  private fb = inject(FormBuilder);
  private store = inject(Store);
  private cycleDetail = inject(CycleDetailService);

  loading = true;
  saving = false;
  error = '';
  success = '';

  form = this.fb.group({
    conc: [0],
    motility: [0],
    nmph1: [0],
    nmph2: [0],
    date: [''],
    recovery: [''],
    antibodies: [''],
    saResult: this.fb.group({
      positive: [false],
      borderline: [false],
      negative: [false],
    }),
    gnrh: this.fb.group({
      none: [false],
      stopLupron: [false],
      luteal: [false],
    }),
    dosage: [false],
    spermSource: this.fb.group({
      donor: [false],
      donorCryo: [false],
      husband: [false],
      husbandCryo: [false],
    }),
    transferType: this.fb.group({
      ivf: [false],
      gift: [false],
      zift: [false],
      cryoAll: [false],
    }),
    consent: this.fb.group({
      icsi: [false],
      hatching: [false],
      cryo: [false],
      immatures: [false],
      apa: [false],
    }),
    comments: [''],
  });

  ngOnInit(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token || !this.cycleId) return;
      this.cycleDetail.loadSurvival(token, this.cycleId).subscribe({
        next: (res) => {
          this.form.patchValue(res.data.data as never);
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load survival report.';
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
      this.cycleDetail.saveSurvival(token, this.cycleId, this.form.value as never).subscribe({
        next: (res) => {
          this.success = res.message;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save survival report.';
          this.saving = false;
        },
      });
    });
  }
}
