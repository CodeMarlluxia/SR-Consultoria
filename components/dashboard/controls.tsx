"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

// ---------------------------------------------------------------------
//  'YYYY-MM-DD' <-> 'DD/MM/AAAA'. Um <input type="date"> nativo formata o
//  valor exibido de acordo com o idioma do navegador/SO — em muitos casos
//  isso mostra mm/dd/aaaa (americano), mesmo com o site em pt-BR. Por isso
//  a data é um campo de texto mascarado próprio, sempre dd/mm/aaaa.
// ---------------------------------------------------------------------
function isoToBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

/** Só os dígitos, formatados progressivamente como dd/mm/aaaa. */
function maskBrDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  return [d, m, y].filter(Boolean).join("/");
}

/** 'DD/MM/AAAA' -> 'YYYY-MM-DD', ou null se a data não existe no calendário. */
function brToIso(br: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  const date = new Date(y, m - 1, d);
  const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  if (!valid) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/** Campo de data com máscara dd/mm/aaaa, convertendo para ISO por baixo. */
function DateField({
  value,
  min,
  max,
  disabled,
  ariaLabel,
  onCommit,
}: {
  value: string;
  min: string;
  max: string;
  disabled?: boolean;
  ariaLabel: string;
  onCommit: (iso: string) => void;
}) {
  const [text, setText] = useState(() => isoToBr(value));

  // Mantém o campo em sincronia quando o valor muda por fora (ex.: após
  // aplicar o outro campo, ou navegação para um novo período).
  useEffect(() => {
    setText(isoToBr(value));
  }, [value]);

  function commit() {
    const iso = brToIso(text);
    if (!iso || iso < min || iso > max) {
      setText(isoToBr(value)); // inválida ou fora do intervalo: reverte
      return;
    }
    onCommit(iso);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={text}
      disabled={disabled}
      onChange={(e) => setText(maskBrDate(e.target.value))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setText(isoToBr(value));
      }}
      className="w-[5.5rem] rounded-md border border-ink-faint/25 bg-white/60 px-1.5 py-1 text-xs tabular-nums text-ink outline-none transition-colors focus:border-brand-lilac disabled:opacity-60 dark:border-white/15 dark:bg-white/5"
      aria-label={ariaLabel}
    />
  );
}

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

  return (
    <div className="card flex items-center gap-1.5 rounded-pill px-2.5 py-1" aria-busy={pending}>
      <DateField min={min} max={max} value={from} disabled={pending} onCommit={(iso) => apply(iso, to)} ariaLabel="Data inicial" />
      <span className="text-xs text-ink-faint">–</span>
      <DateField min={min} max={max} value={to} disabled={pending} onCommit={(iso) => apply(from, iso)} ariaLabel="Data final" />
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
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-pill border border-ink-faint/25 bg-white/50 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-all hover:border-brand-lilac hover:text-ink dark:border-white/15 dark:bg-white/5 dark:hover:text-ink"
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
