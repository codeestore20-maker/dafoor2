
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        school: {
          board: '#2D5F3F', // Chalkboard green
          paper: '#FFF8E7', // Paper cream
          pencil: '#F4D03F', // Pencil yellow
          eraser: '#FFB6C1', // Eraser pink
          chalk: '#F5F5F5', // Chalk white
          graphite: '#4A4A4A', // Text gray
          red: '#D32F2F', // Margin red
          blue: '#1976D2', // Line blue
        }
      },
      fontFamily: {
        hand: ['"Patrick Hand"', 'cursive'],
        serif: ['Georgia', 'serif'],
      },
      backgroundImage: {
        'paper-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'chalk-pattern': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
