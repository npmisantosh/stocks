/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '9px',
        'xs':  '10px',
        'sm':  '11px',
        'base':'12px',
        'md':  '13px',
        'lg':  '14px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      colors: {
        bg: {
          DEFAULT:  '#000000',
          card:     '#0a0a0a',
          elevated: '#111111',
          hover:    '#141414',
        },
        border: {
          DEFAULT:  '#1e1e1e',
          bright:   '#2a2a2a',
        },
        green: {
          DEFAULT: '#00ff88',
          dim:     '#00cc6a',
        },
        red: {
          DEFAULT: '#ff3b3b',
          dim:     '#cc2f2f',
        },
        amber: {
          DEFAULT: '#ffcc00',
          dim:     '#cca300',
        },
        blue:   '#00aaff',
        purple: '#aa77ff',
        text: {
          DEFAULT:  '#e0e0e0',
          dim:      '#777777',
          bright:   '#ffffff',
        },
      },
      boxShadow: {
        'glow-green': '0 0 12px rgba(0, 255, 136, 0.25)',
        'glow-red':   '0 0 12px rgba(255, 59, 59, 0.25)',
        'glow-amber': '0 0 12px rgba(255, 204, 0, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.03)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink':      'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}