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
        paper: "#F7F6F3",   // page background — warm, cool-leaning off-white
        ink: "#14140F",     // primary text — warm-tinted near-black, not pure #000
        graphite: "#6B6A63",// secondary/meta text
        line: "#DFDDD5",    // hairline borders/dividers
        canvas: "#EDEBE4",  // placeholder/media background before load
        accent: "#2F4538",  // archive green — used sparingly (active state, focus, links)
        "accent-soft": "#E4E9E5", // accent tint for active pill backgrounds
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
