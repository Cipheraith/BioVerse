const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // 🧬 BIOVERSE COLOR SYSTEM - Modern Medical/Scientific UI
        // Pure blacks and whites for maximum contrast
        black: '#000000',
        white: '#ffffff',
        
        // BioVerse Primary Teal - Main brand color
        bioverse: {
          50: '#eefcfb',
          100: '#d5f5f4',
          200: '#aeecea',
          300: '#79ddd9',
          400: '#40c9c4',
          500: '#26b5b0', // BioVerse signature teal
          600: '#1d9891',
          700: '#1a7c77',
          800: '#1a6461',
          900: '#1a5352',
          950: '#0a3534',
          DEFAULT: '#26b5b0',
        },
        
        // Deep Scientific Blue - Secondary color
        deepblue: {
          50: '#edf5ff',
          100: '#d6e6ff',
          200: '#b3d1ff',
          300: '#80b3ff',
          400: '#4d8bf9',
          500: '#3366ff', // Deep scientific blue
          600: '#1a4dff',
          700: '#173be0',
          800: '#1933b6',
          900: '#1c3191',
          950: '#101c56',
          DEFAULT: '#3366ff',
        },
        
        // Premium dark grays (scientific app style)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // Dark card background
          850: '#1a202c', // Slightly darker
          900: '#111827', // Main dark background
          925: '#0d1117', // GitHub dark
          950: '#030712', // Almost black
          DEFAULT: '#6b7280',
        },
        
        // Primary color - consistent teal across app (ALL BUTTONS USE THIS)
        primary: {
          50: '#eefcfb',
          100: '#d5f5f4',
          200: '#aeecea',
          300: '#79ddd9',
          400: '#40c9c4',
          500: '#26b5b0', // BioVerse teal - MAIN BUTTON COLOR
          600: '#1d9891',
          700: '#1a7c77',
          800: '#1a6461',
          900: '#1a5352',
          950: '#0a3534',
          DEFAULT: '#26b5b0',
        },
        
        // Secondary deep blue color
        secondary: {
          50: '#edf5ff',
          100: '#d6e6ff',
          200: '#b3d1ff',
          300: '#80b3ff',
          400: '#4d8bf9',
          500: '#3366ff', // Scientific blue
          600: '#1a4dff',
          700: '#173be0',
          800: '#1933b6',
          900: '#1c3191',
          950: '#101c56',
          DEFAULT: '#3366ff',
        },
        
        // Accent purple color
        accent: {
          50: '#f5f3ff',
          100: '#ede8ff',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Scientific purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: '#8b5cf6',
        },
        
        // Status colors - using BioVerse palette
        success: {
          50: '#ecfdf5',
          100: '#d1fadf',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // BioVerse success
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          DEFAULT: '#10b981',
        },
        danger: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // BioVerse danger
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
          DEFAULT: '#f43f5e',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // BioVerse warning
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
          DEFAULT: '#eab308',
        },
        info: {
          50: '#edf5ff',
          100: '#d6e6ff',
          200: '#b3d1ff',
          300: '#80b3ff',
          400: '#4d8bf9',
          500: '#3366ff', // Same as secondary/deepblue for consistency
          600: '#1a4dff',
          700: '#173be0',
          800: '#1933b6',
          900: '#1c3191',
          950: '#101c56',
          DEFAULT: '#3366ff',
        },
        
        // Light Mode Colors
        background: '#ffffff',
        'background-secondary': '#f8fafc',
        'background-tertiary': '#f1f5f9',
        card: '#ffffff',
        surface: '#f8fafc',
        overlay: '#f1f5f9',
        text: '#1e293b',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        'text-disabled': '#cbd5e1',
        border: '#e2e8f0',
        'border-light': '#f1f5f9',
        divider: '#e2e8f0',
        input: '#ffffff',
        ring: '#26b5b0', // BioVerse teal
        
        // 🧬 BIOVERSE DARK MODE COLORS - Scientific UI
        'dark-background': '#000000',           // Pure black background
        'dark-background-secondary': '#0a1a1a', // Very dark teal-tinted black
        'dark-background-tertiary': '#101e1f',  // Slightly lighter
        'dark-card': '#121c20',                 // Card background with teal tint
        'dark-surface': '#1a2428',              // Surface elements
        'dark-overlay': '#1c2a2e',              // Overlays
        'dark-text': '#ffffff',                 // Pure white text
        'dark-text-secondary': '#ecfeff',       // Secondary text with teal tint
        'dark-text-muted': '#d1e5e7',           // Muted text
        'dark-text-disabled': '#9cb0b3',        // Disabled text
        'dark-border': '#1d3538',               // Borders with teal tint
        'dark-border-light': '#274950',         // Light borders
        'dark-divider': '#223c3f',              // Dividers
        'dark-input': '#0f2226',                // Input backgrounds
        'dark-ring': '#26b5b0',                 // Focus rings - BioVerse teal
        
        // BioVerse Glass Colors
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-black': 'rgba(0, 0, 0, 0.1)',
        'glass-primary': 'rgba(38, 181, 176, 0.1)', // BioVerse teal glass
        'glass-secondary': 'rgba(51, 102, 255, 0.1)', // Deep blue glass
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
        '5xl': ['48px', '52px'],
        '6xl': ['60px', '64px'],
        '7xl': ['72px', '76px'],
        '8xl': ['96px', '100px'],
        '9xl': ['128px', '132px'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'none': '0',
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        
        // BioVerse glow effects
        'glow-sm': '0 0 10px rgba(38, 181, 176, 0.3)', // BioVerse teal glow
        'glow-md': '0 0 20px rgba(38, 181, 176, 0.4)',
        'glow-lg': '0 0 40px rgba(38, 181, 176, 0.5)',
        'glow-xl': '0 0 60px rgba(38, 181, 176, 0.6)',
        
        // Dark mode shadows
        'dark-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-bottom': 'slideInBottom 0.8s ease-out',
        'slide-in-top': 'slideInTop 0.8s ease-out',
        'bounce-in': 'bounceIn 0.8s ease-out',
        'rotate-in': 'rotateIn 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
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
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
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
        slideInTop: {
          '0%': { opacity: '0', transform: 'translateY(-100%) scale(0.9)' },
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
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(38, 181, 176, 0.3)' }, // BioVerse teal glow
          '50%': { boxShadow: '0 0 40px rgba(38, 181, 176, 0.6), 0 0 80px rgba(51, 102, 255, 0.3)' } // With secondary blue
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
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #26b5b0, #1a7c77)', // BioVerse teal gradient
        'gradient-secondary': 'linear-gradient(135deg, #3366ff, #173be0)', // BioVerse blue gradient
        'gradient-danger': 'linear-gradient(135deg, #f43f5e, #be123c)', // BioVerse danger gradient
        'gradient-warning': 'linear-gradient(135deg, #eab308, #a16207)', // BioVerse warning gradient
        'gradient-dark': 'linear-gradient(135deg, #0a1a1a, #121c20, #1c2a2e)', // BioVerse dark gradient
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'noise': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjkiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')",
      },
      backgroundSize: {
        'noise': '200px 200px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      screens: {
        'xs': '480px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '104': '1.04',
      },
      brightness: {
        '25': '.25',
        '175': '1.75',
      },
      saturate: {
        '25': '.25',
        '175': '1.75',
      },
    },
  },
  plugins: [
    require('./tailwind-text-shadow'),
    function ({ addUtilities, addComponents, theme }) {
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
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.background'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.border'),
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.text-muted'),
          },
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
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
        '.glass-effect': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background': 'rgba(255, 255, 255, 0.1)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background': 'rgba(30, 41, 59, 0.8)',
          'border': '1px solid rgba(71, 85, 105, 0.3)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #26b5b0, #3366ff)', // BioVerse teal to blue
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-secondary': {
          'background': 'linear-gradient(135deg, #3366ff, #8b5cf6)', // BioVerse blue to purple
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.border-gradient': {
          'background': 'linear-gradient(135deg, #26b5b0, #3366ff) border-box', // BioVerse teal to blue
          'border': '2px solid transparent',
          'background-clip': 'padding-box, border-box',
        },
      });

      addComponents({
        '.btn': {
          padding: theme('spacing.2') + ' ' + theme('spacing.4'),
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.sm')[0],
          fontWeight: theme('fontWeight.medium'),
          transitionProperty: theme('transitionProperty.all'),
          transitionDuration: theme('transitionDuration.200'),
          transitionTimingFunction: theme('transitionTimingFunction.in-out'),
          '&:focus': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 2px ${theme('colors.bioverse.500')}`, // BioVerse teal
          },
        },
        '.btn-primary': {
          background: 'linear-gradient(135deg, #26b5b0, #1a7c77)', // BioVerse teal gradient
          color: theme('colors.white'),
          boxShadow: '0 4px 12px rgba(38, 181, 176, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d9891, #1a6461)', // Darker teal on hover
            boxShadow: '0 8px 20px rgba(38, 181, 176, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(38, 181, 176, 0.4)',
          },
        },
        '.btn-secondary': {
          background: theme('colors.background'),
          color: theme('colors.bioverse.500'),
          border: `2px solid ${theme('colors.bioverse.500')}`,
          '&:hover': {
            background: theme('colors.bioverse.50'),
            color: theme('colors.bioverse.600'),
            borderColor: theme('colors.bioverse.600'),
          },
        },
        '.btn-ghost': {
          background: 'transparent',
          color: theme('colors.bioverse.500'),
          '&:hover': {
            background: theme('colors.bioverse.50'),
            color: theme('colors.bioverse.600'),
          },
        },
        '.btn-danger': {
          background: 'linear-gradient(135deg, #f43f5e, #e11d48)', // BioVerse danger gradient
          color: theme('colors.white'),
          boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #e11d48, #be123c)', // Darker on hover
            boxShadow: '0 8px 20px rgba(244, 63, 94, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        '.card': {
          background: theme('colors.card'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.md'),
          border: `1px solid ${theme('colors.border')}`,
          padding: theme('spacing.6'),
          '.dark &': {
            background: theme('colors.dark-card'),
            borderColor: theme('colors.dark-border'),
            boxShadow: theme('boxShadow.dark-md'),
          },
        },
        '.card-glass': {
          backdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          '.dark &': {
            background: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(71, 85, 105, 0.3)',
          },
        },
        '.input': {
          width: '100%',
          padding: theme('spacing.3'),
          borderRadius: theme('borderRadius.md'),
          border: `1px solid ${theme('colors.border')}`,
          background: theme('colors.input'),
          fontSize: theme('fontSize.sm')[0],
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.bioverse.500'),
            boxShadow: `0 0 0 3px ${theme('colors.bioverse.500')}20`,
          },
          '.dark &': {
            background: theme('colors.dark-input'),
            borderColor: theme('colors.dark-border'),
            color: theme('colors.dark-text'),
            '&:focus': {
              borderColor: theme('colors.dark-ring'),
              boxShadow: `0 0 0 3px ${theme('colors.dark-ring')}20`,
            },
          },
        },
      });
    },
  ],
};
