/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#3B2182',
        deep: '#280071',
        cream: '#F9F7F2',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif SC', 'serif'],
      },
      letterSpacing: {
        'widest-plus': '0.6em',
      },
    },
  },
  plugins: [],
}

