const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        // Modern & Vibrant Palette
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#5A67D8', // A vibrant, deep blue
          text: '#FFFFFF', // For text on primary backgrounds
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfae7',
          200: '#baf4cf',
          300: '#8ee9af',
          400: '#5cd18a',
          500: '#34b96e',
          600: '#23a25b',
          700: '#1a824a',
          800: '#15673c',
          900: '#115231',
          DEFAULT: '#48BB78', // A fresh, vibrant green
          text: '#FFFFFF', // For text on secondary backgrounds
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#ECC94B', // A warm, inviting yellow
          text: '#333333', // For text on accent backgrounds
        },
        success: {
          DEFAULT: '#48BB78', // Green for success messages
          dark: '#38A169',
        },
        background: '#F7FAFC', // Light background
        card: '#FFFFFF', // White card backgrounds
        text: '#2D3748', // Dark gray for primary text
        muted: '#718096', // Muted gray for secondary text
        border: '#E2E8F0', // Light border color
        input: '#FFFFFF', // White input background
        ring: '#5A67D8', // Focus ring matches primary blue
        destructive: {
          DEFAULT: '#E53E3E', // Standard red for errors
          dark: '#C53030',
        },
        // Dark Mode Palette
        'dark-background': '#1A202C', // Deep dark gray
        'dark-card': '#2D3748', // Slightly lighter dark gray
        'dark-text': '#E2E8F0', // Light gray for primary text
        'dark-muted': '#A0AEC0', // Muted light gray for secondary text
        'dark-border': '#4A5568', // Darker border color
        'dark-input': '#2D3748', // Dark input background
        'dark-ring': '#667EEA', // Focus ring matches primary blue in dark mode
        'dark-destructive': '#FC8181', // Red for errors in dark mode
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [
    require('./tailwind-text-shadow'),
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      })
    }
  ],
};

