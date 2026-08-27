"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfPerformance } from "@/lib/dashboard/compute";
import { brl, initials, pct, progressBand, rankBadge } from "./format";

// ---------------------------------------------------------------------
//  Ranking. A ordem e o troféu vêm SEMPRE do percentual de atingimento da
//  meta — `rows` já chega ordenado por compute.ts e cada linha traz sua
//  `posicao`. Quem tem o maior percentual lidera, mesmo faturando menos.
// ---------------------------------------------------------------------
const GRID_COLS =
  "grid-cols-[44px_1.5fr_1fr_1fr_1.5fr_1fr_1fr] max-lg:grid-cols-[36px_1.4fr_1fr_1fr] max-lg:gap-3";

/**
 * `fitToHeight`: a tabela ocupa a altura do pai e distribui as linhas para
 * que o ranking inteiro apareça sem rolagem. Os tamanhos de fonte escalam
 * com a altura por linha (com limites) para continuar legível.
 */
export function PerformanceTable({
  rows,
  fitToHeight = false,
}: {
  rows: ProfPerformance[];
  fitToHeight?: boolean;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!fitToHeight) return;

    function recalc() {
      const el = bodyRef.current;
      if (!el || rows.length === 0) return;
      const available = el.clientHeight;
      if (available <= 0) return;
      const per = available / rows.length;
      setRowHeight(per);
      setScale(Math.max(0.9, Math.min(1.5, per / 58)));
    }

    recalc();
    const raf = requestAnimationFrame(recalc);
    const t = setTimeout(recalc, 150);
    const ro = new ResizeObserver(recalc);
    if (bodyRef.current) ro.observe(bodyRef.current);
    window.addEventListener("resize", recalc);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [fitToHeight, rows.length]);

  return (
    <div className={`card flex flex-col p-4 ${fitToHeight ? "h-full" : ""}`}>
      <div className="mb-2 flex flex-shrink-0 items-baseline justify-between gap-3">
        <h3
          className="font-display font-semibold text-ink"
          style={{ fontSize: fitToHeight ? `${1.3 * scale}rem` : "1.3rem" }}
        >
          Ranking por atingimento da meta
        </h3>
        <span className="eyebrow hidden truncate lg:block">
          Premiação: 10% do que passar da meta
        </span>
      </div>

      <TableHeader scale={fitToHeight ? scale : 1} />

      <div ref={bodyRef} className={`flex flex-col ${fitToHeight ? "min-h-0 flex-1" : ""}`}>
        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-ink-soft">
            Nenhuma venda no período selecionado.
          </p>
        ) : (
          rows.map((r) => (
            <PerfRow
              key={r.profissionalId}
              row={r}
              fitToHeight={fitToHeight}
              rowHeight={rowHeight}
              scale={scale}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TableHeader({ scale }: { scale: number }) {
  return (
    <div
      className={`grid ${GRID_COLS} flex-shrink-0 items-center gap-4 border-b border-ink-faint/20 px-2 pb-2 font-semibold uppercase tracking-[0.08em] text-ink-faint`}
      style={{ fontSize: `${Math.max(0.66, 0.76 * scale)}rem` }}
    >
      <div>#</div>
      <div>Profissional</div>
      <div>Faturamento</div>
      <div className="max-lg:hidden">Meta</div>
      <div className="max-lg:hidden">Progresso da meta</div>
      <div className="max-lg:hidden">Premiação</div>
      <div>Comissão</div>
    </div>
  );
}

function PerfRow({
  row,
  fitToHeight,
  rowHeight,
  scale,
}: {
  row: ProfPerformance;
  fitToHeight: boolean;
  rowHeight: number;
  scale: number;
}) {
  const band = progressBand(row.progressoPct);
  const target = Math.min(row.progressoPct ?? 0, 100);
  const [width, setWidth] = useState(0);
  const lider = row.posicao === 0 && row.progressoPct !== null;
  const bateu = row.progressoPct !== null && row.progressoPct >= 100;

  // Dois ticks de rAF garantem que o navegador pinte o estado 0% antes de
  // transicionar, senão o React agrupa os states e a animação não roda.
  useEffect(() => {
    setWidth(0);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setWidth(target));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [target]);

  const faltam = row.meta && row.meta > row.faturamento ? row.meta - row.faturamento : null;

  const fs = (rem: number) => ({ fontSize: `${+(rem * scale).toFixed(3)}rem` });
  const avatarPx = Math.round(36 * scale);
  const barPx = Math.max(6, Math.round(8 * scale));

  const rowStyle = fitToHeight && rowHeight ? { height: `${rowHeight}px` } : undefined;

  return (
    <div
      className={`grid ${GRID_COLS} items-center gap-4 overflow-hidden rounded-[12px] px-2 transition-colors hover:bg-white/40 dark:hover:bg-white/5 ${
        lider ? "bg-gradient-to-r from-brand-rose/20 to-transparent" : ""
      } ${fitToHeight ? "" : "border-b border-ink-faint/10 py-3 last:border-none"}`}
      style={rowStyle}
    >
      <div
        className={`text-center font-semibold tabular-nums ${row.posicao < 3 ? "" : "text-ink-faint"}`}
        style={fs(1.25)}
        title={`${row.posicao + 1}ª por atingimento da meta`}
      >
        {rankBadge(row.posicao)}
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-mint font-semibold text-onPastel"
          style={{ width: avatarPx, height: avatarPx, fontSize: `${0.78 * scale}rem` }}
          aria-hidden
        >
          {initials(row.nome)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-ink" style={fs(1.1)}>
            {row.nome}
          </div>
          <div className="truncate text-ink-faint" style={fs(0.82)}>
            {row.qtdLinhas} atendimentos
          </div>
        </div>
      </div>

      <div className="truncate font-semibold tabular-nums text-ink" style={fs(1.05)}>
        {brl(row.faturamento)}
      </div>

      <div className="truncate tabular-nums text-ink-soft max-lg:hidden" style={fs(1.05)}>
        {row.meta ? brl(row.meta) : "—"}
      </div>

      <div className="flex min-w-0 flex-col gap-1 max-lg:hidden">
        <div className="flex justify-between" style={fs(0.86)}>
          <span className={`truncate ${band.text}`}>{band.label}</span>
          <span className="ml-2 flex-shrink-0 font-semibold tabular-nums text-ink">
            {pct(row.progressoPct)}
          </span>
        </div>
        <div
          className="relative overflow-hidden rounded-full bg-ink-faint/[0.15]"
          style={{ height: barPx }}
        >
          <div
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
            style={{
              width: `${width}%`,
              background: band.bar,
              transition: "width 2.6s cubic-bezier(.45,.05,.2,1)",
            }}
          />
        </div>
        {faltam !== null && (
          <div className="truncate text-ink-faint" style={fs(0.8)}>
            Faltam {brl(faltam)}
          </div>
        )}
      </div>

      <div
        className={`truncate tabular-nums max-lg:hidden ${
          bateu ? "font-semibold text-accent-rose" : "text-ink-faint"
        }`}
        style={fs(1.05)}
        title={
          bateu
            ? `10% sobre o excedente de ${brl(row.excedente)}`
            : "Liberada só ao atingir 100% da meta"
        }
      >
        {brl(row.premiacao)}
      </div>

      <div className="truncate font-semibold tabular-nums text-accent-lavender" style={fs(1.05)}>
        {brl(row.comissaoAcumulada)}
      </div>
    </div>
  );
}
