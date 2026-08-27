"use client";

import type { CSSProperties } from "react";
import { initials } from "./format";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Cada card carrega um fio de cor no topo (--thread). O fio identifica a
//  natureza do indicador e é a única cor saturada da peça — o resto fica
//  quieto. Os pastéis vêm de --brand-* (superfície, constante nos temas);
//  os números usam text-accent-*, que clareia no modo escuro.
// ---------------------------------------------------------------------
export type Tone = "rose" | "gold" | "mint" | "serenity" | "lavender";

const TONE: Record<Tone, { thread: string; value: string; chip: string; ring: string }> = {
  rose:      { thread: "var(--brand-rose)",   value: "text-accent-rose",     chip: "bg-brand-rose/30",   ring: "from-brand-rose to-brand-lilac" },
  gold:      { thread: "var(--brand-butter)", value: "text-accent-gold",     chip: "bg-brand-butter/35", ring: "from-brand-butter to-brand-mint" },
  mint:      { thread: "var(--brand-mint)",   value: "text-accent-mint",     chip: "bg-brand-mint/35",   ring: "from-brand-mint to-brand-sky" },
  serenity:  { thread: "var(--brand-sky)",    value: "text-accent-serenity", chip: "bg-brand-sky/35",    ring: "from-brand-sky to-brand-lilac" },
  lavender:  { thread: "var(--brand-lilac)",  value: "text-accent-lavender", chip: "bg-brand-lilac/30",  ring: "from-brand-lilac to-brand-rose" },
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
  const brlCompact = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div
      className="card card-thread overflow-hidden px-4 pb-3 pt-3.5 transition-transform duration-300 hover:-translate-y-0.5"
      style={threadStyle(tone)}
    >
      <p className="eyebrow truncate">{label}</p>
      <p
        className={`mt-1.5 truncate font-display text-2xl font-semibold leading-none tabular-nums tracking-tight ${TONE[tone].value}`}
      >
        {isCurrency ? brlCompact(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </p>
      {sub && <p className="mt-1 truncate text-[0.7rem] text-ink-soft">{sub}</p>}
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
        "card card-thread overflow-hidden px-4 pb-3 pt-3.5 transition-transform duration-300 hover:-translate-y-0.5",
        highlight ? "ring-1 ring-brand-rose/60" : "",
      ].join(" ")}
      style={threadStyle(tone)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${t.chip}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.ring} font-display text-xs font-semibold text-onPastel`}
          aria-hidden
        >
          {initials(nome)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold leading-tight text-ink" title={nome}>
            {nome}
          </p>
          <p className={`truncate text-sm font-semibold tabular-nums ${t.value}`}>{stat}</p>
        </div>
      </div>

      {hint && <p className="mt-1.5 truncate text-[0.7rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

/** Card analítico (serviço mais executado / categoria mais vendida). */
export function InsightCard({
  label,
  title,
  detail,
  tone = "serenity",
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
      className="card card-thread flex flex-col justify-center overflow-hidden px-4 pb-3.5 pt-4 transition-transform duration-300 hover:-translate-y-0.5"
      style={threadStyle(tone)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        <span
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${t.chip}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate font-display text-xl font-semibold text-ink" title={title}>
        {title}
      </p>
      <p className={`mt-1 truncate text-sm font-semibold tabular-nums ${t.value}`}>{detail}</p>
    </div>
  );
}
