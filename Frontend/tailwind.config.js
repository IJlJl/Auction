/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          950: '#0D060A', 
          900: '#140A10', 
          800: '#1C0E17', 
          700: '#2A1523', 
        },
        rosegold: {
          300: '#FDA4AF', 
          400: '#FB7185', 
          500: '#F43F5E', 
          600: '#E11D48',
        },
        champagne: {
          300: '#FDE68A', 
          400: '#FBBF24',
        }
      },
    },
  },
  plugins: [],
}