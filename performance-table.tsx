"use client";

import { useEffect, useState } from "react";
import type { ProfPerformance } from "@/lib/dashboard/compute";
import { brl, initials, progressBand } from "./format";

export function PerformanceTable({ rows }: { rows: ProfPerformance[] }) {
  return (
    <div className="rounded-[18px] border border-base-600 bg-base-800/60 p-6">
      <h3 className="mb-5 text-xl font-bold">Performance individual</h3>

      <div className="grid grid-cols-[40px_1.6fr_1fr_1.4fr_1fr] items-center gap-4 border-b border-base-600 px-2 pb-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-text-dim max-lg:grid-cols-[32px_1.4fr_1fr_1fr] max-lg:gap-3">
        <div>#</div>
        <div>Vendedora</div>
        <div>Faturamento</div>
        <div className="max-lg:hidden">Progresso da meta</div>
        <div>Comissão</div>
      </div>

      {rows.length === 0 ? (
        <p className="px-2 py-8 text-center text-sm text-text-dim">
          Nenhuma venda no período selecionado.
        </p>
      ) : (
        rows.map((r, i) => <PerfRow key={r.profissionalId} row={r} rank={i} />)
      )}
    </div>
  );
}

function PerfRow({ row, rank }: { row: ProfPerformance; rank: number }) {
  const band = progressBand(row.progressoPct);
  const target = Math.min(row.progressoPct ?? 0, 100);
  const [width, setWidth] = useState(0);

  // Animate the bar fill on mount and whenever the target changes (filter).
  useEffect(() => {
    const t = setTimeout(() => setWidth(target), 100);
    return () => clearTimeout(t);
  }, [target]);

  const fillStyle: Record<string, string> = {
    "fill-lime": "linear-gradient(90deg,#228b22,#32cd32)",
    "fill-royal": "linear-gradient(90deg,#2a4bb5,#4169e1)",
    "fill-tomato": "linear-gradient(90deg,#d9432a,#ff6347)",
  };
  const glowStyle: Record<string, string> = {
    "fill-lime": "0 0 10px rgba(50,205,50,0.4)",
    "fill-royal": "0 0 10px rgba(65,105,225,0.4)",
    "fill-tomato": "0 0 10px rgba(255,99,71,0.4)",
  };

  return (
    <div className="grid grid-cols-[40px_1.6fr_1fr_1.4fr_1fr] items-center gap-4 border-b border-base-600/60 px-2 py-3.5 last:border-none max-lg:grid-cols-[32px_1.4fr_1fr_1fr] max-lg:gap-3">
      <div className={`text-center text-base font-extrabold ${rank === 0 ? "text-game-gold" : "text-text-dim"}`}>
        {rank === 0 ? "🏆" : rank + 1}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-base"
          style={{ background: "linear-gradient(135deg,#4169e1,#32cd32)" }}
        >
          {initials(row.nome)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{row.nome}</div>
          <div className="text-[0.72rem] text-text-dim">{row.qtdLinhas} atendimentos</div>
        </div>
      </div>

      <div className="text-sm font-bold tabular-nums text-game-lime">{brl(row.faturamento)}</div>

      <div className="flex flex-col gap-1.5 max-lg:hidden">
        <div className="flex justify-between text-[0.78rem]">
          <span className="text-text-dim">{band.label}</span>
          <span className="font-bold tabular-nums">
            {row.progressoPct !== null ? `${row.progressoPct}%` : "—"}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-[5px] bg-base-600/80">
          <div
            className="absolute inset-y-0 left-0 overflow-hidden rounded-[5px]"
            style={{
              width: `${width}%`,
              background: fillStyle[band.fill] ?? "#1E2942",
              boxShadow: glowStyle[band.fill],
              transition: "width 1.2s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div className="absolute inset-y-0 w-[40%] animate-progress-shine bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>
        {row.projecaoFechamento !== null && row.projecaoFechamento !== row.faturamento && (
          <div className="text-[0.7rem] text-text-dim">
            proj. fechamento: {brl(row.projecaoFechamento)}
          </div>
        )}
      </div>

      <div className="text-sm font-bold tabular-nums text-game-purple">{brl(row.comissaoAcumulada)}</div>
    </div>
  );
}
