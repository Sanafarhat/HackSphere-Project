/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f7f4', // Warm white / ivory
        foreground: '#0f1014', // Near-black / ink
        muted: '#e5e3db', // Soft gray
        mutedForeground: '#6a6b70',
        accent: {
          DEFAULT: '#ff4d00', // Vibrant high-energy orange/crimson (Tech accent)
          hover: '#e64500',
          light: '#ffaa80',
        },
        dark: {
          900: '#0f1014',
          800: '#1a1b22',
          700: '#272933',
          600: '#3a3c4a',
          500: '#6a6b70',
        },
        light: {
          900: '#f8f7f4',
          800: '#f0efe9',
          700: '#e5e3db',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee2': 'marquee2 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
