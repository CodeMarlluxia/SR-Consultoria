"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/**
 * Date-range picker — the dashboard's ONLY period control.
 *
 * Picking a window pushes `?de=&ate=` onto the URL. `/dashboard` is a Server
 * Component, so the navigation re-queries Supabase for that window (sales by
 * data_venda, goals for every month it touches) and the whole tree re-renders.
 * `min`/`max` span the full extent of imported data, so any month that was
 * imported is reachable straight from these two inputs.
 */
export function DateRangePicker({
  min,
  max,
  from,
  to,
}: {
  min: string;
  max: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(nextFrom: string, nextTo: string) {
    if (!nextFrom || !nextTo) return;
    // Tolerate an inverted window rather than silently showing nothing.
    const [f, t] = nextFrom > nextTo ? [nextTo, nextFrom] : [nextFrom, nextTo];
    if (f === from && t === to) return;
    startTransition(() => {
      router.push(`/dashboard?de=${f}&ate=${t}`);
    });
  }

  const inputClass =
    "rounded-md border border-ink-faint/25 bg-white/50 px-1.5 py-1 text-xs text-ink outline-none transition-colors focus:border-accent-lavender/60 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:[color-scheme:dark]";

  return (
    <div className="glass flex items-center gap-1.5 rounded-lg px-2 py-1" aria-busy={pending}>
      <input
        type="date"
        min={min}
        max={max}
        value={from}
        disabled={pending}
        onChange={(e) => apply(e.target.value, to)}
        className={inputClass}
        aria-label="Data inicial"
      />
      <span className="text-xs text-ink-faint">–</span>
      <input
        type="date"
        min={min}
        max={max}
        value={to}
        disabled={pending}
        onChange={(e) => apply(from, e.target.value)}
        className={inputClass}
        aria-label="Data final"
      />
      {(from !== min || to !== max) && (
        <button
          onClick={() => apply(min, max)}
          disabled={pending}
          className="rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
          aria-label="Ver todo o período disponível"
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
