/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'calligraphy': ['MaShanZheng-Regular', 'cursive'],
      },
      colors: {
        'faction-blue': '#3b82f6',
        'faction-cyan': '#06b6d4',
        'faction-indigo': '#6366f1',
        'faction-emerald': '#10b981',
        'faction-amber': '#f59e0b',
        'faction-orange': '#f97316',
        'faction-rose': '#f43f5e',
        'faction-purple': '#a855f7',
      }
    },
  },
  plugins: [],
}
