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
      animation: {
        'tennis-bounce': 'tennis-bounce 0.5s infinite',
        'tennis-shadow': 'tennis-shadow 0.5s infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'tennis-bounce': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.5, 1)',
          },
          '50%': { 
            transform: 'translateY(-20px)',
            animationTimingFunction: 'cubic-bezier(0.5, 0, 1, 1)',
          },
        },
        'tennis-shadow': {
          '0%, 100%': { 
            transform: 'scaleX(1)',
            opacity: '0.5',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.5, 1)',
          },
          '50%': { 
            transform: 'scaleX(0.5)',
            opacity: '0.2',
            animationTimingFunction: 'cubic-bezier(0.5, 0, 1, 1)',
          },
        },
        'slide-up': {
          '0%': { 
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}