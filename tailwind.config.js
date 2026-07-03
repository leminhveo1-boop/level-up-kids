/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          light: "#E8F5E9",
          medium: "#4CAF50",
          DEFAULT: "#2E7D32", // Cozy dark green
          dark: "#1B5E20",
          accent: "#A7F3D0", // Emerald light
        },
        sand: {
          light: "#FDFBF7", // Background warm cozy cream
          DEFAULT: "#F5EFE6", // Sand border
          dark: "#E4DCCF",
          card: "#FFFFFF",
        },
        amber: {
          light: "#FEF3C7",
          DEFAULT: "#D97706", // Discipline orange
          dark: "#B45309",
        },
        terracotta: {
          light: "#FFE4E6",
          DEFAULT: "#E11D48", // Strength/energy red
          dark: "#BE123C",
        },
        sky: {
          light: "#E0F2FE",
          DEFAULT: "#0284C7", // Intellect blue
          dark: "#0369A1",
        },
        clay: {
          light: "#F3E8FF",
          DEFAULT: "#7C3AED", // Creative violet (custom soft color)
          dark: "#6D28D9",
        },
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        // Soft, Apple-style depth (was chunky 0 6px 0px "sticker" shadows).
        // Redefining these tokens re-skins every card/button app-wide at once.
        "game-flat": "0 1px 2px 0 rgba(27,46,30,0.04), 0 6px 16px -6px rgba(27,46,30,0.08)",
        "game-pressed": "0 1px 2px 0 rgba(27,46,30,0.05)",
        "game-forest": "0 2px 10px -2px rgba(27,94,32,0.28)",
        "game-forest-pressed": "0 1px 4px 0 rgba(27,94,32,0.22)",
        "game-amber": "0 2px 10px -2px rgba(180,83,9,0.26)",
        "game-amber-pressed": "0 1px 4px 0 rgba(180,83,9,0.2)",
        "game-terracotta": "0 2px 10px -2px rgba(190,18,60,0.26)",
        "game-terracotta-pressed": "0 1px 4px 0 rgba(190,18,60,0.2)",
        "game-sky": "0 2px 10px -2px rgba(3,105,161,0.26)",
        "game-sky-pressed": "0 1px 4px 0 rgba(3,105,161,0.2)",
      },
      fontFamily: {
        outfit: ["var(--font-outfit)", "sans-serif"],
      },
      // B1 type scale — token-backed; prefer these over arbitrary text-[Npx]
      fontSize: {
        "scale-2xs": ["var(--text-2xs)", { lineHeight: "1.35" }],
        "scale-xs": ["var(--text-xs)", { lineHeight: "1.4" }],
        "scale-sm": ["var(--text-sm)", { lineHeight: "1.45" }],
        "scale-base": ["var(--text-base)", { lineHeight: "1.5" }],
        "scale-lg": ["var(--text-lg)", { lineHeight: "1.3" }],
        "scale-xl": ["var(--text-xl)", { lineHeight: "1.2" }],
      },
      minWidth: {
        tap: "44px",
      },
      minHeight: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};
