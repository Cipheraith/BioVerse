const plugin = require('tailwindcss/plugin');

module.exports = plugin(function ({ addUtilities }) {
  const newUtilities = {
    '.text-shadow-sm': {
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    '.text-shadow': {
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    },
    '.text-shadow-md': {
      textShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    '.text-shadow-lg': {
      textShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    '.text-shadow-none': {
      textShadow: 'none',
    },
  };

  addUtilities(newUtilities, ['responsive', 'hover']);
});