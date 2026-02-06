/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        energy: {
          solar: '#f59e0b',
          wind: '#3b82f6',
          gas: '#ef4444',
          nuclear: '#8b5cf6',
          hydro: '#06b6d4',
          coal: '#6b7280',
        },
      },
    },
  },
  plugins: [],
}
