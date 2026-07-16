import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getMasterColumns } from '../master-registry';

@Component({
  selector: 'app-masters-hub',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="masters-hub">
      <h1>Master</h1>
      <p class="hint">Select a master module below — same list as the legacy smART Master menu.</p>
      <div class="columns">
        @for (column of columns; track $index) {
          <div class="column">
            @for (item of column; track item.route) {
              <a [routerLink]="item.route">{{ item.label }}</a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .masters-hub { padding: 8px 0; }
    h1 { margin: 0 0 8px; color: #2e7d32; font-size: 22px; }
    .hint { color: #6b7280; margin: 0 0 16px; font-size: 13px; }
    .columns {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .column { display: flex; flex-direction: column; gap: 4px; }
    .column a {
      padding: 6px 8px;
      color: #1f2937;
      text-decoration: none;
      font-size: 13px;
      border-radius: 6px;
    }
    .column a:hover { background: #f3faf4; color: #2e7d32; }
    @media (max-width: 900px) {
      .columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  `],
})
export class MastersHubComponent {
  columns = getMasterColumns();
}
