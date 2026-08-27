"use client";

import { LogoMark } from "@/components/brand-mark";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Cada card recebe um véu suave da cor do tom (--tint) no fundo, que dá o
//  tom colorido e delicado ao conjunto sem pesar a leitura. Os pastéis vêm
//  de --brand-* (superfície, constante nos temas); os números usam
//  text-accent-*, que clareia no modo escuro.
// ---------------------------------------------------------------------
export type Tone = "rose" | "gold" | "mint" | "serenity" | "lavender";

const TONE: Record<Tone, { value: string; chip: string; tint: string }> = {
  rose:      { value: "text-accent-rose",     chip: "bg-brand-rose/30",   tint: "from-brand-rose/20" },
  gold:      { value: "text-accent-gold",     chip: "bg-brand-butter/35", tint: "from-brand-butter/22" },
  mint:      { value: "text-accent-mint",     chip: "bg-brand-mint/35",   tint: "from-brand-mint/20" },
  serenity:  { value: "text-accent-serenity", chip: "bg-brand-sky/35",    tint: "from-brand-sky/20" },
  lavender:  { value: "text-accent-lavender", chip: "bg-brand-lilac/30",  tint: "from-brand-lilac/18" },
};

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
  const t = TONE[tone];
  const brlCompact = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className={`card overflow-hidden bg-gradient-to-br ${t.tint} to-transparent px-4 pb-3.5 pt-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        <LogoMark className="h-8 w-8" />
      </div>
      <p
        className={`mt-2 truncate font-display text-2xl font-semibold leading-none tabular-nums tracking-tight ${t.value}`}
      >
        {isCurrency ? brlCompact(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </p>
      {sub && <p className="mt-1.5 truncate text-[0.7rem] text-ink-soft">{sub}</p>}
    </div>
  );
}

/** Card de destaque com avatar da profissional. */
export function ChampionCard({
  tone,
  label,
  nome,
  stat,
  hint,
  highlight = false,
}: {
  tone: Tone;
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
        "card overflow-hidden bg-gradient-to-br px-4 pb-3.5 pt-4",
        t.tint,
        "to-transparent",
        highlight ? "ring-1 ring-brand-rose/60" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <LogoMark className="h-8 w-8" />
        <span className={`truncate rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${t.chip} ${t.value}`}>
          {label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <LogoMark className="h-9 w-9" />
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
}: {
  label: string;
  title: string;
  detail: string;
  tone?: Tone;
}) {
  const t = TONE[tone];

  return (
    <div className={`card flex flex-col justify-center overflow-hidden bg-gradient-to-br ${t.tint} to-transparent px-4 pb-4 pt-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow truncate">{label}</p>
        <LogoMark className="h-8 w-8" />
      </div>
      <p className="mt-2 truncate font-display text-xl font-semibold italic text-ink" title={title}>
        {title}
      </p>
      <p className={`mt-1 truncate text-sm font-semibold tabular-nums ${t.value}`}>{detail}</p>
    </div>
  );
}
