/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#faf8f4",
        "cream-dark": "#ede9e0",
        "cream-border": "#ddd8cc",
        navy: "#1a2b45",
        "navy-light": "#2a3d5e",
        accent: "#1d4ed8",
        "accent-light": "#dbeafe",
        gold: "#b8960c",
        "gold-light": "#fef9c3",
      },
    },
  },
  plugins: [],
};
