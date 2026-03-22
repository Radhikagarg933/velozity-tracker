/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        base: {
          950: '#05080f',
          900: '#0d1117',
          800: '#161b24',
          700: '#1e2530',
          600: '#2a3340',
          500: '#3d4b5c',
          400: '#5a6a7e',
          300: '#8294a8',
          200: '#aebdcc',
          100: '#d1dae4',
          50: '#eef2f7',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
      },
    },
  },
  plugins: [],
}
