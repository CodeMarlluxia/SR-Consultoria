"use client";

import { brl, initials } from "./format";
import { useCountUp } from "./use-count-up";

/** Big animated money/number KPI card. */
export function MetricCard({
  label,
  value,
  sub,
  accent = "mint",
  isCurrency = true,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: "mint" | "serenity" | "lavender" | "rose";
  isCurrency?: boolean;
}) {
  const animated = useCountUp(value);
  const valColor = {
    mint: "text-accent-mint",
    serenity: "text-accent-serenity",
    lavender: "text-accent-lavender",
    rose: "text-accent-rose",
  }[accent];

  return (
    <div className="glass relative overflow-hidden rounded-[18px] px-4 py-3.5 transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-lg">
      <div className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className={`font-display text-3xl font-semibold tabular-nums tracking-tight ${valColor}`}>
        {isCurrency ? brl(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </div>
      {sub && <div className="mt-0.5 text-xs text-ink-soft">{sub}</div>}
    </div>
  );
}

/** Champion card — crown (revenue) or star (volume). */
export function ChampionCard({
  variant,
  label,
  nome,
  stat,
}: {
  variant: "crown" | "bolt";
  label: string;
  nome: string;
  stat: string;
}) {
  const isCrown = variant === "crown";
  return (
    <div
      className={`glass relative overflow-hidden rounded-[18px] px-4 py-3.5 transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-lg ${
        isCrown
          ? "bg-gradient-to-br from-accent-gold/20 to-transparent"
          : "bg-gradient-to-br from-accent-rose/20 to-transparent"
      }`}
    >
      {isCrown ? (
        <div className="absolute right-3.5 top-3 text-xl opacity-80 transition-transform duration-700 hover:rotate-[360deg]" aria-hidden>
          💎
        </div>
      ) : (
        <div
          className="absolute right-3.5 top-3 flex h-8 w-8 animate-float items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#d9a3b1,#c98da0)" }}
          aria-hidden
        >
          ★
        </div>
      )}
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{
            background: isCrown
              ? "linear-gradient(135deg,#d8cd8f,#c2b155)"
              : "linear-gradient(135deg,#d9a3b1,#c98da0)",
          }}
        >
          {initials(nome)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-semibold text-ink">{nome}</div>
          <div className="text-xs text-ink-soft">{stat}</div>
        </div>
      </div>
    </div>
  );
}

/** Compact analytical card (most-executed service / best-selling category). */
export function InsightCard({
  label,
  title,
  detail,
  accent = "serenity",
  icon,
}: {
  label: string;
  title: string;
  detail: string;
  accent?: "serenity" | "lavender";
  icon: string;
}) {
  const detailColor = accent === "serenity" ? "text-accent-serenity" : "text-accent-lavender";
  return (
    <div className="glass relative flex flex-col justify-center overflow-hidden rounded-[18px] px-5 py-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-glass-lg">
      <div className="absolute right-4 top-4 text-2xl opacity-70" aria-hidden>{icon}</div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="truncate pr-8 font-display text-2xl font-semibold text-ink" title={title}>{title}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${detailColor}`}>{detail}</div>
    </div>
  );
}
