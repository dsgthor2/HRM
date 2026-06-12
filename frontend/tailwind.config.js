/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f8fafc",
        "cream-dark": "#f1f5f9",
        "cream-border": "#e2e8f0",
        navy: "#0f172a",
        "navy-light": "#1e293b",
        accent: "#2563eb",
        "accent-light": "#eff6ff",
        gold: "#eab308",
        "gold-light": "#fef9c3",
      },
    },
  },
  plugins: [],
};
