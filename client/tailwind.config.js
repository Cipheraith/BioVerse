const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
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
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-bottom': 'slideInBottom 0.8s ease-out',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'rotate-in': 'rotateIn 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' }
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(100%) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-200deg) scale(0)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(67, 233, 123, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(67, 233, 123, 0.6), 0 0 80px rgba(90, 103, 216, 0.3)' }
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        morph: {
          '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' }
        }
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      screens: {
        'xs': '480px',
        '3xl': '1600px',
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

