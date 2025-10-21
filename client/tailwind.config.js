/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        dark: '#0f0f0f',
        'dark-gray': '#1a1a1a',
        'medium-gray': '#2a2a2a',
        'light-gray': '#3a3a3a',
      },
    },
  },
  plugins: [],
}


