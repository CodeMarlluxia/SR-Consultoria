"use client";

import type { CSSProperties } from "react";
import { brl, initials } from "./format";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Cada card carrega um "fio" de cor no topo. O fio não é decoração:
//  identifica a natureza do indicador e é a única cor saturada da peça.
// ---------------------------------------------------------------------
export type Tone = "rose" | "butter" | "mint" | "sky" | "lilac";

const TONE: Record<Tone, { thread: string; value: string; chip: string; ring: string }> = {
  rose:   { thread: "var(--rose)",   value: "text-deep-rose",   chip: "bg-brand-rose/25",   ring: "from-brand-rose to-brand-lilac" },
  butter: { thread: "var(--butter)", value: "text-deep-butter", chip: "bg-brand-butter/30", ring: "from-brand-butter to-brand-mint" },
  mint:   { thread: "var(--mint)",   value: "text-deep-mint",   chip: "bg-brand-mint/30",   ring: "from-brand-mint to-brand-sky" },
  sky:    { thread: "var(--sky)",    value: "text-deep-sky",    chip: "bg-brand-sky/30",    ring: "from-brand-sky to-brand-lilac" },
  lilac:  { thread: "var(--lilac)",  value: "text-deep-lilac",  chip: "bg-brand-lilac/25",  ring: "from-brand-lilac to-brand-rose" },
};

const threadStyle = (tone: Tone): CSSProperties =>
  ({ "--thread": TONE[tone].thread } as CSSProperties);

/** KPI numérico com contagem animada. */
export function MetricCard({
  label,
  value,
  sub,
  tone = "mint",
  isCurrency = true,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: Tone;
  isCurrency?: boolean;
}) {
  const animated = useCountUp(value);

  return (
    <div
      className="card card-thread overflow-hidden px-5 pb-4 pt-5 transition-transform duration-300 hover:-translate-y-0.5"
      style={threadStyle(tone)}
    >
      <p className="eyebrow">{label}</p>
      <p
        className={`mt-2 font-display text-[1.65rem] font-semibold leading-none tabular-nums tracking-tight ${TONE[tone].value}`}
      >
        {isCurrency ? brl(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </p>
      {sub && <p className="mt-1.5 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

/** Card de destaque com avatar da profissional. */
export function ChampionCard({
  tone,
  icon,
  label,
  nome,
  stat,
  hint,
  highlight = false,
}: {
  tone: Tone;
  icon: string;
  label: string;
  nome: string;
  stat: string;
  hint?: string;
  highlight?: boolean;
}) {
  const t = TONE[tone];

  return (
    <div
      className={[
        "card card-thread overflow-hidden px-5 pb-4 pt-5 transition-transform duration-300 hover:-translate-y-0.5",
        highlight ? "ring-1 ring-brand-rose/50" : "",
      ].join(" ")}
      style={threadStyle(tone)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm ${t.chip}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.ring} font-display text-sm font-semibold text-ink`}
          aria-hidden
        >
          {initials(nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-semibold leading-tight text-ink" title={nome}>
            {nome}
          </p>
          <p className={`text-sm font-semibold tabular-nums ${t.value}`}>{stat}</p>
        </div>
      </div>

      {hint && <p className="mt-2.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

/** Card analítico (serviço mais executado / categoria mais vendida). */
export function InsightCard({
  label,
  title,
  detail,
  tone = "sky",
  icon,
}: {
  label: string;
  title: string;
  detail: string;
  tone?: Tone;
  icon: string;
}) {
  const t = TONE[tone];

  return (
    <div
      className="card card-thread overflow-hidden px-5 pb-4 pt-5 transition-transform duration-300 hover:-translate-y-0.5"
      style={threadStyle(tone)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm ${t.chip}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate font-display text-xl font-semibold text-ink" title={title}>
        {title}
      </p>
      <p className={`mt-1 text-sm font-semibold tabular-nums ${t.value}`}>{detail}</p>
    </div>
  );
}

/** Faixa fina de contexto — usada abaixo dos KPIs. */
export function StatStrip({ items }: { items: Array<{ k: string; v: string }> }) {
  return (
    <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5">
      {items.map((i) => (
        <div key={i.k} className="flex items-baseline gap-2">
          <span className="eyebrow">{i.k}</span>
          <span className="text-sm font-semibold tabular-nums text-ink">{i.v}</span>
        </div>
      ))}
    </div>
  );
}
