import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        prm: {
          50: "#eef4fb",
          100: "#d9e6f5",
          200: "#b0c9e8",
          300: "#7fa6d6",
          400: "#4c7fc0",
          500: "#2c5fa3",
          600: "#1e4a8a",
          700: "#173d72",
          800: "#122f5a",
          900: "#0d2344",
        },
        gold: {
          50: "#fbf6ea",
          100: "#f5e8c6",
          200: "#ecd48f",
          300: "#e0ba5c",
          400: "#d1a13b",
          500: "#b8862a",
          600: "#966c22",
        },
      },
    },
  },
  plugins: [],
};
export default config;
