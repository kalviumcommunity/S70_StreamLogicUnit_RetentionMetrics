import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0d14",
        surface: "#111726",
        "surface-elevated": "#182238",
        border: "#1e293b",
        primary: {
          DEFAULT: "#38bdf8",
          hover: "#0284c7",
          muted: "#0369a1",
        },
        accent: "#6366f1",
        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        risk: {
          low: "#10b981",      // Success green
          medium: "#f59e0b",   // Warning amber
          high: "#ef4444",     // Danger red
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
