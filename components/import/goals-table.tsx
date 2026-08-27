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
  goals: Record<string, string>; // name -> input value
  onGoalChange: (name: string, value: string) => void;
}

export function GoalsTable({ professionals, goals, onGoalChange }: GoalsTableProps) {
  return (
    <div className="space-y-2.5">
      {professionals.map((p, i) => (
        <div
          key={p.profissional}
          className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/45 px-4 py-3.5 opacity-0 animate-fade-rise"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-glass"
            style={{ background: "linear-gradient(135deg,#a8d8f0,#b8e8c8)" }}
          >
            {initials(p.profissional)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink">{p.profissional}</div>
            <div className="mt-0.5 text-xs text-ink-soft">
              {p.qtdLinhas} atendimentos · {brl(p.faturamento)} no período
            </div>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
              R$
            </span>
            <input
              type="number"
              min={0}
              step={100}
              placeholder="0,00"
              aria-label={`Meta para ${p.profissional}`}
              value={goals[p.profissional] ?? ""}
              onChange={(e) => onGoalChange(p.profissional, e.target.value)}
              className="w-[150px] rounded-[10px] border-[1.5px] border-white/60 bg-white/60 dark:border-white/15 dark:bg-white/5 py-2.5 pl-8 pr-3 text-base font-semibold tabular-nums text-ink outline-none transition-all focus:border-pastel-serenity focus:shadow-[0_0_0_3px_rgba(212,184,240,0.25)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
