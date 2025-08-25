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
        // 🖤 BIOVERSE MINIMALISTIC DARK SYSTEM
        // Pure blacks and whites for maximum contrast
        black: '#000000',
        white: '#ffffff',
        
        // Charcoal/Slate Primary - ALL BUTTONS USE THIS SUBTLE COLOR
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Main charcoal for buttons
          600: '#475569', // Darker hover state
          700: '#334155', // Even darker for active states
          800: '#1e293b', // Deep charcoal backgrounds
          850: '#0f172a', // Very deep backgrounds
          900: '#0f172a', // Darkest backgrounds
          950: '#020617', // Almost black
          DEFAULT: '#64748b',
        },
        
        // Slate variations for consistency
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Same as charcoal for consistency
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#0f172a',
          900: '#0f172a',
          950: '#020617',
          DEFAULT: '#64748b',
        },
        
        // Primary color - consistent charcoal across ALL interactions
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // ALL BUTTONS USE THIS EXACT COLOR
          600: '#475569', // Hover state
          700: '#334155', // Active/pressed state
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          DEFAULT: '#64748b',
        },
        
        // Secondary - subtle blue for minimal accent use
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Minimal blue accent (used sparingly)
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
          DEFAULT: '#0ea5e9',
        },
        
        // Accent - very subtle purple (minimal use)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Minimal purple accent
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21b6',
          900: '#581c87',
          950: '#3b0764',
          DEFAULT: '#a855f7',
        },
        
        // Status colors - muted and subtle
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Subtle green for success
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: '#22c55e',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Subtle red for errors
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          DEFAULT: '#ef4444',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Subtle amber for warnings
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#f59e0b',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Same as secondary for consistency
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
          DEFAULT: '#0ea5e9',
        },
        
        // Light Mode Colors (minimal use - app is primarily dark)
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
        ring: '#64748b', // Charcoal focus rings
        
        // 🖤 BIOVERSE MINIMALISTIC DARK MODE COLORS
        'dark-background': '#000000',           // Pure black main background
        'dark-background-secondary': '#020617', // Almost black secondary
        'dark-background-tertiary': '#0f172a',  // Deep charcoal tertiary
        'dark-card': '#0f172a',                 // Card backgrounds
        'dark-surface': '#1e293b',              // Surface elements
        'dark-overlay': '#334155',              // Overlay elements
        'dark-text': '#f8fafc',                 // Almost white text
        'dark-text-secondary': '#e2e8f0',       // Secondary text
        'dark-text-muted': '#cbd5e1',           // Muted text
        'dark-text-disabled': '#94a3b8',        // Disabled text
        'dark-border': '#334155',               // Subtle borders
        'dark-border-light': '#475569',         // Slightly lighter borders
        'dark-divider': '#1e293b',              // Subtle dividers
        'dark-input': '#1e293b',                // Input backgrounds
        'dark-ring': '#64748b',                 // Focus rings - charcoal
        
        // Minimal glass effects
        'glass-white': 'rgba(248, 250, 252, 0.05)',
        'glass-black': 'rgba(0, 0, 0, 0.3)',
        'glass-primary': 'rgba(100, 116, 139, 0.1)', // Charcoal glass
        'glass-secondary': 'rgba(14, 165, 233, 0.05)', // Minimal blue glass
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
        
        // Subtle charcoal glow effects
        'glow-sm': '0 0 10px rgba(100, 116, 139, 0.15)', // Very subtle charcoal glow
        'glow-md': '0 0 20px rgba(100, 116, 139, 0.2)',
        'glow-lg': '0 0 40px rgba(100, 116, 139, 0.25)',
        'glow-xl': '0 0 60px rgba(100, 116, 139, 0.3)',
        
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(100, 116, 139, 0.15)' }, // Subtle charcoal glow
          '50%': { boxShadow: '0 0 40px rgba(100, 116, 139, 0.25), 0 0 80px rgba(14, 165, 233, 0.1)' } // With minimal blue
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
        'gradient-primary': 'linear-gradient(135deg, #64748b, #475569)', // Subtle charcoal gradient
        'gradient-secondary': 'linear-gradient(135deg, #0ea5e9, #0284c7)', // Minimal blue gradient
        'gradient-danger': 'linear-gradient(135deg, #ef4444, #dc2626)', // Muted danger gradient
        'gradient-warning': 'linear-gradient(135deg, #f59e0b, #d97706)', // Muted warning gradient
        'gradient-dark': 'linear-gradient(135deg, #020617, #0f172a, #1e293b)', // Deep dark gradient
        'gradient-glass': 'linear-gradient(135deg, rgba(248, 250, 252, 0.05), rgba(248, 250, 252, 0.02))',
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
            background: theme('colors.dark-background'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.charcoal.600'),
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.charcoal.500'),
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
          'background': 'rgba(248, 250, 252, 0.05)',
          'border': '1px solid rgba(248, 250, 252, 0.1)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background': 'rgba(15, 23, 42, 0.8)',
          'border': '1px solid rgba(51, 65, 85, 0.3)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #64748b, #0ea5e9)', // Charcoal to minimal blue
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-secondary': {
          'background': 'linear-gradient(135deg, #0ea5e9, #a855f7)', // Blue to subtle purple
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.border-gradient': {
          'background': 'linear-gradient(135deg, #64748b, #0ea5e9) border-box', // Charcoal to blue
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
            boxShadow: `0 0 0 2px ${theme('colors.charcoal.500')}`, // Charcoal focus
          },
        },
        '.btn-primary': {
          background: 'linear-gradient(135deg, #64748b, #475569)', // Subtle charcoal gradient
          color: theme('colors.white'),
          boxShadow: '0 4px 12px rgba(100, 116, 139, 0.15)', // Very subtle shadow
          '&:hover': {
            background: 'linear-gradient(135deg, #475569, #334155)', // Slightly darker on hover
            boxShadow: '0 6px 16px rgba(100, 116, 139, 0.2)', // Subtle increase
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 8px rgba(100, 116, 139, 0.2)',
          },
        },
        '.btn-secondary': {
          background: 'transparent',
          color: theme('colors.charcoal.400'),
          border: `1px solid ${theme('colors.charcoal.600')}`,
          '&:hover': {
            background: theme('colors.charcoal.900'),
            color: theme('colors.charcoal.300'),
            borderColor: theme('colors.charcoal.500'),
          },
        },
        '.btn-ghost': {
          background: 'transparent',
          color: theme('colors.charcoal.400'),
          '&:hover': {
            background: theme('colors.charcoal.900'),
            color: theme('colors.charcoal.300'),
          },
        },
        '.btn-danger': {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)', // Subtle danger gradient
          color: theme('colors.white'),
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
          '&:hover': {
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            boxShadow: '0 6px 16px rgba(239, 68, 68, 0.2)',
            transform: 'translateY(-1px)',
          },
        },
        '.card': {
          background: theme('colors.dark-card'),
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.dark-md'),
          border: `1px solid ${theme('colors.dark-border')}`,
          padding: theme('spacing.6'),
          '.dark &': {
            background: theme('colors.dark-card'),
            borderColor: theme('colors.dark-border'),
            boxShadow: theme('boxShadow.dark-md'),
          },
        },
        '.card-glass': {
          backdropFilter: 'blur(16px) saturate(180%)',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(51, 65, 85, 0.3)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          '.dark &': {
            background: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(51, 65, 85, 0.3)',
          },
        },
        '.input': {
          width: '100%',
          padding: theme('spacing.3'),
          borderRadius: theme('borderRadius.md'),
          border: `1px solid ${theme('colors.dark-border')}`,
          background: theme('colors.dark-input'),
          fontSize: theme('fontSize.sm')[0],
          color: theme('colors.dark-text'),
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.charcoal.500'),
            boxShadow: `0 0 0 3px ${theme('colors.charcoal.500')}20`,
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
