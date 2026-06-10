/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      colors: {
        'pgo-blue': '#2979ff',
        'pgo-purple': '#aa00ff',
        'pgo-orange': '#ff6d00',
        'pgo-gray': '#9e9e9e',
      },
    },
  },
  plugins: [],
};
