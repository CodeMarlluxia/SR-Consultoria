"use client";

import { brl } from "./format";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Elemento assinatura: o "Anel da Meta".
//  O arco percorre as cinco cores da marca na ordem da paleta e termina
//  numa pérola — o marcador que mostra exatamente onde a equipe parou.
//  Pétalas discretas marcam 25 / 50 / 75 / 100%.
// ---------------------------------------------------------------------
const SIZE = 208;
const C = SIZE / 2;
const R = 84;
const CIRC = 2 * Math.PI * R;
const STROKE = 13;

function pointAt(percent: number): { x: number; y: number } {
  const rad = ((percent * 3.6 - 90) * Math.PI) / 180;
  return { x: C + R * Math.cos(rad), y: C + R * Math.sin(rad) };
}

export function GoalArc({
  realizado,
  meta,
  progressoPct,
  premiacao,
  metasBatidas,
  totalPessoas,
}: {
  realizado: number;
  meta: number | null;
  progressoPct: number | null;
  premiacao: number;
  metasBatidas: number;
  totalPessoas: number;
}) {
  const value = progressoPct ?? 0;
  const clamped = Math.min(value, 100);
  const animated = useCountUp(value, 1400);
  const offset = CIRC * (1 - clamped / 100);
  const pearl = pointAt(clamped);
  const falta = meta ? Math.max(0, meta - realizado) : null;
  const excedente = meta ? Math.max(0, realizado - meta) : 0;

  return (
    <div className="card flex flex-wrap items-center gap-x-9 gap-y-6 px-6 py-6">
      <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img"
             aria-label={`Progresso da meta geral: ${Math.round(value)} por cento`}>
          <defs>
            <linearGradient id="metaRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--rose)" />
              <stop offset="0.3" stopColor="var(--butter)" />
              <stop offset="0.6" stopColor="var(--mint)" />
              <stop offset="0.82" stopColor="var(--sky)" />
              <stop offset="1" stopColor="var(--lilac)" />
            </linearGradient>
          </defs>

          {/* trilho */}
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(63,58,77,0.07)" strokeWidth={STROKE} />

          {/* pétalas de referência */}
          {[25, 50, 75, 100].map((p) => {
            const outer = pointAt(p);
            return (
              <circle
                key={p}
                cx={outer.x}
                cy={outer.y}
                r={2}
                fill="rgba(63,58,77,0.18)"
              />
            );
          })}

          {/* arco preenchido */}
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke="url(#metaRing)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            transform={`rotate(-90 ${C} ${C})`}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.2,.8,.2,1)" }}
          />

          {/* pérola marcadora */}
          <g style={{ transition: "transform 1.5s cubic-bezier(.2,.8,.2,1)" }}>
            <circle cx={pearl.x} cy={pearl.y} r={9} fill="#ffffff" opacity={0.95} />
            <circle cx={pearl.x} cy={pearl.y} r={5} fill="var(--rose)" />
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[2.6rem] font-semibold leading-none tabular-nums text-ink">
            {Math.round(animated)}
            <span className="text-2xl text-ink-soft">%</span>
          </span>
          <span className="eyebrow mt-1.5">da meta geral</span>
        </div>
      </div>

      <div className="min-w-[240px] flex-1">
        <h2 className="font-display text-xl font-semibold text-ink">Meta da equipe</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {totalPessoas > 0
            ? `${metasBatidas} de ${totalPessoas} ${totalPessoas === 1 ? "profissional bateu" : "profissionais bateram"} a meta`
            : "Nenhuma profissional no período"}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Stat k="Realizado" v={brl(realizado)} tone="text-deep-mint" />
          <Stat k="Meta" v={meta ? brl(meta) : "—"} />
          <Stat
            k={excedente > 0 ? "Excedente" : "Faltam"}
            v={excedente > 0 ? brl(excedente) : falta !== null ? brl(falta) : "—"}
            tone={excedente > 0 ? "text-deep-lilac" : undefined}
          />
          <Stat k="Premiação da equipe" v={brl(premiacao)} tone="text-deep-rose" />
        </dl>
      </div>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div>
      <dt className="eyebrow">{k}</dt>
      <dd className={`mt-1 text-lg font-semibold tabular-nums ${tone ?? "text-ink"}`}>{v}</dd>
    </div>
  );
}
