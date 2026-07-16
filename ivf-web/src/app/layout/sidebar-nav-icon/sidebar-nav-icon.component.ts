import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-nav-icon',
  standalone: true,
  template: `
    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      @switch (icon) {
        @case ('dashboard') {
          <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1h-5v-5H10v5H5a1 1 0 01-1-1v-8.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        }
        @case ('patient') {
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('cycle') {
          <path d="M17 7A7 7 0 1110 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10 17l-1.5-3 3.5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        }
        @case ('iui') {
          <path d="M12 3v4M9 7h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8 11c0-2.2 1.8-4 4-4s4 1.8 4 4v2H8v-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M10 17h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('ivf') {
          <path d="M9 3h6v4H9V3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M10 7h4v12a2 2 0 01-4 0V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="12" cy="14" r="1.5" fill="currentColor"/>
        }
        @case ('icsi') {
          <path d="M6 4v16M6 4h3M6 10h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="15" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('et') {
          <path d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="12" cy="11" r="2" stroke="currentColor" stroke-width="1.5"/>
        }
        @case ('bt') {
          <path d="M8 4h8v3H8V4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M10 7v3M14 7v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <ellipse cx="12" cy="15" rx="5" ry="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 18v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('cryo') {
          <rect x="8" y="4" width="8" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 8h4M10 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M9 20h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('inventory') {
          <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M12 11v10M4 7l8 4 8-4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        }
        @case ('billing') {
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 10h16" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('users') {
          <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="16" cy="10" r="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 19c0-2.8 2.2-5 5-5M13 19c0-2.2 1.8-4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('reports') {
          <path d="M6 4h12v16H6V4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M9 14v-4M12 16V8M15 12v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('masters') {
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('stats') {
          <path d="M5 19V11M10 19V7M15 19V13M20 19V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        }
        @case ('media') {
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="10" cy="11" r="1.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 15l4-3 3 2 5-4 4 3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        }
        @case ('sms') {
          <path d="M5 5h14a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3V6a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        }
        @case ('role') {
          <path d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        }
        @default {
          <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5"/>
        }
      }
    </svg>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2e7d32;
      --nav-icon-size: 18px;
    }
    .nav-icon {
      width: var(--nav-icon-size);
      height: var(--nav-icon-size);
      display: block;
    }
  `],
})
export class SidebarNavIconComponent {
  @Input({ required: true }) icon = 'dashboard';
}
