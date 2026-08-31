/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#090b0e',
          900: '#0e1117',
          850: '#141820',
          800: '#1a1f2c',
          700: '#262d3d',
          600: '#384259',
        },
        racing: {
          red: '#e10600',
          redGlow: 'rgba(225, 6, 0, 0.35)',
          yellow: '#ffb800',
          yellowGlow: 'rgba(255, 184, 0, 0.35)',
          green: '#00d2be',
          greenGlow: 'rgba(0, 210, 190, 0.35)',
          purple: '#b138dd',
          blue: '#1e88e5'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
