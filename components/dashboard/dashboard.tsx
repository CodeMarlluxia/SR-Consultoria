"use client";

import { useEffect, useMemo, useState } from "react";
import { computeDashboard } from "@/lib/dashboard/compute";
import type { DashboardPayload } from "@/lib/dashboard/data";
import {
  IconBanknote,
  IconCalendarCheck,
  IconCoins,
  IconGift,
  IconScissors,
  IconTag,
  IconTarget,
} from "@/components/icons";
import { MetricCard, ChampionCard, InsightCard } from "./cards";
import { GoalArc } from "./goal-arc";
import { PerformanceTable } from "./performance-table";
import { DateRangePicker, FullscreenButton } from "./controls";
import { brl, pct, shortDate } from "./format";

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

  // Em tela cheia a coluna trava na altura do viewport e a tabela distribui
  // as linhas para caber sem rolagem (modo painel de parede). No uso normal
  // a página rola, como manda a referência.
  const containerClass = isFull
    ? "aurora-bg fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8"
    : "flex w-full flex-col px-4 py-4 sm:px-6 lg:px-8";

  const servico = data.servicoMaisExecutado ? (
    <InsightCard
      label="Serviço mais executado"
      title={data.servicoMaisExecutado.nome}
      detail={`${data.servicoMaisExecutado.ocorrencias} vezes`}
      icon={IconScissors}
      tone="mint"
    />
  ) : null;

  const categoria = data.categoriaMaisVendida ? (
    <InsightCard
      label="Categoria mais vendida"
      title={data.categoriaMaisVendida.nome}
      detail={brl(data.categoriaMaisVendida.receita)}
      icon={IconTag}
      tone="lavender"
    />
  ) : null;

  return (
    <div className={containerClass}>
      {/* ---- Controles do período ------------------------------------- */}
      <div className="flex flex-shrink-0 items-center justify-end gap-2.5 pb-3">
        {boundsMin && boundsMax && from && to && (
          <DateRangePicker min={boundsMin} max={boundsMax} from={from} to={to} />
        )}
        <FullscreenButton onToggle={setIsFull} />
      </div>

      {!hasData ? (
        <div className="tile flex flex-1 flex-col items-center justify-center p-10 text-center">
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
        <div className={`flex flex-col gap-4 ${isFull ? "min-h-0 flex-1" : ""}`}>
          {/* ---- KPIs + destaques ---------------------------------- */}
          <div className="grid flex-shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              label="Faturamento total"
              value={data.totalFaturamento}
              sub="no período"
              icon={IconBanknote}
              tone="rose"
            />
            <MetricCard
              label="Comissão a pagar"
              value={data.totalComissao}
              sub="acumulada"
              icon={IconCoins}
              tone="serenity"
            />
            <MetricCard
              label="Premiação do time"
              value={data.totalPremiacao}
              sub={`10% do excedente · ${data.metasBatidas} meta${
                data.metasBatidas === 1 ? "" : "s"
              } batida${data.metasBatidas === 1 ? "" : "s"}`}
              icon={IconGift}
              tone="lavender"
            />
            {data.topPorMeta ? (
              <ChampionCard
                tone="gold"
                label="Líder da meta"
                nome={data.topPorMeta.nome}
                stat={`${pct(data.topPorMeta.progressoPct)} da meta`}
                hint={
                  data.topPorMeta.premiacao > 0
                    ? `Premiação de ${brl(data.topPorMeta.premiacao)}`
                    : brl(data.topPorMeta.faturamento)
                }
                icon={IconTarget}
              />
            ) : (
              <div className="tile tile-butter flex items-center justify-center px-4 py-3 text-center text-xs text-ink-soft">
                Defina metas na aba Metas para habilitar o ranking.
              </div>
            )}
            {data.topPorVolume && (
              <ChampionCard
                tone="mint"
                label="Mais atendimentos"
                nome={data.topPorVolume.nome}
                stat={`${data.topPorVolume.qtdLinhas} atendimentos`}
                hint={brl(data.topPorVolume.faturamento)}
                icon={IconCalendarCheck}
              />
            )}
          </div>

          {/* ---- Painel da meta, com os insights nas laterais -------- */}
          <GoalArc
            realizado={data.totalFaturamento}
            meta={data.metaGlobal}
            progressoPct={data.progressoGlobalPct}
            premiacao={data.totalPremiacao}
            metasBatidas={data.metasBatidas}
            totalPessoas={data.rows.length}
            left={servico}
            right={categoria}
          />

          {/* ---- Ranking ------------------------------------------- */}
          <div className={isFull ? "min-h-0 flex-1" : ""}>
            <PerformanceTable rows={data.rows} fitToHeight={isFull} />
          </div>
        </div>
      )}
    </div>
  );
}
