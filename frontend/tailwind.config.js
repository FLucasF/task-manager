/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#121212',
          surface: '#1A1A1A',
          surfaceElevated: '#202020',
          surfaceHover: '#262626',
          border: '#333333',
          textPrimary: '#F5F5F5',
          textSecondary: '#C7C7C7',
          textMuted: '#9CA3AF',
          accent: '#60A5FA',
          accentHover: '#93C5FD',
          accentActive: '#3B82F6',
          danger: '#F87171',
          dangerSurface: '#3A1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
