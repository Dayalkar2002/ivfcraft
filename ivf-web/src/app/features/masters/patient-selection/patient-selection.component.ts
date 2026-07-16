import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-selection-master',
  standalone: true,
  template: `
    <div class="master-page">
      <div class="master-card">
        <h1>Patient Selection</h1>
        <p>The patient selection window should appear automatically. Opening it now…</p>
        <p class="hint">If it does not open, use the <strong>Select Patient</strong> button in the patient bar.</p>
      </div>
    </div>
  `,
  styles: [`
    .master-page { padding: 8px 0; }
    .master-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 640px; }
    h1 { margin: 0 0 12px; color: #2e7d32; font-size: 20px; }
    p { color: #4b5563; line-height: 1.6; margin: 0 0 10px; }
    .hint { font-size: 13px; color: #6b7280; }
  `],
})
export class PatientSelectionMasterComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(['/dashboard'], { queryParams: { selectPatient: '1' } });
  }
}
