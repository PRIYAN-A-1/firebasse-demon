import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#090A0F",
          secondary: "#10121A",
          tertiary: "#161922",
        },
        surface: {
          glass: "rgba(255, 255, 255, 0.05)",
          glassHover: "rgba(255, 255, 255, 0.08)",
          elevated: "rgba(15, 23, 42, 0.8)",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.12)",
          glow: "rgba(59, 130, 246, 0.3)",
        },
        neon: {
          green: "#3b82f6", // Reusing the same class names but changing to blue
          lime: "#60a5fa",
          emerald: "#2563eb",
          cyan: "#0ea5e9",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px -5px rgba(59, 130, 246, 0.3)",
        glowCyan: "0 0 30px -5px rgba(14, 165, 233, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
