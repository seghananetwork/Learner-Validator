/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c231d",
        field: {
          50: "#f4f7f1",
          100: "#e5ecdd",
          200: "#c9d9ba",
          300: "#a3bf8b",
          400: "#7ba25f",
          500: "#5c8641",
          600: "#476a32",
          700: "#39542a",
          800: "#2f4424",
          900: "#293a20",
        },
        clay: "#c15f3c",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
