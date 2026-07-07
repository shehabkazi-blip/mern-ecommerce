/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14231c',
        canvas: '#f6f4ee',
        moss: {
          50: '#f1f6f2',
          100: '#dcebe0',
          300: '#94c2a3',
          500: '#3f7a56',
          600: '#2f6444',
          700: '#254f37',
          900: '#132b1d',
        },
        clay: '#c8623f',
        sand: '#e4ddc9',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(20, 35, 28, 0.06)',
      },
    },
  },
  plugins: [],
};
