/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          mentor: '#D81B8C',
          light: '#F472B6',
        },
        purple: {
          mentor: '#5B1A8C',
          medium: '#7C3AED',
          light: '#A855F7',
          pale: '#EDE9FE',
        },
        teal: {
          mentor: '#0D9488',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
