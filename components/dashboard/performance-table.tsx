"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProfPerformance } from "@/lib/dashboard/compute";
import { brl, initials, pct, progressBand, rankBadge } from "./format";

// ---------------------------------------------------------------------
//  Ranking. A posição e o troféu vêm SEMPRE do percentual de atingimento
//  da meta (row.posicao, calculada em compute.ts). Reordenar a tabela por
//  outra coluna é apenas uma lente de leitura: o selo de posição continua
//  refletindo o ranking oficial.
// ---------------------------------------------------------------------
type SortKey = "posicao" | "faturamento" | "meta" | "progresso" | "premiacao" | "comissao";

const COLS =
  "grid-cols-[38px_minmax(0,1fr)_6.5rem] " +
  "md:grid-cols-[42px_minmax(0,1.2fr)_7rem_minmax(0,1.4fr)] " +
  "lg:grid-cols-[46px_minmax(0,1.25fr)_7rem_7rem_minmax(0,1.5fr)_7rem_7rem]";

export function PerformanceTable({ rows }: { rows: ProfPerformance[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("posicao");
  const [desc, setDesc] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? rows.filter((r) => r.nome.toLowerCase().includes(q)) : rows;

    const pick = (r: ProfPerformance): number => {
      switch (sortKey) {
        case "faturamento": return r.faturamento;
        case "meta": return r.meta ?? -1;
        case "progresso": return r.progressoPct ?? -1;
        case "premiacao": return r.premiacao;
        case "comissao": return r.comissaoAcumulada;
        default: return r.posicao;
      }
    };

    // 'posicao' já é a ordem oficial (crescente = melhor colocada primeiro).
    const dir = sortKey === "posicao" ? (desc ? -1 : 1) : desc ? 1 : -1;
    return [...filtered].sort((a, b) => (pick(a) - pick(b)) * dir);
  }, [rows, sortKey, desc, query]);

  function toggle(key: SortKey) {
    if (key === sortKey) {
      setDesc((d) => !d);
    } else {
      setSortKey(key);
      setDesc(false);
    }
  }

  return (
    <section className="card px-5 pb-4 pt-5">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Ranking por atingimento da meta</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink">
            Desempenho individual
          </h2>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar profissional"
          aria-label="Buscar profissional"
          className="field w-full px-3.5 py-2 text-sm sm:w-56"
        />
      </header>

      <TableHeader sortKey={sortKey} desc={desc} onSort={toggle} />

      <div role="list">
        {visible.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-ink-soft">
            {query
              ? `Nenhuma profissional encontrada para “${query}”.`
              : "Nenhuma venda no período selecionado."}
          </p>
        ) : (
          visible.map((r) => <PerfRow key={r.profissionalId} row={r} />)
        )}
      </div>

      <p className="mt-4 border-t border-ink-faint/15 pt-3 text-xs text-ink-soft">
        Premiação: 10% sobre o valor que ultrapassar a meta. Abaixo de 100%, R$ 0,00.
      </p>
    </section>
  );
}

function SortButton({
  label,
  col,
  sortKey,
  desc,
  onSort,
  className = "",
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  desc: boolean;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === col;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      aria-sort={active ? (desc ? "descending" : "ascending") : "none"}
      className={`eyebrow inline-flex items-center gap-1 text-left transition-colors hover:text-ink ${
        active ? "text-ink" : ""
      } ${className}`}
    >
      {label}
      <span aria-hidden className={active ? "opacity-70" : "opacity-0"}>
        {desc ? "▾" : "▴"}
      </span>
    </button>
  );
}

function TableHeader({
  sortKey,
  desc,
  onSort,
}: {
  sortKey: SortKey;
  desc: boolean;
  onSort: (k: SortKey) => void;
}) {
  return (
    <div
      className={`grid ${COLS} items-center gap-4 border-b border-ink-faint/20 px-2 pb-2.5`}
    >
      <SortButton label="#" col="posicao" sortKey={sortKey} desc={desc} onSort={onSort} />
      <span className="eyebrow">Profissional</span>
      <SortButton label="Faturamento" col="faturamento" sortKey={sortKey} desc={desc} onSort={onSort} />
      <SortButton label="Meta" col="meta" sortKey={sortKey} desc={desc} onSort={onSort} className="hidden lg:inline-flex" />
      <SortButton label="Progresso" col="progresso" sortKey={sortKey} desc={desc} onSort={onSort} className="hidden md:inline-flex" />
      <SortButton label="Premiação" col="premiacao" sortKey={sortKey} desc={desc} onSort={onSort} className="hidden lg:inline-flex" />
      <SortButton label="Comissão" col="comissao" sortKey={sortKey} desc={desc} onSort={onSort} className="hidden lg:inline-flex" />
    </div>
  );
}

function PerfRow({ row }: { row: ProfPerformance }) {
  const band = progressBand(row.progressoPct);
  const target = Math.min(row.progressoPct ?? 0, 100);
  const [width, setWidth] = useState(0);
  const lider = row.posicao === 0 && row.progressoPct !== null;
  const bateu = row.progressoPct !== null && row.progressoPct >= 100;

  useEffect(() => {
    const t = setTimeout(() => setWidth(target), 120);
    return () => clearTimeout(t);
  }, [target]);

  const falta = row.meta && row.meta > row.faturamento ? row.meta - row.faturamento : null;

  return (
    <div
      role="listitem"
      className={[
        "grid",
        COLS,
        "items-center gap-4 rounded-2xl border-b border-ink-faint/10 px-2 py-3.5 transition-colors last:border-none hover:bg-white/55",
        lider ? "bg-gradient-to-r from-brand-rose/15 to-transparent" : "",
      ].join(" ")}
    >
      {/* posição */}
      <span
        className={`text-center text-sm font-semibold tabular-nums ${
          row.posicao < 3 ? "text-base" : "text-ink-faint"
        }`}
        title={`${row.posicao + 1}ª colocada por atingimento da meta`}
      >
        {rankBadge(row.posicao)}
      </span>

      {/* profissional */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-mint text-[0.7rem] font-semibold text-ink"
          aria-hidden
        >
          {initials(row.nome)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink" title={row.nome}>
            {row.nome}
          </span>
          <span className="block text-xs text-ink-faint">{row.qtdLinhas} atendimentos</span>
        </span>
      </div>

      {/* faturamento */}
      <span className="text-sm font-semibold tabular-nums text-ink">{brl(row.faturamento)}</span>

      {/* meta */}
      <span className="hidden text-sm tabular-nums text-ink-soft lg:block">
        {row.meta ? brl(row.meta) : "—"}
      </span>

      {/* progresso */}
      <div className="hidden flex-col gap-1.5 md:flex">
        <span className="flex items-baseline justify-between gap-2 text-xs">
          <span className={band.text}>{band.label}</span>
          <span className="font-semibold tabular-nums text-ink">{pct(row.progressoPct)}</span>
        </span>
        <span className="relative block h-1.5 overflow-hidden rounded-pill bg-ink-faint/15">
          <span
            className="absolute inset-y-0 left-0 block rounded-pill"
            style={{
              width: `${width}%`,
              background: band.bar,
              transition: "width 1.2s cubic-bezier(.2,.8,.2,1)",
            }}
          />
        </span>
        {falta !== null && (
          <span className="text-[0.7rem] text-ink-faint">Faltam {brl(falta)}</span>
        )}
      </div>

      {/* premiação */}
      <span
        className={`hidden text-sm tabular-nums lg:block ${
          bateu ? "font-semibold text-deep-rose" : "text-ink-faint"
        }`}
        title={
          bateu
            ? `10% sobre o excedente de ${brl(row.excedente)}`
            : "Liberada apenas ao atingir 100% da meta"
        }
      >
        {brl(row.premiacao)}
      </span>

      {/* comissão */}
      <span className="hidden text-sm font-semibold tabular-nums text-deep-lilac lg:block">
        {brl(row.comissaoAcumulada)}
      </span>
    </div>
  );
}
