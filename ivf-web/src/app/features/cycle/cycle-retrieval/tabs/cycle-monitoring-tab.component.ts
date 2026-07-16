import { Component, Input, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CycleDetailService, TabMasters } from '../../../../core/services/cycle-detail.service';
import { selectAuthToken } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-cycle-monitoring-tab',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cycle-monitoring-tab.component.html',
  styleUrl: './cycle-tab.shared.scss',
})
export class CycleMonitoringTabComponent implements OnInit {
  @Input({ required: true }) cycleId = '';

  private fb = inject(FormBuilder);
  private store = inject(Store);
  private cycleDetail = inject(CycleDetailService);

  loading = true;
  saving = false;
  error = '';
  success = '';
  masters: TabMasters = {
    allergies: [],
    stimProtocols: [],
    fshDrugs: [],
    hmgDrugs: [],
    cloDrugs: [],
    antaDrugs: [],
    otherDrugs: [],
    catheters: [],
  };

  form = this.fb.group({
    day0: this.fb.group({
      date: [''],
      fshDrug1: [0],
      fshDrug1Dose: [0],
      fshDrug2: [0],
      fshDrug2Dose: [0],
      hmgDrug1: [0],
      hmgDrug1Dose: [0],
      hmgDrug2: [0],
      hmgDrug2Dose: [0],
      cloDrug1: [0],
      cloDrug1Dose: [0],
      antaDrug1: [0],
      antaDrug1Dose: [0],
      othDrug1: [0],
      othDrug1Dose: [0],
      gnrha: [0],
      e2: [0],
      lh: [0],
      fsh: [0],
      tsh: [0],
      prol: [0],
      prog: [0],
      remarks: [''],
      ultrasound: [''],
      endometrium: [''],
    }),
    remDays: this.fb.array([]),
  });

  ngOnInit(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token || !this.cycleId) return;
      this.cycleDetail.loadMonitoring(token, this.cycleId).subscribe({
        next: (res) => {
          const { data, masters } = res.data;
          if (masters) this.masters = masters;
          this.form.patchValue({ day0: data.day0 });
          this.remDays.clear();
          (data.remDays || []).forEach((d) => this.remDays.push(this.createRemDayGroup(d)));
          if (!this.remDays.length) this.addRemDay();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load monitoring chart.';
          this.loading = false;
        },
      });
    });
  }

  get remDays(): FormArray {
    return this.form.get('remDays') as FormArray;
  }

  createRemDayGroup(data?: Partial<{ day: number; date: string; fshDrug1: number; fshDrug2: number; hmgDrug1: number; hmgDrug2: number; e2: number; lh: number; follicleLeft: number; follicleRight: number; endometrium: string; remarks: string; hcg: boolean }>) {
    return this.fb.group({
      day: [data?.day ?? this.remDays.length + 1],
      date: [data?.date || ''],
      fshDrug1: [data?.fshDrug1 || 0],
      fshDrug2: [data?.fshDrug2 || 0],
      hmgDrug1: [data?.hmgDrug1 || 0],
      hmgDrug2: [data?.hmgDrug2 || 0],
      cloDrug1: [0],
      antaDrug1: [0],
      othDrug1: [0],
      e2: [data?.e2 || 0],
      lh: [data?.lh || 0],
      fsh: [0],
      gnrha: [0],
      follicleLeft: [data?.follicleLeft || 0],
      follicleRight: [data?.follicleRight || 0],
      endometrium: [data?.endometrium || ''],
      remarks: [data?.remarks || ''],
      hcg: [data?.hcg || false],
      hcgDose: [0],
      ultrasound: [''],
    });
  }

  addRemDay(): void {
    this.remDays.push(this.createRemDayGroup());
  }

  save(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token) return;
      this.saving = true;
      this.error = '';
      this.success = '';
      this.cycleDetail.saveMonitoring(token, this.cycleId, this.form.value as never).subscribe({
        next: (res) => {
          this.success = res.message;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save monitoring chart.';
          this.saving = false;
        },
      });
    });
  }
}
