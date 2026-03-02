/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        surface2: '#1a1a24',
        accent: '#c8f55a',
        accent2: '#ff6b6b',
        accent3: '#5a9cf5',
        accent4: '#b5a9f5',
        text: '#f0f0f5',
        muted: '#6b6b80',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};