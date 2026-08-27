"use client";

import { useEffect, useMemo, useState } from "react";
import { filterByDateRange, computeDashboard } from "@/lib/dashboard/compute";
import type { DashboardPayload } from "@/lib/dashboard/data";
import { MetricCard, ChampionCard, InsightCard, StatStrip } from "./cards";
import { GoalArc } from "./goal-arc";
import { PerformanceTable } from "./performance-table";
import { DateRangePicker, FullscreenButton } from "./controls";
import { brl, formatPeriod, pct, shortDate } from "./format";

export function Dashboard({ payload }: { payload: DashboardPayload }) {
  const { sales, metas, diasNoMes, diasDecorridos, minDate, maxDate, mesAno } = payload;

  const [from, setFrom] = useState(minDate ?? "");
  const [to, setTo] = useState(maxDate ?? "");
  const [isFull, setIsFull] = useState(false);

  const metasMap = useMemo(
    () => new Map(metas.map((m) => [m.profissionalId, m.valorMeta])),
    [metas],
  );

  const data = useMemo(() => {
    const filtered = filterByDateRange(sales, from, to);
    const spanDays =
      from && to
        ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1
        : diasDecorridos;
    return computeDashboard(filtered, metasMap, spanDays, diasNoMes);
  }, [sales, from, to, metasMap, diasDecorridos, diasNoMes]);

  const hasData = sales.length > 0;

  useEffect(() => {
    if (!isFull) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFull]);

  const containerClass = isFull
    ? "fixed inset-0 z-[100] h-[100dvh] w-screen overflow-y-auto overflow-x-hidden bg-page px-4 py-6 sm:px-6 lg:px-8"
    : "w-full";

  return (
    <div className={containerClass}>
      {/* ---- Cabeçalho ------------------------------------------------ */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ranking do período</p>
          <h1 className="mt-1.5 font-display text-[2rem] font-semibold leading-none tracking-tight text-ink">
            SR Consultoria
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {formatPeriod(mesAno)}
            {minDate && maxDate && ` · ${shortDate(from || minDate)} a ${shortDate(to || maxDate)}`}
            {` · ${data.totalAtendimentos} atendimentos`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {minDate && maxDate && (
            <DateRangePicker
              min={minDate}
              max={maxDate}
              from={from}
              to={to}
              onChange={(f, t) => {
                setFrom(f);
                setTo(t);
              }}
            />
          )}
          <FullscreenButton onToggle={setIsFull} />
        </div>
      </header>

      {!hasData ? (
        <div className="card mt-8 px-8 py-14 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            Ainda não há vendas em {formatPeriod(mesAno)}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Importe o relatório do período em <strong className="font-semibold text-ink">Metas</strong> para
            montar o ranking.
          </p>
        </div>
      ) : (
        <>
          {/* ---- KPIs -------------------------------------------------- */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Faturamento total" value={data.totalFaturamento} sub="no período" tone="mint" />
            <MetricCard
              label="Meta da equipe"
              value={data.metaGlobal ?? 0}
              sub={data.progressoGlobalPct !== null ? `${pct(data.progressoGlobalPct)} atingido` : "sem metas definidas"}
              tone="sky"
            />
            <MetricCard label="Comissão a pagar" value={data.totalComissao} sub="acumulada no período" tone="lilac" />
            <MetricCard
              label="Premiação a pagar"
              value={data.totalPremiacao}
              sub={`10% do excedente · ${data.metasBatidas} meta${data.metasBatidas === 1 ? "" : "s"} batida${data.metasBatidas === 1 ? "" : "s"}`}
              tone="rose"
            />
          </div>

          {/* ---- Anel da meta + líder ---------------------------------- */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <GoalArc
                realizado={data.totalFaturamento}
                meta={data.metaGlobal}
                progressoPct={data.progressoGlobalPct}
                premiacao={data.totalPremiacao}
                metasBatidas={data.metasBatidas}
                totalPessoas={data.rows.length}
              />
            </div>

            {data.topPorMeta ? (
              <ChampionCard
                highlight
                tone="rose"
                icon="🏆"
                label="Líder do ranking"
                nome={data.topPorMeta.nome}
                stat={`${pct(data.topPorMeta.progressoPct)} da meta`}
                hint={
                  data.topPorMeta.premiacao > 0
                    ? `Premiação de ${brl(data.topPorMeta.premiacao)} garantida`
                    : `Faturou ${brl(data.topPorMeta.faturamento)} no período`
                }
              />
            ) : (
              <div className="card flex items-center justify-center px-6 py-8 text-center text-sm text-ink-soft">
                Defina metas na aba <strong className="font-semibold text-ink">Metas</strong> para
                habilitar o ranking.
              </div>
            )}
          </div>

          {/* ---- Destaques e insights ---------------------------------- */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.topPorReceita && (
              <ChampionCard
                tone="butter"
                icon="💎"
                label="Maior faturamento"
                nome={data.topPorReceita.nome}
                stat={brl(data.topPorReceita.faturamento)}
              />
            )}
            {data.topPorVolume && (
              <ChampionCard
                tone="sky"
                icon="✦"
                label="Mais atendimentos"
                nome={data.topPorVolume.nome}
                stat={`${data.topPorVolume.qtdLinhas} atendimentos`}
              />
            )}
            {data.servicoMaisExecutado && (
              <InsightCard
                tone="lilac"
                icon="✂"
                label="Serviço mais executado"
                title={data.servicoMaisExecutado.nome}
                detail={`${data.servicoMaisExecutado.ocorrencias} vezes`}
              />
            )}
            {data.categoriaMaisVendida && (
              <InsightCard
                tone="mint"
                icon="🌸"
                label="Categoria mais vendida"
                title={data.categoriaMaisVendida.nome}
                detail={brl(data.categoriaMaisVendida.receita)}
              />
            )}
          </div>

          {/* ---- Faixa de contexto ------------------------------------- */}
          <div className="mt-4">
            <StatStrip
              items={[
                { k: "Profissionais", v: String(data.rows.length) },
                { k: "Atendimentos", v: String(data.totalAtendimentos) },
                {
                  k: "Ticket médio",
                  v: brl(
                    data.totalAtendimentos > 0
                      ? data.totalFaturamento / data.totalAtendimentos
                      : 0,
                  ),
                },
                { k: "Metas batidas", v: `${data.metasBatidas} de ${data.rows.length}` },
              ]}
            />
          </div>

          {/* ---- Ranking ----------------------------------------------- */}
          <div className="mt-4">
            <PerformanceTable rows={data.rows} />
          </div>
        </>
      )}
    </div>
  );
}
