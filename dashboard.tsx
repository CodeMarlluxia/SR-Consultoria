"use client";

import { useMemo, useState } from "react";
import { filterByDateRange, computeCMD } from "@/lib/dashboard/compute";
import type { DashboardPayload } from "@/lib/dashboard/data";
import { MetricCard, ChampionCard, InsightCard } from "./cards";
import { GoalArc } from "./goal-arc";
import { PerformanceTable } from "./performance-table";
import { DateRangePicker, FullscreenButton } from "./controls";
import { brl, formatPeriod, shortDate } from "./format";

export function Dashboard({ payload }: { payload: DashboardPayload }) {
  const { sales, metas, diasNoMes, diasDecorridos, minDate, maxDate, mesAno } = payload;

  const [from, setFrom] = useState(minDate ?? "");
  const [to, setTo] = useState(maxDate ?? "");

  const metasMap = useMemo(
    () => new Map(metas.map((m) => [m.profissionalId, m.valorMeta])),
    [metas],
  );

  // Everything recomputes whenever the range changes — instant, client-side.
  const data = useMemo(() => {
    const filtered = filterByDateRange(sales, from, to);
    // when a sub-range is picked, projection uses the selected span length
    const spanDays =
      from && to
        ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1
        : diasDecorridos;
    return computeDashboard(filtered, metasMap, spanDays, diasNoMes);
  }, [sales, from, to, metasMap, diasDecorridos, diasNoMes]);

  const hasData = payload.sales.length > 0;

  return (
    <div className="mx-auto max-w-[1080px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-game-royal"
            style={{ textShadow: "0 0 12px rgba(65,105,225,0.6)" }}
          >
            Placar do Período
          </p>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(90deg, #fff, #4169e1)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Dashboard de Performance
          </h1>
          <p className="mt-1 text-sm text-text-dim">
            {formatPeriod(mesAno)}
            {minDate && maxDate && ` · ${shortDate(from || minDate)} – ${shortDate(to || maxDate)}`}
            {` · ${data.totalAtendimentos} atendimentos`}
          </p>
        </div>
        <FullscreenButton />
      </div>

      {!hasData ? (
        <div className="mt-10 rounded-[18px] border border-base-600 bg-base-800/60 p-12 text-center">
          <p className="text-lg font-semibold">Nenhuma venda importada para {formatPeriod(mesAno)}.</p>
          <p className="mt-2 text-sm text-text-dim">
            Importe o relatório do período na aba de metas para ver o placar.
          </p>
        </div>
      ) : (
        <>
          {minDate && maxDate && (
            <div className="mt-6">
              <DateRangePicker min={minDate} max={maxDate} from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
            </div>
          )}

          {/* Scoreboard — responsive grid */}
          <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Faturamento total" value={data.totalFaturamento} sub="no período" accent="lime" />
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
            <MetricCard label="Comissão total" value={data.totalComissao} sub="a pagar" accent="purple" />
          </div>

          {/* Analytical cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.servicoMaisExecutado && (
              <InsightCard
                label="Serviço mais executado"
                title={data.servicoMaisExecutado.nome}
                detail={`${data.servicoMaisExecutado.ocorrencias} ocorrências`}
                accent="royal"
                icon="✂"
              />
            )}
            {data.categoriaMaisVendida && (
              <InsightCard
                label="Categoria mais vendida"
                title={data.categoriaMaisVendida.nome}
                detail={brl(data.categoriaMaisVendida.receita)}
                accent="purple"
                icon="💎"
              />
            )}
          </div>

          <GoalArc
            realizado={data.totalFaturamento}
            meta={data.metaGlobal}
            progressoPct={data.progressoGlobalPct}
          />

          <PerformanceTable rows={data.rows} />
        </>
      )}
    </div>
  );
}
