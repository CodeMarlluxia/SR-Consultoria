"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** 'YYYY-MM' → 'jun/2026' */
export function formatPeriodLabel(mesAno: string): string {
  const [y, m] = mesAno.split("-");
  const idx = Number(m) - 1;
  if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return mesAno;
  return `${MESES[idx]}/${y}`;
}

/**
 * Period (month) selector.
 *
 * Changing the month pushes `?periodo=YYYY-MM` onto the URL. The dashboard
 * page is a Server Component, so the navigation re-runs the Supabase query
 * scoped to that `mes_ano` — sales AND goals — and the whole tree re-renders
 * with the correct data. This is the single source of truth for the period.
 */
export function PeriodSelector({
  periods,
  current,
}: {
  periods: string[];
  current: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(mesAno: string) {
    if (mesAno === current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", mesAno);
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  if (periods.length === 0) return null;

  // Few periods → segmented buttons. Many → a compact select.
  if (periods.length <= 4) {
    return (
      <div
        role="group"
        aria-label="Selecionar período"
        aria-busy={pending}
        className="glass flex items-center gap-0.5 rounded-lg p-0.5"
      >
        {periods.map((p) => {
          const active = p === current;
          return (
            <button
              key={p}
              type="button"
              onClick={() => select(p)}
              aria-pressed={active}
              disabled={pending}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors disabled:opacity-60 ${
                active
                  ? "bg-accent-lavender/25 text-ink"
                  : "text-ink-soft hover:bg-white/40 hover:text-ink dark:hover:bg-white/10"
              }`}
            >
              {formatPeriodLabel(p)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass flex items-center gap-1.5 rounded-lg px-2 py-1">
      <label htmlFor="periodo" className="text-xs font-medium text-ink-faint">
        Período
      </label>
      <select
        id="periodo"
        value={current}
        disabled={pending}
        aria-busy={pending}
        onChange={(e) => select(e.target.value)}
        className="rounded-md border border-ink-faint/25 bg-white/50 px-1.5 py-1 text-xs font-semibold capitalize text-ink outline-none transition-colors focus:border-accent-lavender/60 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:[color-scheme:dark]"
      >
        {periods.map((p) => (
          <option key={p} value={p}>
            {formatPeriodLabel(p)}
          </option>
        ))}
      </select>
    </div>
  );
}
