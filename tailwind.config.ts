import type { Config } from "tailwindcss";

// =====================================================================
//  "Luxo Pastel" — soft glass-morphism design tokens
// =====================================================================
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ink text ramp — driven by CSS vars so it flips in dark mode.
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          faint: "var(--ink-faint)",
        },
        // Pastéis da marca — preenchimentos, fios, avatares.
        // Hex fixo (não var) para que modificadores de opacidade funcionem:
        // bg-brand-rose/25, from-brand-sky/40 etc.
        brand: {
          rose: "#f8b4c4",
          butter: "#f0e6a8",
          mint: "#b8e8c8",
          sky: "#a8d8f0",
          lilac: "#d4b8f0",
        },
        // Texto sobre pastel — constante nos dois temas.
        onPastel: "#3f3a4d",
        // Alias legado da paleta pastel.
        pastel: {
          rose: "#f8b4c4",
          gold: "#f0e6a8",
          mint: "#b8e8c8",
          serenity: "#a8d8f0",
          lavender: "#d4b8f0",
        },
        // Sober, harmonized value/text accents — CSS vars so they brighten
        // in dark mode while keeping the same feminine hues.
        accent: {
          rose: "var(--accent-rose)",
          gold: "var(--accent-gold)",
          mint: "var(--accent-mint)",
          serenity: "var(--accent-serenity)",
          lavender: "var(--accent-lavender)",
        },
        // Neutral surface ramp (kept as `base` so existing utilities resolve)
        base: {
          DEFAULT: "#fdf7fa",
          900: "#fdf7fa",
          800: "#ffffff",
          700: "#f7f0fb",
          600: "#e7dff0",
        },
        text: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-faint)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Playfair Display'", "Georgia", "serif"],
        sans: ["var(--font-sans)", "'Poppins'", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      boxShadow: {
        glass: "0 10px 40px rgba(248,180,196,0.15)",
        "glass-lg": "0 20px 55px rgba(248,180,196,0.28)",
        "glow-rose": "0 10px 30px rgba(248,180,196,0.30)",
        "glow-lavender": "0 10px 30px rgba(212,184,240,0.30)",
      },
      keyframes: {
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pearl-in": {
          "0%": { opacity: "0", transform: "scale(0.4)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "progress-shine": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        laser: {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        wave: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(-4deg)" },
          "50%": { transform: "translateY(-5px) rotate(4deg)" },
        },
      },
      animation: {
        aurora: "aurora 18s ease-in-out infinite",
        "fade-rise": "fade-rise 0.5s ease-out forwards",
        "pearl-in": "pearl-in 0.6s cubic-bezier(.2,.8,.2,1) forwards",
        "progress-shine": "progress-shine 1.8s ease-in-out infinite",
        wave: "wave 2.5s linear infinite",
        float: "float 3s ease-in-out infinite",
        bob: "bob 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
