/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#4169E1',
        'sky-blue': '#87CEEB',
        'royal-blue-dark': '#2E4A8A',
        'sky-blue-light': '#B0E0E6',
      },
    },
  },
  plugins: [],
};
