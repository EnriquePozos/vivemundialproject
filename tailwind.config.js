/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'fifa-light': ['FWC-Light', 'sans-serif'],
        'fifa-black': ['FWC-Black', 'sans-serif'],
      }
    },
  },
  plugins: [],
}