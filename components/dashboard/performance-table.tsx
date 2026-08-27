"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfPerformance } from "@/lib/dashboard/compute";
import { Avatar } from "@/components/avatar";
import { IconTrophy } from "@/components/icons";
import { brl, pct, progressBand } from "./format";

// ---------------------------------------------------------------------
//  Ranking. A ordem e o troféu vêm SEMPRE do percentual de atingimento da
//  meta — `rows` já chega ordenado por compute.ts e cada linha traz sua
//  `posicao`. Quem tem o maior percentual lidera, mesmo faturando menos.
// ---------------------------------------------------------------------
const GRID_COLS =
  "grid-cols-[36px_1.5fr_1fr_1fr_2.4fr_1fr_1fr] max-lg:grid-cols-[30px_1.4fr_1fr_1fr] max-lg:gap-3";

/**
 * `fitToHeight`: a tabela ocupa a altura do pai e distribui as linhas para
 * que o ranking inteiro apareça sem rolagem (modo tela cheia). Os tamanhos
 * de fonte escalam com a altura por linha, com limites, para continuar
 * legível. Fora dele a tabela tem altura natural e a página rola.
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

  const s = fitToHeight ? scale : 1;

  return (
    <section className={`flex flex-col ${fitToHeight ? "h-full min-h-0" : ""}`}>
      <h3
        className="mb-2 flex-shrink-0 font-display font-semibold text-ink"
        style={{ fontSize: `${1.3 * s}rem` }}
      >
        Ranking de atendimento
      </h3>

      <div className={`tile flex flex-col overflow-hidden p-0 ${fitToHeight ? "min-h-0 flex-1" : ""}`}>
        <TableHeader scale={s} />

        <div ref={bodyRef} className={`flex flex-col ${fitToHeight ? "min-h-0 flex-1" : ""}`}>
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-soft">
              Nenhuma venda no período selecionado.
            </p>
          ) : (
            rows.map((r) => (
              <PerfRow
                key={r.profissionalId}
                row={r}
                fitToHeight={fitToHeight}
                rowHeight={rowHeight}
                scale={s}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function TableHeader({ scale }: { scale: number }) {
  return (
    <div
      className={`grid ${GRID_COLS} flex-shrink-0 items-center gap-4 bg-brand-lilac/25 px-4 py-2.5 font-semibold uppercase tracking-[0.1em] text-ink-soft dark:bg-white/[0.06]`}
      style={{ fontSize: `${Math.max(0.62, 0.7 * scale)}rem` }}
    >
      <div>#</div>
      <div>Profissional</div>
      <div className="text-right">Faturamento</div>
      <div className="text-right max-lg:hidden">Meta</div>
      <div className="max-lg:hidden">Progresso da meta</div>
      <div className="text-right max-lg:hidden">Premiação</div>
      <div className="text-right">Comissão</div>
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

  const fs = (rem: number) => ({ fontSize: `${+(rem * scale).toFixed(3)}rem` });
  const avatarPx = Math.round(32 * scale);
  const barPx = Math.max(20, Math.round(24 * scale));

  // Com metade ou mais da barra preenchida o rótulo cai sobre o pastel;
  // abaixo disso ele fica sobre o trilho e usa a cor de texto do tema.
  const overFill = target >= 55;

  const rowStyle = fitToHeight && rowHeight ? { height: `${rowHeight}px` } : undefined;

  return (
    <div
      className={`grid ${GRID_COLS} items-center gap-4 border-t border-ink-faint/15 px-4 transition-colors hover:bg-white/50 dark:hover:bg-white/5 ${
        bateu ? "bg-brand-mint/20 dark:bg-brand-mint/[0.07]" : ""
      } ${fitToHeight ? "" : "py-2.5"}`}
      style={rowStyle}
    >
      <div
        className={`font-semibold tabular-nums ${lider ? "text-accent-rose" : "text-ink-faint"}`}
        style={fs(0.95)}
        title={`${row.posicao + 1}ª por atingimento da meta`}
      >
        {row.posicao + 1}
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar
          nome={row.nome}
          style={{ width: avatarPx, height: avatarPx, fontSize: `${0.66 * scale}rem` }}
        />
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-semibold uppercase text-ink" style={fs(0.92)}>
            {row.nome}
          </span>
          {lider && (
            <IconTrophy
              className="h-[1em] w-[1em] flex-shrink-0 text-accent-gold"
              style={fs(1)}
              aria-label="Líder do ranking"
            />
          )}
        </div>
      </div>

      <div className="truncate text-right tabular-nums text-ink" style={fs(0.95)}>
        {brl(row.faturamento)}
      </div>

      <div className="truncate text-right tabular-nums text-ink-soft max-lg:hidden" style={fs(0.95)}>
        {row.meta ? brl(row.meta) : "—"}
      </div>

      <div className="flex min-w-0 items-center gap-3 max-lg:hidden">
        <div
          className="relative min-w-0 flex-1 overflow-hidden rounded-full bg-brand-lilac/25 dark:bg-white/10"
          style={{ height: barPx }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${width}%`,
              background: band.bar,
              transition: "width 2.6s cubic-bezier(.45,.05,.2,1)",
            }}
          />
          <span
            className={`absolute inset-0 flex items-center justify-center font-semibold tabular-nums ${
              overFill ? "text-onPastel" : "text-ink"
            }`}
            style={fs(0.78)}
          >
            {pct(row.progressoPct)}
          </span>
        </div>
        <span
          className="w-[5.5rem] flex-shrink-0 truncate text-ink-soft"
          style={fs(0.8)}
          title={
            row.meta && row.meta > row.faturamento
              ? `Faltam ${brl(row.meta - row.faturamento)}`
              : undefined
          }
        >
          {band.label}
        </span>
      </div>

      <div
        className={`truncate text-right tabular-nums max-lg:hidden ${
          bateu ? "font-semibold text-accent-mint" : "text-ink-faint"
        }`}
        style={fs(0.95)}
        title={
          bateu
            ? `10% sobre o excedente de ${brl(row.excedente)}`
            : "Liberada só ao atingir 100% da meta"
        }
      >
        {brl(row.premiacao)}
      </div>

      <div className="truncate text-right font-semibold tabular-nums text-accent-lavender" style={fs(0.95)}>
        {brl(row.comissaoAcumulada)}
      </div>
    </div>
  );
}
