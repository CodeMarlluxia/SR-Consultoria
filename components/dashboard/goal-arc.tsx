"use client";

import { brl } from "./format";
import { useCountUp } from "./use-count-up";
import { IconSparkle } from "@/components/icons";

// ---------------------------------------------------------------------
//  Elemento assinatura: o Anel da Meta.
//  O arco percorre as cinco cores da marca na ordem da paleta e termina
//  numa pérola, que marca exatamente onde a equipe parou. Pétalas discretas
//  marcam 25 / 50 / 75 / 100%.
// ---------------------------------------------------------------------
const SIZE = 176;
const C = SIZE / 2;
const R = 70;
const CIRC = 2 * Math.PI * R;
const STROKE = 12;

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

  const mensagem =
    meta === null
      ? "Defina uma meta para acompanhar o progresso."
      : value >= 100
        ? "Meta batida! Parabéns ao time."
        : value >= 90
          ? "Quase lá — faltam só os últimos detalhes."
          : value >= 50
            ? "No ritmo certo para fechar o mês bem."
            : "Início de jornada — vamos acelerar juntas.";

  return (
    <div className="card relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden px-5 py-4">
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-lilac), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative w-full text-center">
        <h3 className="flex items-center justify-center gap-1.5 font-display text-lg font-semibold italic text-ink">
          <IconSparkle className="h-4 w-4 flex-shrink-0 not-italic text-accent-lavender" aria-hidden />
          Meta do Time
        </h3>
        <p className="mt-0.5 text-xs text-ink-soft">{mensagem}</p>
        <p className="mt-0.5 text-[0.7rem] text-ink-faint">
          {totalPessoas > 0
            ? `${metasBatidas} de ${totalPessoas} ${totalPessoas === 1 ? "bateu" : "bateram"} a meta`
            : "Nenhuma profissional no período"}
        </p>
      </div>

      <div className="relative mx-auto flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={`Progresso da meta da equipe: ${Math.round(value)} por cento`}
        >
          <defs>
            <linearGradient id="metaRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--brand-rose)" />
              <stop offset="0.3" stopColor="var(--brand-butter)" />
              <stop offset="0.6" stopColor="var(--brand-mint)" />
              <stop offset="0.82" stopColor="var(--brand-sky)" />
              <stop offset="1" stopColor="var(--brand-lilac)" />
            </linearGradient>
          </defs>

          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--ink-faint)" strokeOpacity={0.18} strokeWidth={STROKE} />

          {[25, 50, 75, 100].map((p) => {
            const tick = pointAt(p);
            return <circle key={p} cx={tick.x} cy={tick.y} r={1.8} fill="var(--ink-faint)" fillOpacity={0.55} />;
          })}

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
            style={{ transition: "stroke-dashoffset 2.2s cubic-bezier(.45,.05,.2,1)" }}
          />

          {/* pérola marcadora */}
          <circle cx={pearl.x} cy={pearl.y} r={8} fill="var(--glass-bg)" />
          <circle cx={pearl.x} cy={pearl.y} r={8} fill="#ffffff" fillOpacity={0.85} />
          <circle cx={pearl.x} cy={pearl.y} r={4.5} fill="var(--brand-rose)" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[2.2rem] font-semibold leading-none tabular-nums text-ink">
            {Math.round(animated)}
            <span className="text-xl text-ink-soft">%</span>
          </span>
          <span className="eyebrow mt-1">performance</span>
        </div>
      </div>

      <div className="relative grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        <StatChip k="Realizado" v={brl(realizado)} tone="mint" />
        <StatChip k="Meta" v={meta ? brl(meta) : "—"} tone="serenity" />
        <StatChip
          k={excedente > 0 ? "Excedente" : "Faltam"}
          v={excedente > 0 ? brl(excedente) : falta !== null ? brl(falta) : "—"}
          tone={excedente > 0 ? "lavender" : "rose"}
        />
        <StatChip k="Premiação" v={brl(premiacao)} tone="gold" />
      </div>
    </div>
  );
}

const CHIP_TONE: Record<string, { bg: string; text: string }> = {
  mint:      { bg: "bg-brand-mint/22",   text: "text-accent-mint" },
  serenity:  { bg: "bg-brand-sky/22",    text: "text-accent-serenity" },
  lavender:  { bg: "bg-brand-lilac/22",  text: "text-accent-lavender" },
  rose:      { bg: "bg-brand-rose/22",   text: "text-accent-rose" },
  gold:      { bg: "bg-brand-butter/28", text: "text-accent-gold" },
};

function StatChip({ k, v, tone }: { k: string; v: string; tone: keyof typeof CHIP_TONE }) {
  const t = CHIP_TONE[tone];
  return (
    <div
      className={`min-w-0 rounded-2xl border border-ink-faint/15 px-3 py-2.5 text-center ${t.bg}`}
    >
      <p className="eyebrow truncate">{k}</p>
      <p className={`mt-1 truncate font-display text-lg font-semibold tabular-nums ${t.text}`}>{v}</p>
    </div>
  );
}
