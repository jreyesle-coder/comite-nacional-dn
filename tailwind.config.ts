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
          50: "#f6f2fa",
          100: "#ece3f4",
          200: "#d6c1e8",
          300: "#b98fd6",
          400: "#9a5fc2",
          500: "#7a3aa8",
          600: "#5e2589",
          700: "#4a1c6e",
          800: "#3d1a59",
          900: "#2e1443",
        },
      },
    },
  },
  plugins: [],
};
export default config;
