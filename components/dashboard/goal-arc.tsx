"use client";

import { brl } from "./format";
import { useCountUp } from "./use-count-up";

const RADIUS = 68;
const CIRC = 2 * Math.PI * RADIUS;

/**
 * Global team-goal card. Content is spread across the available space:
 * a heading, a focal progress ring, and the key figures laid out in an even
 * horizontal row (no vertical stacking), centered within the card.
 */
export function GoalArc({
  realizado,
  meta,
  progressoPct,
}: {
  realizado: number;
  meta: number | null;
  progressoPct: number | null;
}) {
  const pct = progressoPct ?? 0;
  const clamped = Math.min(pct, 100);
  const animatedPct = useCountUp(pct, 1600);
  const offset = CIRC * (1 - clamped / 100);
  const falta = meta ? Math.max(0, meta - realizado) : null;

  return (
    <div className="glass flex h-full flex-col items-center justify-center gap-4 rounded-[18px] px-6 py-5">
      <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
        Meta Geral da Equipe
      </h3>

      <div className="flex w-full flex-1 flex-wrap items-center justify-around gap-6">
        {/* Focal progress ring */}
        <div className="relative h-[172px] w-[172px] flex-shrink-0">
          <svg viewBox="0 0 172 172" width={172} height={172}>
            <circle cx={86} cy={86} r={RADIUS} fill="none" stroke="rgba(154,148,168,0.18)" strokeWidth={15} />
            <circle
              cx={86}
              cy={86}
              r={RADIUS}
              fill="none"
              stroke="url(#goalGrad)"
              strokeWidth={15}
              strokeLinecap="round"
              transform="rotate(-90 86 86)"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 2.4s cubic-bezier(.45,.05,.2,1)" }}
            />
            <defs>
              <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c98da0" />
                <stop offset="0.5" stopColor="#a68fb8" />
                <stop offset="1" stopColor="#8fb89e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-4xl font-semibold tabular-nums text-accent-lavender">
              {Math.round(animatedPct)}%
            </div>
            <div className="text-xs uppercase tracking-[0.12em] text-ink-faint">da meta</div>
          </div>
        </div>

        {/* Key figures spread evenly (horizontal, not stacked) */}
        <div className="flex flex-1 flex-wrap items-center justify-around gap-6">
          <Stat k="Realizado" v={brl(realizado)} highlight />
          <Stat k="Meta" v={meta ? brl(meta) : "—"} big />
          <Stat k="Faltam" v={falta !== null ? brl(falta) : "—"} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  k,
  v,
  highlight,
  big,
}: {
  k: string;
  v: string;
  highlight?: boolean;
  big?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="mb-1 text-xs uppercase tracking-[0.1em] text-ink-faint">{k}</div>
      <div
        className={`font-semibold tabular-nums ${big ? "font-display text-3xl" : "text-2xl"} ${
          highlight ? "text-accent-mint" : "text-ink"
        }`}
      >
        {v}
      </div>
    </div>
  );
}
