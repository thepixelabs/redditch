import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        re: {
          red:        '#B5121B',
          'red-deep': '#7B0D1E',
          black:      '#1A1A1A',
          surface:    '#242424',
          gold:       '#C8962C',
          'gold-muted': '#9E7F3C',
          cream:      '#F5ECD7',
          'cream-warm': '#EDE0C8',
          silver:     '#B0B3B8',
          gunmetal:   '#4A4A4A',
          'text-dark': '#F0EDE8',
          'text-light': '#1A1A1A',
        },
        urgency: {
          good:  '#22c55e',
          soon:  '#E6A817',
          over:  '#FF4D4D',
          'good-light': '#16a34a',
          'soon-light': '#b45309',
          'over-light': '#B5121B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'splash-fade': 'splashFade 2.2s ease-in-out forwards',
        'ring-expand': 'ringExpand 1.4s ease-out forwards',
        'needle-sweep': 'needleSweep 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        splashFade: {
          '0%, 70%': { opacity: '1', pointerEvents: 'all' },
          '100%':    { opacity: '0', pointerEvents: 'none' },
        },
        ringExpand: {
          '0%':   { strokeDashoffset: '502' },
          '100%': { strokeDashoffset: '0' },
        },
        needleSweep: {
          '0%':   { transform: 'rotate(-135deg)' },
          '100%': { transform: 'rotate(var(--needle-angle))' },
        },
      },
    },
  },
  plugins: [],
}

export default config
