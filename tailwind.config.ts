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
        // Stitch Design System - Cognitive Security Tokens
        surface: {
          DEFAULT: "#0b1322",
          dim: "#0b1322",
          bright: "#31394a",
          card: "#121b2f",
          border: "#1e2c4a",
          hover: "#19243d",
        },
        "surface-dim": "#0b1322",
        "surface-bright": "#31394a",
        "surface-container-lowest": "#060e1d",
        "surface-container-low": "#141c2b",
        "surface-container": "#18202f",
        "surface-container-high": "#222a3a",
        "surface-container-highest": "#2d3545",
        "on-surface": "#dbe2f8",
        "on-surface-variant": "#bcc9cb",
        "inverse-surface": "#dbe2f8",
        "inverse-on-surface": "#293041",
        outline: "#869395",
        "outline-variant": "#3d494b",
        "surface-tint": "#57d7e9",

        // Primary Accent (Electric Cyan)
        primary: {
          DEFAULT: "#8ff0ff",
          container: "#55d6e8",
          fixed: "#96f1ff",
          "fixed-dim": "#57d7e9",
        },
        "on-primary": "#00363d",
        "primary-container": "#55d6e8",
        "on-primary-container": "#005b64",
        "inverse-primary": "#006874",

        // Secondary Accent (Safe Mint)
        secondary: {
          DEFAULT: "#51ddb2",
          container: "#00b088",
          fixed: "#72facd",
          "fixed-dim": "#51ddb2",
        },
        "on-secondary": "#003829",
        "secondary-container": "#00b088",
        "on-secondary-container": "#003b2c",

        // Tertiary Accent (Caution Amber)
        tertiary: {
          DEFAULT: "#ffdbab",
          container: "#f4bb64",
          fixed: "#ffddb0",
          "fixed-dim": "#f6bd65",
        },
        "on-tertiary": "#442b00",
        "tertiary-container": "#f4bb64",
        "on-tertiary-container": "#6f4a00",

        // Error / Alert (Critical Crimson)
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Background
        background: "#080d16",
        "on-background": "#dbe2f8",

        // Backwards compatibility
        cyber: {
          dark: "#080d16",
          panel: "#141c2b",
          subtle: "#18202f",
          border: "#1e2d45",
          accent: "#55d6e8",
          warning: "#f4bb64",
          danger: "#ff647c",
          safe: "#51ddb2",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        "code-ioc": ["JetBrains Mono", "monospace"],
        "stat-score": ["JetBrains Mono", "monospace"],
        "telemetry-pill": ["JetBrains Mono", "monospace"],
        "body-base": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "display-xl": ["Inter", "sans-serif"],
      },
      fontSize: {
        "code-ioc": ["12px", { lineHeight: "18px", letterSpacing: "0", fontWeight: "500" }],
        "telemetry-pill": ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "700" }],
        "stat-score": ["36px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "body-sm": ["12px", { lineHeight: "18px", letterSpacing: "0", fontWeight: "400" }],
        "body-base": ["14px", { lineHeight: "22px", letterSpacing: "0", fontWeight: "400" }],
        "headline-sm": ["14px", { lineHeight: "20px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "headline-md": ["18px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "display-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.025em", fontWeight: "800" }],
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        gutter: "1rem",
        "gutter-mobile": "0.75rem",
        margin: "1.5rem",
        "margin-mobile": "1rem",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
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
