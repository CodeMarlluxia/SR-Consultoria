"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfPerformance } from "@/lib/dashboard/compute";
import { brl, initials, progressBand } from "./format";

const GRID_COLS =
  "grid-cols-[44px_1.6fr_1fr_1fr_1.6fr_1fr] max-lg:grid-cols-[36px_1.4fr_1fr_1fr] max-lg:gap-3";

/**
 * `fitToHeight`: the table fills its parent's height and distributes rows
 * evenly so the whole ranking is visible with NO scrolling. Font sizes scale
 * with the per-row height (clamped) so it stays legible with few or many rows.
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
      // Base design row ≈ 64px at scale 1; keep text legible but bounded.
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
    <div className={`glass flex flex-col rounded-[18px] p-4 ${fitToHeight ? "h-full" : ""}`}>
      <h3
        className="mb-2 flex-shrink-0 font-display font-semibold text-ink"
        style={{ fontSize: fitToHeight ? `${1.3 * scale}rem` : "1.3rem" }}
      >
        Ranking de Vendas
      </h3>

      <TableHeader scale={fitToHeight ? scale : 1} />

      <div ref={bodyRef} className={`flex flex-col ${fitToHeight ? "min-h-0 flex-1" : ""}`}>
        {rows.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-ink-soft">
            Nenhuma venda no período selecionado.
          </p>
        ) : (
          rows.map((r, i) => (
            <PerfRow
              key={r.profissionalId}
              row={r}
              rank={i}
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
      className={`grid ${GRID_COLS} flex-shrink-0 items-center gap-4 border-b border-ink-faint/20 px-2 pb-2 font-medium uppercase tracking-[0.08em] text-ink-faint`}
      style={{ fontSize: `${Math.max(0.7, 0.8 * scale)}rem` }}
    >
      <div>#</div>
      <div>Vendedora</div>
      <div>Faturamento</div>
      <div className="max-lg:hidden">Meta Definida</div>
      <div className="max-lg:hidden">Progresso da meta</div>
      <div>Comissão</div>
    </div>
  );
}

function PerfRow({
  row,
  rank,
  fitToHeight,
  rowHeight,
  scale,
}: {
  row: ProfPerformance;
  rank: number;
  fitToHeight: boolean;
  rowHeight: number;
  scale: number;
}) {
  const band = progressBand(row.progressoPct);
  const target = Math.min(row.progressoPct ?? 0, 100);
  const [width, setWidth] = useState(0);

  // Slow, smooth, harmonious fill. Two rAF ticks guarantee the browser paints
  // the 0% start state before transitioning to the target, so the animation
  // reliably plays (a plain state set can be batched and skip the transition).
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

  const faltam =
    row.meta && row.meta > row.faturamento ? row.meta - row.faturamento : null;

  const fs = (rem: number) => ({ fontSize: `${+(rem * scale).toFixed(3)}rem` });
  const avatarPx = Math.round(38 * scale);
  const barPx = Math.max(6, Math.round(9 * scale));

  const rowStyle = fitToHeight && rowHeight ? { height: `${rowHeight}px` } : undefined;

  return (
    <div
      className={`grid ${GRID_COLS} items-center gap-4 overflow-hidden rounded-[12px] px-2 transition-colors hover:bg-white/40 dark:hover:bg-white/5 ${
        fitToHeight ? "" : "border-b border-ink-faint/10 py-3 last:border-none"
      }`}
      style={rowStyle}
    >
      <div
        className={`text-center font-semibold ${rank === 0 ? "" : "text-ink-faint"}`}
        style={fs(1.3)}
      >
        {rank === 0 ? "🏆" : rank + 1}
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
          style={{
            width: avatarPx,
            height: avatarPx,
            fontSize: `${0.8 * scale}rem`,
            background: "linear-gradient(135deg,#9db8c9,#a3c2ae)",
          }}
        >
          {initials(row.nome)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-ink" style={fs(1.15)}>
            {row.nome}
          </div>
          <div className="truncate text-ink-faint" style={fs(0.85)}>
            {row.qtdLinhas} atendimentos
          </div>
        </div>
      </div>

      <div className="font-semibold tabular-nums text-accent-mint" style={fs(1.1)}>
        {brl(row.faturamento)}
      </div>

      <div className="font-medium tabular-nums text-ink-soft max-lg:hidden" style={fs(1.1)}>
        {row.meta ? brl(row.meta) : "—"}
      </div>

      <div className="flex min-w-0 flex-col gap-1 max-lg:hidden">
        <div className="flex justify-between" style={fs(0.9)}>
          <span className="truncate text-ink-soft">{band.label}</span>
          <span className="ml-2 flex-shrink-0 font-semibold tabular-nums text-ink">
            {row.progressoPct !== null ? `${row.progressoPct}%` : "—"}
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
              background: "linear-gradient(90deg,#c98da0,#a68fb8 50%,#8fb89e)",
              // Slow & smooth: long ease so the fill glides in harmoniously.
              transition: "width 2.6s cubic-bezier(.45,.05,.2,1)",
            }}
          />
        </div>
        {faltam !== null && (
          <div className="truncate text-ink-faint" style={fs(0.84)}>
            Faltam {brl(faltam)}
          </div>
        )}
      </div>

      <div className="font-semibold tabular-nums text-accent-lavender" style={fs(1.1)}>
        {brl(row.comissaoAcumulada)}
      </div>
    </div>
  );
}
