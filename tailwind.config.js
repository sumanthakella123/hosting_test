module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFA500', // Orange
        secondary: '#FFFFFF', // White
        'orange-500': '#F97316', // Tailwind's default orange color
      },
    },
  },
  plugins: [],
};
