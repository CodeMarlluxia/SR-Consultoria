"use client";

import { useEffect, useMemo, useState } from "react";
import { computeDashboard } from "@/lib/dashboard/compute";
import type { DashboardPayload } from "@/lib/dashboard/data";
import { MetricCard, ChampionCard, InsightCard } from "./cards";
import { GoalArc } from "./goal-arc";
import { PerformanceTable } from "./performance-table";
import { DateRangePicker, FullscreenButton } from "./controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { brl, pct, shortDate } from "./format";
import { IconWallet, IconCoins, IconAward, IconTrophy, IconUsers, IconScissors, IconTag } from "@/components/icons";

export function Dashboard({ payload }: { payload: DashboardPayload }) {
  const { from, to, boundsMin, boundsMax, sales, metas, diasNoMes, diasDecorridos } = payload;

  const [isFull, setIsFull] = useState(false);

  const metasMap = useMemo(
    () => new Map(metas.map((m) => [m.profissionalId, m.valorMeta])),
    [metas],
  );

  // `sales` já chega filtrado pela janela selecionada no servidor — não há
  // um segundo filtro client-side para manter em sincronia.
  const data = useMemo(
    () => computeDashboard(sales, metasMap, diasDecorridos, diasNoMes),
    [sales, metasMap, diasDecorridos, diasNoMes],
  );

  const hasData = payload.sales.length > 0;

  useEffect(() => {
    if (!isFull) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFull]);

  // Coluna de altura fixa (viewport): TUDO cabe na tela, sem rolagem. A
  // tabela de ranking ocupa a altura restante e distribui as linhas.
  const containerClass = isFull
    ? "aurora-bg fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8"
    : "flex h-[calc(100dvh-var(--nav-h))] w-full flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8";

  return (
    <div className={`${containerClass} flex flex-col`}>
      {/* ---- Cabeçalho ------------------------------------------------ */}
      <div className="flex flex-shrink-0 items-center justify-end gap-2.5">
        {boundsMin && boundsMax && from && to && (
          <DateRangePicker min={boundsMin} max={boundsMax} from={from} to={to} />
        )}
        <FullscreenButton onToggle={setIsFull} />
        <ThemeToggle />
      </div>

      {!hasData ? (
        <div className="card mt-6 flex flex-1 flex-col items-center justify-center p-10 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            {from && to
              ? `Nenhuma venda entre ${shortDate(from)} e ${shortDate(to)}.`
              : "Nenhuma venda importada ainda."}
          </p>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            {boundsMin && boundsMax
              ? "Ajuste as datas acima para ver outro período, ou importe o relatório deste mês na aba Metas."
              : "Importe o relatório do período na aba Metas para montar o ranking."}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3">
          {/* ---- KPIs + destaques ---------------------------------- */}
          <div className="grid flex-shrink-0 grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard label="Faturamento total" value={data.totalFaturamento} sub="no período" tone="mint" icon={<IconWallet className="h-4 w-4" />} />
            <MetricCard label="Comissão a pagar" value={data.totalComissao} sub="acumulada" tone="lavender" icon={<IconCoins className="h-4 w-4" />} />
            <MetricCard
              label="Premiação a pagar"
              value={data.totalPremiacao}
              sub={`10% do excedente · ${data.metasBatidas} meta${data.metasBatidas === 1 ? "" : "s"} batida${data.metasBatidas === 1 ? "" : "s"}`}
              tone="rose"
              icon={<IconAward className="h-4 w-4" />}
            />
            {data.topPorMeta ? (
              <ChampionCard
                highlight
                tone="rose"
                icon={<IconTrophy className="h-4 w-4" />}
                label="Líder da meta"
                nome={data.topPorMeta.nome}
                stat={`${pct(data.topPorMeta.progressoPct)} da meta`}
                hint={
                  data.topPorMeta.premiacao > 0
                    ? `Premiação de ${brl(data.topPorMeta.premiacao)}`
                    : brl(data.topPorMeta.faturamento)
                }
              />
            ) : (
              <div className="card flex items-center justify-center px-4 py-3 text-center text-xs text-ink-soft">
                Defina metas na aba Metas para habilitar o ranking.
              </div>
            )}
            {data.topPorVolume && (
              <ChampionCard
                tone="serenity"
                icon={<IconUsers className="h-4 w-4" />}
                label="Mais atendimentos"
                nome={data.topPorVolume.nome}
                stat={`${data.topPorVolume.qtdLinhas} atendimentos`}
                hint={brl(data.topPorVolume.faturamento)}
              />
            )}
          </div>

          {/* ---- Insights + anel da meta --------------------------- */}
          <div className="grid flex-shrink-0 grid-cols-1 gap-3 lg:grid-cols-[1fr_1.7fr_1fr]">
            {data.servicoMaisExecutado ? (
              <InsightCard
                label="Serviço mais executado"
                title={data.servicoMaisExecutado.nome}
                detail={`${data.servicoMaisExecutado.ocorrencias} vezes`}
                tone="lavender"
                icon={<IconScissors className="h-4 w-4" />}
              />
            ) : (
              <div className="hidden lg:block" />
            )}

            <GoalArc
              realizado={data.totalFaturamento}
              meta={data.metaGlobal}
              progressoPct={data.progressoGlobalPct}
              premiacao={data.totalPremiacao}
              metasBatidas={data.metasBatidas}
              totalPessoas={data.rows.length}
            />

            {data.categoriaMaisVendida ? (
              <InsightCard
                label="Categoria mais vendida"
                title={data.categoriaMaisVendida.nome}
                detail={brl(data.categoriaMaisVendida.receita)}
                tone="gold"
                icon={<IconTag className="h-4 w-4" />}
              />
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          {/* ---- Ranking ------------------------------------------- */}
          <div className="min-h-0 flex-1">
            <PerformanceTable rows={data.rows} fitToHeight />
          </div>
        </div>
      )}
    </div>
  );
}
