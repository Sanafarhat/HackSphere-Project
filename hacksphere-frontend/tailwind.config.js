/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e5deff',
          300: '#d4c7ff',
          400: '#c4b5ff',
          500: '#b19cff',
          600: '#a085ff',
          700: '#8b6fff',
          800: '#7659e6',
          900: '#5f42b3',
        },
        accent: {
          50: '#fffef5',
          100: '#fffce6',
          200: '#fff9cc',
          300: '#fff0b3',
          400: '#ffe699',
          500: '#f0d94d',
          600: '#e6c200',
          700: '#d4a800',
          800: '#bf9200',
          900: '#a67d00',
        },
        dark: {
          900: '#0a0d1a',
          800: '#1a1d2e',
          700: '#252a3e',
          600: '#3a3f52',
          500: '#505662',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-in-out',
        slideUp: 'slideUp 0.6s ease-out',
        slideDown: 'slideDown 0.4s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
