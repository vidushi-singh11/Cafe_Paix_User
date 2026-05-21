import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#1A1209',
          100: '#2D1F0F',
          200: '#4A3418',
          300: '#6B4E2C',
          400: '#8B6B3D',
          500: '#A8854A',
          600: '#C4A060',
          700: '#D9B97A',
          800: '#EBD4A0',
          900: '#F5E6D3',
        },
        cafe: {
          bg: '#0D0B0A',
          'bg-dark': '#161210',
          'bg-mid': '#1E1915',
          'bg-light': '#262019',
          border: '#3D2E20',
          'border-light': '#5C4530',
          text: '#F5E6D3',
          'text-secondary': '#C4A882',
          'text-muted': '#8B7355',
          'text-disabled': '#5C4D3D',
          success: '#7A9E6B',
          warning: '#B8954E',
          danger: '#B85450'
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'full': '9999px',
      }
    },
  },
  plugins: [],
};
export default config;
