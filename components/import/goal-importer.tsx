"use client";

import { useState, useTransition } from "react";
import { DropZone } from "./drop-zone";
import { GoalsTable } from "./goals-table";
import { useConfetti } from "./use-confetti";
import {
  parseSalesReport,
  aggregateByProfessional,
  toPeriod,
  type ProfessionalAggregate,
} from "@/lib/csv/importer";
import { saveImport } from "@/app/actions/import";
import type { ParsedSaleRow } from "@/lib/types";

const SCAN_MS = 1600; // let the laser animation play before revealing

export function GoalImporter() {
  const [scanning, setScanning] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalAggregate[]>([]);
  const [rows, setRows] = useState<ParsedSaleRow[]>([]);
  const [period, setPeriod] = useState<string>("");
  const [goals, setGoals] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const fireConfetti = useConfetti();

  async function handleFile(file: File) {
    setError("");
    setSaved(false);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Selecione um arquivo .csv válido.");
      return;
    }

    setScanning(true);
    try {
      const [result] = await Promise.all([
        parseSalesReport(file),
        new Promise((r) => setTimeout(r, SCAN_MS)), // min scan duration
      ]);

      if (result.errors.length && result.rows.length === 0) {
        setError(result.errors[0]);
        return;
      }

      const agg = aggregateByProfessional(result.rows);
      const p = result.rows[0] ? toPeriod(result.rows[0].dataVenda) : "";
      setProfessionals(agg);
      setRows(result.rows);
      setPeriod(p);
      setGoals({});
    } catch {
      setError("Erro ao ler o arquivo. Verifique o formato do relatório.");
    } finally {
      setScanning(false);
    }
  }

  function handleGoalChange(name: string, value: string) {
    setGoals((g) => ({ ...g, [name]: value }));
  }

  function handleSave() {
    const goalInputs = professionals
      .map((p) => ({ profissional: p.profissional, valorMeta: parseFloat(goals[p.profissional] ?? "0") || 0 }))
      .filter((g) => g.valorMeta > 0);

    if (goalInputs.length === 0) {
      setError("Defina ao menos uma meta antes de salvar.");
      return;
    }
    setError("");

    startTransition(async () => {
      const res = await saveImport(period, goalInputs, rows);
      if (!res.ok) {
        setError(res.error ?? "Não foi possível salvar.");
        return;
      }
      setSaved(true);
      fireConfetti();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleReset() {
    setProfessionals([]);
    setRows([]);
    setGoals({});
    setError("");
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasData = professionals.length > 0;

  return (
    <div className="mx-auto max-w-[880px]">
      <header className="mb-8">
        <p className="eyebrow">Gestão de metas</p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-ink">
          Importar relatório
        </h1>
        <p className="mt-2 text-ink-soft">
          Arraste o relatório do período e defina a meta de cada profissional.
        </p>
      </header>

      <DropZone scanning={scanning} onFile={handleFile} />

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-deep-rose">
          {error}
        </p>
      )}

      {hasData && (
        <section className="mt-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-ink">
              Definir metas {period && <span className="text-ink-soft">· {period}</span>}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-mint/35 px-3.5 py-1.5 text-sm font-semibold text-deep-mint">
              {professionals.length}{" "}
              {professionals.length === 1 ? "profissional" : "profissionais"}
            </span>
          </div>

          <GoalsTable
            professionals={professionals}
            goals={goals}
            onGoalChange={handleGoalChange}
          />

          <div className="mt-7 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-brand-rose to-brand-lilac px-7 py-3.5 text-base font-bold text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar metas"}
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl px-6 py-3.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-white/60 hover:text-ink"
            >
              Importar outro arquivo
            </button>
            {saved && (
              <span role="status" className="text-sm font-semibold text-deep-mint">Metas salvas</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
