/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#f8ead5',
          100: '#f0d3ac',
          200: '#e8bd82',
          300: '#e0a759',
          400: '#db9a43',
          500: '#d6912f',
          600: '#b67b27',
          700: '#91611f',
          800: '#6d4817',
          900: '#482f10',
        },
        beige: {
          50:  'rgba(0, 0, 0, 0.18)',
          100: 'rgba(255, 255, 255, 0.08)',
          200: 'rgba(255, 255, 255, 0.14)',
          300: 'rgba(255, 255, 255, 0.28)',
          400: 'rgba(255, 255, 255, 0.82)',
        },
        salon: {
          black:       '#000000',
          dark:        '#000000',
          card:        '#111111',
          charcoal:    '#1a1a1a',
          gold:        '#d6912f',
          'gold-light':'#e0a759',
          beige:       '#ffffff',
          white:       '#ffffff',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
