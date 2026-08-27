"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/icons";

/**
 * Interruptor de tema claro/escuro. Guarda a escolha em localStorage e
 * alterna a classe `dark` no <html>; um script inline no layout raiz
 * aplica o tema salvo antes da pintura para não piscar o tema errado.
 *
 * Visual de switch (trilho + botão deslizante), como na referência, com
 * `role="switch"` para que leitores de tela anunciem ligado/desligado.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? dark : false}
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={dark ? "Modo claro" : "Modo escuro"}
      className={[
        "relative inline-flex h-8 w-[3.4rem] flex-shrink-0 items-center rounded-full border transition-colors duration-300",
        dark
          ? "border-white/15 bg-ink/80"
          : "border-ink-faint/25 bg-gradient-to-r from-brand-lilac/50 to-brand-sky/50",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition-transform duration-300",
          dark ? "translate-x-[1.65rem]" : "translate-x-[0.2rem]",
        ].join(" ")}
      >
        {dark ? <IconMoon className="h-3.5 w-3.5" /> : <IconSun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
