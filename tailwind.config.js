/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-bg-elevated)',
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        card: 'var(--color-card)',
      },
      borderRadius: {
        lum: 'var(--size-radius)',
      },
    },
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1152px',
      },
    },
  },
  plugins: [],
};
