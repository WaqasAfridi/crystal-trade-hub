/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0f",
        surface: "#12141a",
        elevated: "#1a1d26",
        border: "#262a36",
        muted: "#6b7280",
        text: "#e5e7eb",
        accent: "#22c55e",
      },
    },
  },
  plugins: [],
};
