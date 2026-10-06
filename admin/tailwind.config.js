/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veyra: {
          charcoal: '#121212',
          ivory: '#F9F7F1',
          gold: '#D4AF37',
          emerald: '#107C41'
        }
      }
    },
  },
  plugins: [],
}
