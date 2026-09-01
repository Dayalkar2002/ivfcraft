import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ferti: {
          navy: '#181d38',
          navydark: '#101427',
          purple: '#6b46c1',
          purplelight: '#7c3aed',
          purplesoft: '#ede9fe',
          bg: '#f4f6fa',
          pink: '#ec4899',
          pinklight: '#fce7f3',
          teal: '#0d9488',
          teallight: '#ccfbf1',
          blue: '#2563eb',
          bluelight: '#dbeafe',
          orange: '#ea580c',
          orangelight: '#ffedd5',
          green: '#16a34a',
          greenlight: '#dcfce7',
        },
        brand: {
          green: '#0d9488',
          light: '#ccfbf1',
          primary: '#6b46c1',
          dark: '#181d38',
          border: '#e2e8f0',
          ink: '#101427',
          mist: '#f4f6fa',
          rose: '#ec4899',
          cream: '#faf8f5',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-jakarta)', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(107, 70, 193, 0.25)',
        card: '0 4px 20px -2px rgba(24, 29, 56, 0.06)',
        glow: '0 0 0 4px rgba(107, 70, 193, 0.15)',
      },
      backgroundImage: {
        'mesh-ferti':
          'radial-gradient(at 20% 20%, rgba(107,70,193,0.18) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(236,72,153,0.15) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(37,99,235,0.12) 0px, transparent 50%)',
        'login-bg':
          'linear-gradient(135deg, #101427 0%, #181d38 35%, #2a2155 70%, #1e1b4b 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
