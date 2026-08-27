"use client";

import type { ReactNode } from "react";
import { brl } from "./format";
import { useCountUp } from "./use-count-up";

// ---------------------------------------------------------------------
//  Elemento assinatura: o Arco da Meta.
//  Meio-círculo que vai do rosa ao azul da paleta, com o número grande no
//  vazio do arco. O painel inteiro carrega o degradê da marca e abriga os
//  dois cartões de insight nas laterais; as quatro pastilhas de resumo
//  ficam montadas na borda de baixo, como na referência.
// ---------------------------------------------------------------------
const W = 240;
const H = 132;
const CX = W / 2;
const CY = 112;
const R = 88;
const STROKE = 18;
const LEN = Math.PI * R; // comprimento do meio-arco

export function GoalArc({
  realizado,
  meta,
  progressoPct,
  premiacao,
  metasBatidas,
  totalPessoas,
  left,
  right,
}: {
  realizado: number;
  meta: number | null;
  progressoPct: number | null;
  premiacao: number;
  metasBatidas: number;
  totalPessoas: number;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const value = progressoPct ?? 0;
  const clamped = Math.min(value, 100);
  const animated = useCountUp(value, 1400);
  const offset = LEN * (1 - clamped / 100);
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
    <section className="relative sm:mb-11">
      <div className="tile tile-atelier px-4 pb-5 pt-4 sm:px-6 sm:pb-16">
        <p className="eyebrow text-center">Meta do time</p>

        <div className="mt-3 grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
          <div className="order-2 lg:order-1">{left}</div>

          <div className="order-1 flex flex-col items-center lg:order-2">
            <div className="relative" style={{ width: W, maxWidth: "100%" }}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                width="100%"
                role="img"
                aria-label={`Progresso da meta da equipe: ${Math.round(value)} por cento`}
              >
                <defs>
                  <linearGradient id="metaArc" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="var(--brand-rose)" />
                    <stop offset="0.5" stopColor="var(--brand-lilac)" />
                    <stop offset="1" stopColor="var(--brand-sky)" />
                  </linearGradient>
                </defs>

                <path
                  d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                  fill="none"
                  stroke="var(--ink-faint)"
                  strokeOpacity={0.2}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                  fill="none"
                  stroke="url(#metaArc)"
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={LEN}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 2.2s cubic-bezier(.45,.05,.2,1)" }}
                />
              </svg>

              <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
                <span className="font-display text-[2.6rem] font-semibold leading-none tabular-nums text-ink">
                  {Math.round(animated)}
                  <span className="text-2xl text-ink-soft">%</span>
                </span>
                <span className="eyebrow mt-1">performance</span>
              </div>
            </div>

            <p className="mt-2 text-center text-sm text-ink-soft">{mensagem}</p>
            <p className="text-center text-xs text-ink-faint">
              {totalPessoas > 0
                ? `${metasBatidas} de ${totalPessoas} ${totalPessoas === 1 ? "bateu" : "bateram"} a meta`
                : "Nenhuma profissional no período"}
            </p>
          </div>

          <div className="order-3">{right}</div>
        </div>
      </div>

      {/* Pastilhas de resumo. Em telas largas elas ficam montadas sobre a
          borda inferior do painel; no celular voltam para o fluxo normal,
          onde sobrepor cortaria o conteúdo seguinte. */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:flex sm:translate-y-1/2 sm:justify-center sm:gap-3 sm:px-4">
        <StatChip k="Realizado" v={brl(realizado)} tone="rose" />
        <StatChip k="Meta" v={meta ? brl(meta) : "—"} tone="serenity" />
        <StatChip
          k={excedente > 0 ? "Excedente" : "Faltam"}
          v={excedente > 0 ? brl(excedente) : falta !== null ? brl(falta) : "—"}
          tone="gold"
        />
        <StatChip k="Premiação" v={brl(premiacao)} tone="mint" />
      </div>
    </section>
  );
}

const CHIP_TONE = {
  mint: "var(--brand-mint)",
  serenity: "var(--brand-sky)",
  lavender: "var(--brand-lilac)",
  rose: "var(--brand-rose)",
  gold: "var(--brand-butter)",
} as const;

function StatChip({ k, v, tone }: { k: string; v: string; tone: keyof typeof CHIP_TONE }) {
  return (
    <div
      className="min-w-0 rounded-2xl border-2 bg-white/90 px-4 py-2 text-center shadow-sm backdrop-blur-sm dark:bg-[#241d31]/90 sm:px-6"
      style={{ borderColor: CHIP_TONE[tone] }}
    >
      <p className="eyebrow truncate">{k}</p>
      <p className="mt-0.5 truncate font-display text-base font-semibold tabular-nums text-ink">
        {v}
      </p>
    </div>
  );
}
