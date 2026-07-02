"use client";

import { useEffect, useState } from "react";

/** Intra-month date range picker. Emits ISO 'YYYY-MM-DD' bounds. */
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
    <div className="glass flex items-center gap-1.5 rounded-lg px-2 py-1">
      <input
        type="date"
        min={min}
        max={to || max}
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="rounded-md border border-ink-faint/25 bg-white/50 px-1.5 py-1 text-xs text-ink outline-none transition-colors focus:border-accent-lavender/60 dark:border-white/15 dark:bg-white/5 dark:[color-scheme:dark]"
        aria-label="Data inicial"
      />
      <span className="text-xs text-ink-faint">–</span>
      <input
        type="date"
        min={from || min}
        max={max}
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="rounded-md border border-ink-faint/25 bg-white/50 px-1.5 py-1 text-xs text-ink outline-none transition-colors focus:border-accent-lavender/60 dark:border-white/15 dark:bg-white/5 dark:[color-scheme:dark]"
        aria-label="Data final"
      />
      {(from !== min || to !== max) && (
        <button
          onClick={() => onChange(min, max)}
          className="rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
          aria-label="Limpar período"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/** Fullscreen toggle using the Fullscreen API. */
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
      onClick={toggle}
      aria-label={isFull ? "Sair da tela cheia" : "Entrar em tela cheia"}
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-ink-faint/25 bg-white/40 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-accent-lavender/50 hover:text-ink dark:border-white/15 dark:bg-white/5 dark:hover:text-ink"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
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
