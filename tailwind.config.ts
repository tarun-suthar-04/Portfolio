import type { Config } from "tailwindcss";

// Design tokens per DESIGN.md — a quiet, archival "gallery placard" palette.
// Deliberately not the generic cream+terracotta or near-black+neon defaults.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        graphite: "rgb(var(--color-graphite) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
        card: "4px",
        pill: "999px",
      },
      transitionTimingFunction: {
        gallery: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
