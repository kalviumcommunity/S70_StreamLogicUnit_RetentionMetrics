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
        background: "#080c14",
        sidebar: "#0b0f19",
        card: "#0f1523",
        "card-hover": "#131b2d",
        "card-border": "#1a2236",
        border: "#1a2236",
        primary: {
          DEFAULT: "#00f0ff",
          purple: "#8b5cf6",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          emerald: "#10b981",
        },
        text: {
          primary: "#ffffff",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};


export default config;
