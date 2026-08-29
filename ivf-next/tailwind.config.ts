import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#0d9488',
          light: '#ccfbf1',
          primary: '#14b8a6',
          dark: '#0f766e',
          border: '#0d9488',
          ink: '#0b1f1c',
          mist: '#f0fdfa',
          rose: '#fb7185',
          cream: '#faf8f5',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-jakarta)', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(13, 148, 136, 0.25)',
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 4px rgba(20, 184, 166, 0.15)',
      },
      backgroundImage: {
        'mesh-teal':
          'radial-gradient(at 20% 20%, rgba(20,184,166,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(251,113,133,0.18) 0px, transparent 45%), radial-gradient(at 50% 100%, rgba(45,212,191,0.2) 0px, transparent 50%)',
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
