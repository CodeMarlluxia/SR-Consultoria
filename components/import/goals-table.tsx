"use client";

import type { ProfessionalAggregate } from "@/lib/csv/importer";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface GoalsTableProps {
  professionals: ProfessionalAggregate[];
  goals: Record<string, string>; // nome -> valor do input
  onGoalChange: (name: string, value: string) => void;
}

export function GoalsTable({ professionals, goals, onGoalChange }: GoalsTableProps) {
  return (
    <div className="space-y-2.5">
      {professionals.map((p, i) => (
        <div
          key={p.profissional}
          className="card flex animate-fade-rise items-center gap-4 px-4 py-3.5 opacity-0"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-mint font-display text-sm font-semibold text-ink"
            aria-hidden
          >
            {initials(p.profissional)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink">{p.profissional}</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {p.qtdLinhas} atendimentos · {brl(p.faturamento)} no período
            </p>
          </div>

          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-faint"
              aria-hidden
            >
              R$
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0,00"
              aria-label={`Meta para ${p.profissional}`}
              value={goals[p.profissional] ?? ""}
              onChange={(e) => onGoalChange(p.profissional, e.target.value)}
              className="field w-[160px] py-2.5 pl-9 pr-3 text-base font-semibold tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
