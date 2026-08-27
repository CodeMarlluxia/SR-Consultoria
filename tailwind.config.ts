import type { Config } from "tailwindcss";

// =====================================================================
//  SR Consultoria — "Atelier Pastel"
//  Os pastéis da marca vivem em `brand`. Como pastel não carrega texto,
//  cada matiz tem um par escuro em `deep` (mesma matiz, luminosidade
//  rebaixada até passar em WCAG AA sobre fundo claro).
//  `pastel` e `accent` são aliases mantidos por compatibilidade.
// =====================================================================
const brand = {
  rose: "#f8b4c4",
  butter: "#f0e6a8",
  mint: "#b8e8c8",
  sky: "#a8d8f0",
  lilac: "#d4b8f0",
};

const deep = {
  rose: "#b0576d",
  butter: "#86722a",
  mint: "#3f7a58",
  sky: "#3e6b87",
  lilac: "#6c4e9c",
};

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand,
        deep,
        ink: {
          DEFAULT: "#3f3a4d",
          soft: "#655e72",
          faint: "#948da3",
        },
        page: "#fdf8fb",

        // --- aliases legados (telas ainda não migradas) ---------------
        pastel: {
          rose: brand.rose,
          gold: brand.butter,
          mint: brand.mint,
          serenity: brand.sky,
          lavender: brand.lilac,
        },
        accent: {
          rose: deep.rose,
          gold: deep.butter,
          mint: deep.mint,
          serenity: deep.sky,
          lavender: deep.lilac,
        },
        base: {
          DEFAULT: "#fdf8fb",
          900: "#fdf8fb",
          800: "#ffffff",
          700: "#f8f1fa",
          600: "#ece4f2",
        },
        text: { DEFAULT: "#3f3a4d", dim: "#948da3" },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Fraunces'", "Georgia", "serif"],
        sans: ["var(--font-sans)", "'Manrope'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "22px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(63,58,77,0.04), 0 14px 34px -20px rgba(176,87,109,0.30)",
        lift: "0 2px 4px rgba(63,58,77,0.05), 0 24px 46px -22px rgba(176,87,109,0.42)",
        // aliases legados
        glass: "0 1px 2px rgba(63,58,77,0.04), 0 14px 34px -20px rgba(176,87,109,0.30)",
        "glass-lg": "0 2px 4px rgba(63,58,77,0.05), 0 24px 46px -22px rgba(176,87,109,0.42)",
        "glow-rose": "0 12px 30px -14px rgba(176,87,109,0.5)",
        "glow-lavender": "0 12px 30px -14px rgba(108,78,156,0.5)",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pearl-in": {
          "0%": { opacity: "0", transform: "scale(0.4)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
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
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(-4deg)" },
          "50%": { transform: "translateY(-5px) rotate(4deg)" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 0.5s cubic-bezier(.2,.8,.2,1) forwards",
        "pearl-in": "pearl-in 0.6s cubic-bezier(.2,.8,.2,1) forwards",
        float: "float 3.4s ease-in-out infinite",
        wave: "wave 2.5s linear infinite",
        bob: "bob 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
