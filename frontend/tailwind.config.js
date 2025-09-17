/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#4169e1',
        'sky-blue': '#87ceeb',
      },
    },
  },
  plugins: [],
};
