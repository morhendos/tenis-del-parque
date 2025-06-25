/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'parque-purple': '#563380',
        'parque-green': '#8FBF60',
        'parque-yellow': '#E6E94E',
        'parque-bg': '#d6dcc5',
      },
      fontFamily: {
        'sans': ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-raleway)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}