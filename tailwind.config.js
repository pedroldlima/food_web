/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      inputNumberNoSpin: {
        WebkitAppearance: 'none',
        MozAppearance: 'textfield',
        appearance: 'textfield',
      },
    },
  },
  plugins: [],
}

