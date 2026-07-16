import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-module-page',
  standalone: true,
  template: `
    <div class="module-page">
      <div class="module-card">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        @if (note) {
          <p class="note">{{ note }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .module-page { padding: 8px 0; }
    .module-card {
      background: #fff;
      border-radius: 16px;
      padding: 32px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      max-width: 720px;
    }
    h1 { margin: 0 0 12px; color: #2e7d32; font-size: 22px; }
    p { color: #4b5563; line-height: 1.6; margin: 0 0 12px; }
    .note { font-size: 13px; color: #6b7280; background: #f3faf4; padding: 12px 16px; border-radius: 10px; border: 1px solid #c8e6c9; }
  `],
})
export class ModulePageComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] ?? 'Module';
  description = this.route.snapshot.data['description'] ?? '';
  note = this.route.snapshot.data['note'] ?? '';
}
