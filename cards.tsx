"use client";

import { brl, initials } from "./format";
import { useCountUp } from "./use-count-up";

/** Big animated money/number KPI card. */
export function MetricCard({
  label,
  value,
  sub,
  accent = "lime",
  isCurrency = true,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: "lime" | "royal" | "purple" | "tomato";
  isCurrency?: boolean;
}) {
  const animated = useCountUp(value);
  const accentMap = {
    lime: "text-game-lime border-game-lime/35 shadow-glow-lime",
    royal: "text-game-royal border-game-royal/35 shadow-glow-royal",
    purple: "text-game-purple border-game-purple/40 shadow-glow-purple",
    tomato: "text-game-tomato border-game-tomato/40 shadow-glow-tomato",
  }[accent];

  return (
    <div className={`relative overflow-hidden rounded-[18px] border bg-base-800/75 p-5 ${accentMap.split(" ").slice(1).join(" ")}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-dim">{label}</div>
      <div className={`text-3xl font-extrabold tabular-nums ${accentMap.split(" ")[0]}`}>
        {isCurrency ? brl(animated) : Math.round(animated).toLocaleString("pt-BR")}
      </div>
      {sub && <div className="mt-1 text-xs text-text-dim">{sub}</div>}
    </div>
  );
}

/** Champion card — crown (revenue) or bolt (volume). */
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
      className={[
        "relative overflow-hidden rounded-[18px] border p-5",
        isCrown
          ? "border-game-gold/45 shadow-glow-gold"
          : "border-game-tomato/40 shadow-glow-tomato bg-base-800/75",
      ].join(" ")}
      style={
        isCrown
          ? { background: "linear-gradient(160deg, rgba(255,215,0,0.08), rgba(14,20,32,0.75))" }
          : undefined
      }
    >
      <div
        className="absolute right-3 top-2 text-3xl"
        style={{
          filter: isCrown
            ? "drop-shadow(0 0 10px rgba(255,215,0,0.6))"
            : "drop-shadow(0 0 8px rgba(255,99,71,0.6))",
          animation: isCrown ? "bob 2.5s ease-in-out infinite" : undefined,
        }}
        aria-hidden
      >
        {isCrown ? "👑" : "⚡"}
      </div>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-dim">{label}</div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-base"
          style={{
            background: isCrown
              ? "linear-gradient(135deg, #ffd700, #e6a800)"
              : "linear-gradient(135deg, #ff6347, #9932cc)",
            boxShadow: isCrown
              ? "0 0 20px rgba(255,215,0,0.5)"
              : "0 0 20px rgba(255,99,71,0.4)",
          }}
        >
          {initials(nome)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold">{nome}</div>
          <div className="text-xs text-text-dim">{stat}</div>
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
  accent = "royal",
  icon,
}: {
  label: string;
  title: string;
  detail: string;
  accent?: "royal" | "purple";
  icon: string;
}) {
  const border = accent === "royal" ? "border-game-royal/35" : "border-game-purple/40";
  const detailColor = accent === "royal" ? "text-game-royal" : "text-game-purple";
  return (
    <div className={`relative overflow-hidden rounded-[18px] border bg-base-800/75 p-5 ${border}`}>
      <div className="absolute right-4 top-4 text-xl opacity-70" aria-hidden>{icon}</div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-dim">{label}</div>
      <div className="truncate text-lg font-bold" title={title}>{title}</div>
      <div className={`mt-1 text-sm font-semibold tabular-nums ${detailColor}`}>{detail}</div>
    </div>
  );
}
