/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1a1d23',   
          blue: '#00a8cc',   
          hover: '#008fb0',
        }
      }
    },
  },
  plugins: [],
}