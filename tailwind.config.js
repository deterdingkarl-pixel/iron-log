/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0F1512',
          raised: '#161E1A',
          overlay: '#1D2721',
          border: '#26332C',
        },
        ink: {
          DEFAULT: '#EAF0EC',
          muted: '#9DB0A6',
          faint: '#5E7267',
        },
        accent: {
          DEFAULT: '#5EEAD4',
          strong: '#2DD4BF',
          soft: '#134E4A',
        },
        warn: '#F5A97F',
        good: '#86EFAC',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 20px -12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
