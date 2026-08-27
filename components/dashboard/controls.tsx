"use client";

import { useEffect, useState } from "react";

/** Seletor de intervalo de datas. Emite limites ISO 'YYYY-MM-DD'. */
export function DateRangePicker({
  min,
  max,
  from,
  to,
  onChange,
}: {
  min: string;
  max: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <div className="card flex flex-wrap items-center gap-2.5 rounded-pill px-4 py-2">
      <span className="eyebrow">Período</span>
      <input
        type="date"
        min={min}
        max={to || max}
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="field rounded-pill px-3 py-1.5 text-sm"
        aria-label="Data inicial"
      />
      <span aria-hidden className="text-ink-faint">–</span>
      <input
        type="date"
        min={from || min}
        max={max}
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="field rounded-pill px-3 py-1.5 text-sm"
        aria-label="Data final"
      />
      {(from !== min || to !== max) && (
        <button
          type="button"
          onClick={() => onChange(min, max)}
          className="rounded-pill px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          Ver tudo
        </button>
      )}
    </div>
  );
}

/** Alterna tela cheia usando a Fullscreen API. */
export function FullscreenButton({ onToggle }: { onToggle?: (full: boolean) => void }) {
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const onChange = () => {
      const full = Boolean(document.fullscreenElement);
      setIsFull(full);
      onToggle?.(full);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [onToggle]);

  function toggle() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFull ? "Sair da tela cheia" : "Entrar em tela cheia"}
      className="card inline-flex flex-shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold text-ink-soft transition-all hover:-translate-y-0.5 hover:text-ink"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        {isFull ? (
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        ) : (
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        )}
      </svg>
      {isFull ? "Sair" : "Tela cheia"}
    </button>
  );
}
