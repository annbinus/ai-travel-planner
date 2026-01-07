/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brownPrimary: "#4A3F3A",
        brownDark: "#3E342F",
        beige: "#F4EEE2",
        beigeMuted: "#E6DDCF",
      },
    },
  },
  plugins: [],
}
