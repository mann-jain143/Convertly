/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3ff',
          500: '#5b7cff',
          600: '#4f67ff',
          700: '#3f52ea'
        }
      },
      boxShadow: {
        glow: '0 12px 50px rgba(84, 124, 255, 0.35)',
        soft: '0 10px 35px rgba(17, 24, 39, 0.12)'
      }
    },
  },
  plugins: [],
};
