/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(100vw + 128px))' }
        }
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
