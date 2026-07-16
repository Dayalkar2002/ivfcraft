import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    @if (visible) {
      <div class="loader-overlay">
        <div class="loader-box">
          <div class="spinner"></div>
          <p>{{ message }}</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 39, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }
    .loader-box {
      background: #fff;
      border-radius: 16px;
      padding: 32px 48px;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0,0,0,0.18);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #2e7d32;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    p {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #43371a;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class LoaderComponent {
  @Input() visible = false;
  @Input() message = 'Please wait...';
}
