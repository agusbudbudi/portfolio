/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        'pulse-green': {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '70%': {
            transform: 'scale(2.5)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '0',
          },
        },
        'holographic': {
          '0%': { backgroundPosition: '-150% -150%' },
          '100%': { backgroundPosition: '150% 150%' },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'blink': {
          '0%, 50%, 100%': {
            opacity: '1',
          },
          '25%, 75%': {
            opacity: '0.5',
          },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'holographic': 'holographic 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'blink': 'blink 1s infinite',
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
};
