/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1120', 'navy-mid': '#0F1A2E', 'navy-light': '#162540',
        'navy-card': '#111E35', gold: '#C9A84C', 'gold-light': '#E8C96A',
        steel: '#7A94B8', cream: '#EEF4FF',
      },
      fontFamily: { display: ['"Cormorant Garamond"','serif'], body: ['"DM Sans"','sans-serif'] },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: { marquee: 'marquee 25s linear infinite', float: 'float 3s ease-in-out infinite', shimmer: 'shimmer 2s linear infinite' },
    },
  },
  plugins: [],
}
