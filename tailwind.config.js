/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        accent: '#2590ff',
        accentHover: '#90f6ff',
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
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scroll': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
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
        'slide-in': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'holographic': 'holographic 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'scroll': 'scroll 20s linear infinite',
        'blink': 'blink 1s infinite',
        'slide-in': 'slide-in 0.5s ease-out forwards',
      },
      boxShadow: {
        'custom': '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        'custom-light': '0 25px 50px -12px rgba(37, 144, 255, 0.2)',
      },
      backdropBlur: {
        xl: '20px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
