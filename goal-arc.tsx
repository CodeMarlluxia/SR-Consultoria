"use client";

import { brl } from "./format";
import { useCountUp } from "./use-count-up";

const RADIUS = 76;
const CIRC = 2 * Math.PI * RADIUS;

/** Circular progress arc for the global team goal. */
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
  const animatedPct = useCountUp(pct, 1400);
  const offset = CIRC * (1 - clamped / 100);
  const falta = meta ? Math.max(0, meta - realizado) : null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-8 rounded-[18px] border border-base-600 bg-base-800/75 p-7">
      <div className="relative h-[180px] w-[180px] flex-shrink-0">
        <svg viewBox="0 0 180 180" width={180} height={180}>
          <circle cx={90} cy={90} r={RADIUS} fill="none" stroke="rgba(30,41,66,0.8)" strokeWidth={14} />
          <circle
            cx={90}
            cy={90}
            r={RADIUS}
            fill="none"
            stroke="url(#goalGrad)"
            strokeWidth={14}
            strokeLinecap="round"
            transform="rotate(-90 90 90)"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)",
              filter: "drop-shadow(0 0 8px rgba(65,105,225,0.6))",
            }}
          />
          <defs>
            <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4169e1" />
              <stop offset="1" stopColor="#32cd32" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-4xl font-extrabold tabular-nums text-game-royal"
            style={{ textShadow: "0 0 16px rgba(65,105,225,0.6)" }}
          >
            {Math.round(animatedPct)}%
          </div>
          <div className="text-xs uppercase tracking-[0.1em] text-text-dim">da meta geral</div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="mb-4 text-xl font-bold">Meta geral da equipe</h3>
        <div className="flex flex-wrap gap-8">
          <Stat k="Realizado" v={brl(realizado)} highlight />
          <Stat k="Meta" v={meta ? brl(meta) : "—"} />
          <Stat k="Faltam" v={falta !== null ? brl(falta) : "—"} />
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.08em] text-text-dim">{k}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${highlight ? "text-game-lime" : ""}`}>{v}</div>
    </div>
  );
}
