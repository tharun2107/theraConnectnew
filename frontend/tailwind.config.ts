import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional Black & White Theme for Child Therapy Platform
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#4D4D4D',
        },
        gray: {
          icon: '#B3B3B3',
          border: '#E6E6E6',
        },
        background: '#F9F9F9',
        card: '#FFFFFF',
        cta: {
          DEFAULT: '#000000',
          hover: '#1A1A1A',
        },
        accent: {
          blue: '#A7C7E7',
          green: '#C8E6C9',
        },
        // Keep these for compatibility with existing code
        primary: {
          DEFAULT: '#1A1A1A',
          50: '#F9F9F9',
          100: '#E6E6E6',
          200: '#B3B3B3',
          300: '#4D4D4D',
          400: '#1A1A1A',
          500: '#1A1A1A',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        secondary: {
          DEFAULT: '#4D4D4D',
          50: '#F9F9F9',
          100: '#E6E6E6',
          200: '#B3B3B3',
          300: '#4D4D4D',
          400: '#1A1A1A',
          500: '#1A1A1A',
          600: '#000000',
        },
        border: '#E6E6E6',
        input: '#E6E6E6',
        ring: '#B3B3B3',
        foreground: '#1A1A1A',
        destructive: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F9F9F9',
          foreground: '#4D4D4D',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'gentle': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'calm': '0 6px 20px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
