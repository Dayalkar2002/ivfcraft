export function NavIcon({ name, className = 'h-4 w-4' }: { name?: string; className?: string }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case 'patient':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
    case 'iui':
    case 'cycle':
    case 'ivf':
    case 'icsi':
    case 'et':
    case 'bt':
      return (
        <svg {...props}>
          <path d="M12 3v6" />
          <path d="M8 7h8" />
          <path d="M7 13a5 5 0 0 0 10 0V9H7v4z" />
          <path d="M9 21h6" />
        </svg>
      );
    case 'cryo':
      return (
        <svg {...props}>
          <path d="M12 2v20M4.9 6.5l14.2 11M4.9 17.5l14.2-11" />
        </svg>
      );
    case 'consent':
      return (
        <svg {...props}>
          <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </svg>
      );
    case 'reports':
    case 'billing':
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15v-4" />
          <path d="M12 15V8" />
          <path d="M16 15v-6" />
        </svg>
      );
    case 'media':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="12" r="2" />
          <path d="M13 15l3-3 3 3" />
        </svg>
      );
    case 'sms':
      return (
        <svg {...props}>
          <path d="M4 5h16v11H8l-4 3V5z" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 19c.8-3 3-4.5 6-4.5s5.2 1.5 6 4.5" />
          <path d="M15 14.5c1.8.2 3.4 1.2 4 3.5" />
        </svg>
      );
    case 'settings':
    case 'masters':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
        </svg>
      );
    case 'inventory':
      return (
        <svg {...props}>
          <path d="M4 7h16v12H4z" />
          <path d="M8 7V5h8v2" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
