import { Component, Input, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CycleDetailService, TabMasters } from '../../../../core/services/cycle-detail.service';
import { selectAuthToken } from '../../../../store/auth/auth.selectors';

@Component({
  selector: 'app-cycle-history-tab',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cycle-history-tab.component.html',
  styleUrl: './cycle-tab.shared.scss',
})
export class CycleHistoryTabComponent implements OnInit {
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
    height: [0],
    weight: [0],
    bmi: [0],
    allergyId: [0],
    medSurHistory: [''],
    isg: [0],
    isp: [0],
    isAb: [0],
    isEct: [0],
    isDuration: [0],
    findings: this.fb.group({
      idiopathic: [false],
      if: [false],
      mf: [false],
      dor: [false],
      ovu: [false],
      tf: [false],
      cf: [false],
      endo: [false],
      other: [false],
    }),
    endoOpt: [0],
    otherTxt: [''],
    indication: [''],
    hlmp: [''],
    hsg: [''],
    stimProtId: [0],
    attemptCount: [0],
    attemptPrev: [0],
    attemptEw: [0],
    currentDate: [''],
    comments: [''],
    historyAttempts: this.fb.array([]),
  });

  ngOnInit(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token || !this.cycleId) return;
      this.loading = true;
      this.cycleDetail.loadHistory(token, this.cycleId).subscribe({
        next: (res) => {
          const { data, masters } = res.data;
          if (masters) this.masters = masters;
          this.form.patchValue({
            height: data.height,
            weight: data.weight,
            bmi: data.bmi,
            allergyId: data.allergyId,
            medSurHistory: data.medSurHistory,
            isg: data.isg,
            isp: data.isp,
            isAb: data.isAb,
            isEct: data.isEct,
            isDuration: data.isDuration,
            findings: data.findings,
            endoOpt: data.endoOpt,
            otherTxt: data.otherTxt,
            indication: data.indication,
            hlmp: data.hlmp,
            hsg: data.hsg,
            stimProtId: data.stimProtId,
            attemptCount: data.attemptCount,
            attemptPrev: data.attemptPrev,
            attemptEw: data.attemptEw,
            currentDate: data.currentDate,
            comments: data.comments,
          });
          this.historyAttempts.clear();
          (data.historyAttempts || []).forEach((a) => this.historyAttempts.push(this.createAttemptGroup(a)));
          if (!this.historyAttempts.length) this.addAttempt();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load history.';
          this.loading = false;
        },
      });
    });
  }

  get historyAttempts(): FormArray {
    return this.form.get('historyAttempts') as FormArray;
  }

  createAttemptGroup(data?: Partial<{ cycleDate: string; ivf: boolean; icsi: boolean; stimProtId: number; lmp: string; stimDetails: string; he2: number; prgs: number; lh: number; hcg: string; ovum: string; oocytes: number; fertilized: number; remark: string }>) {
    return this.fb.group({
      cycleDate: [data?.cycleDate || ''],
      ivf: [data?.ivf || false],
      icsi: [data?.icsi || false],
      stimProtId: [data?.stimProtId || 0],
      lmp: [data?.lmp || ''],
      stimDetails: [data?.stimDetails || ''],
      he2: [data?.he2 || 0],
      prgs: [data?.prgs || 0],
      lh: [data?.lh || 0],
      hcg: [data?.hcg || ''],
      ovum: [data?.ovum || ''],
      oocytes: [data?.oocytes || 0],
      fertilized: [data?.fertilized || 0],
      remark: [data?.remark || ''],
    });
  }

  addAttempt(): void {
    this.historyAttempts.push(this.createAttemptGroup());
  }

  calcBmi(): void {
    const h = Number(this.form.get('height')?.value) / 100;
    const w = Number(this.form.get('weight')?.value);
    if (h > 0 && w > 0) {
      this.form.patchValue({ bmi: Math.round((w / (h * h)) * 10) / 10 });
    }
  }

  save(): void {
    this.store.select(selectAuthToken).subscribe((token) => {
      if (!token) return;
      this.saving = true;
      this.error = '';
      this.success = '';
      this.cycleDetail.saveHistory(token, this.cycleId, this.form.value as never).subscribe({
        next: (res) => {
          this.success = res.message;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save history.';
          this.saving = false;
        },
      });
    });
  }
}
