/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        espresso: '#4E342E',
        coffee: '#6F4E37',
        cream: '#FFF8E7',
        latte: '#E6D3B3',
        dark: '#2E1A12',
        gold: '#D4AF37',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out both',
        'scale-in': 'scaleIn 0.5s ease-out both',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
        'slide-in': 'slideIn 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
