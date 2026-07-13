"use client";

import { useEffect, useMemo, useState } from "react";
import { computeDashboard } from "@/lib/dashboard/compute";
import type { DashboardPayload } from "@/lib/dashboard/data";
import { MetricCard, ChampionCard, InsightCard } from "./cards";
import { GoalArc } from "./goal-arc";
import { PerformanceTable } from "./performance-table";
import { DateRangePicker, FullscreenButton } from "./controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { brl, shortDate } from "./format";

export function Dashboard({ payload }: { payload: DashboardPayload }) {
  const { from, to, boundsMin, boundsMax, sales, metas, diasNoMes, diasDecorridos } = payload;

  const [isFull, setIsFull] = useState(false);

  const metasMap = useMemo(
    () => new Map(metas.map((m) => [m.profissionalId, m.valorMeta])),
    [metas],
  );

  // `sales` already arrives filtered to the selected window by the server,
  // so there is no second, client-side period filter to keep in sync.
  const data = useMemo(
    () => computeDashboard(sales, metasMap, diasDecorridos, diasNoMes),
    [sales, metasMap, diasDecorridos, diasNoMes],
  );

  const hasData = payload.sales.length > 0;

  // While in fullscreen, lock the underlying page scroll.
  useEffect(() => {
    if (!isFull) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFull]);

  // The dashboard is a fixed-height (viewport) flex column so EVERYTHING fits
  // on screen at once — no vertical or horizontal scrolling. The ranking table
  // takes the remaining height and distributes its rows to fill it.
  // Fullscreen paints its own theme-aware aurora (via `.aurora-bg`) so the
  // backdrop follows light/dark just like the normal page. The partial view
  // subtracts the shared --nav-h token so the math never drifts from the navbar.
  const containerClass = isFull
    ? "aurora-bg fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8"
    : "flex h-[calc(100dvh-var(--nav-h))] w-full flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8";

  return (
    <div className={`${containerClass} flex flex-col`}>
      {/* Header — compact, no subtitle */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink xl:text-4xl">
          SR Consultoria — Hub de Performance
        </h1>
        <div className="flex items-center gap-3">
          {boundsMin && boundsMax && from && to && (
            <DateRangePicker min={boundsMin} max={boundsMax} from={from} to={to} />
          )}
          <FullscreenButton onToggle={setIsFull} />
          <ThemeToggle />
        </div>
      </div>

      {!hasData ? (
        <div className="glass mt-6 flex flex-1 flex-col items-center justify-center rounded-[18px] p-10 text-center">
          <p className="text-lg font-semibold text-ink">
            {from && to
              ? `Nenhuma venda entre ${shortDate(from)} e ${shortDate(to)}.`
              : "Nenhuma venda importada ainda."}
          </p>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            {boundsMin && boundsMax
              ? "Ajuste as datas acima para ver outro período, ou importe o relatório deste mês na aba de metas."
              : "Importe o relatório do período na aba de metas para ver o placar."}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
          {/* Scoreboard — responsive grid */}
          <div className="grid flex-shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Faturamento total" value={data.totalFaturamento} sub="no período" accent="mint" />
            {data.topPorReceita && (
              <ChampionCard
                variant="crown"
                label="Quem mais vendeu"
                nome={data.topPorReceita.nome}
                stat={brl(data.topPorReceita.faturamento)}
              />
            )}
            {data.topPorVolume && (
              <ChampionCard
                variant="bolt"
                label="Quem mais atendeu"
                nome={data.topPorVolume.nome}
                stat={`${data.topPorVolume.qtdLinhas} atendimentos`}
              />
            )}
            <MetricCard label="Comissão total" value={data.totalComissao} sub="a pagar" accent="lavender" />
          </div>

          {/* Analytical cards + centered global goal */}
          <div className="grid flex-shrink-0 grid-cols-1 gap-3 lg:grid-cols-[1fr_1.6fr_1fr]">
            {data.servicoMaisExecutado ? (
              <InsightCard
                label="Serviço mais executado"
                title={data.servicoMaisExecutado.nome}
                detail={`${data.servicoMaisExecutado.ocorrencias} ocorrências`}
                accent="serenity"
                icon="✂"
              />
            ) : (
              <div className="hidden lg:block" />
            )}

            <GoalArc
              realizado={data.totalFaturamento}
              meta={data.metaGlobal}
              progressoPct={data.progressoGlobalPct}
            />

            {data.categoriaMaisVendida ? (
              <InsightCard
                label="Categoria mais vendida"
                title={data.categoriaMaisVendida.nome}
                detail={brl(data.categoriaMaisVendida.receita)}
                accent="lavender"
                icon="💎"
              />
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          {/* Ranking table — fills the remaining height, rows auto-fit */}
          <div className="min-h-0 flex-1">
            <PerformanceTable rows={data.rows} fitToHeight />
          </div>
        </div>
      )}
    </div>
  );
}
