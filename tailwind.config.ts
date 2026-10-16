import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: {
          DEFAULT: "#0f1626",
          card: "#121b2f",
          border: "#1e2c4a",
          hover: "#19243d",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        cyber: {
          dark: "#080c14",
          panel: "#0f172a",
          subtle: "#1e293b",
          border: "#334155",
          accent: "#06b6d4",
          warning: "#f59e0b",
          danger: "#ef4444",
          safe: "#10b981",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
