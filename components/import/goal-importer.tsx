"use client";

import { useState, useTransition } from "react";
import { DropZone } from "./drop-zone";
import { GoalsTable } from "./goals-table";
import { PersistGoalsDialog } from "./persist-goals-dialog";
import { Toast, type ToastData } from "./toast";
import { useConfetti } from "./use-confetti";
import {
  parseSalesReport,
  aggregateByProfessional,
  toPeriod,
  type ProfessionalAggregate,
} from "@/lib/csv/importer";
import { saveImport, getPersistedGoals } from "@/app/actions/import";
import type { ParsedSaleRow } from "@/lib/types";
import { IconTarget, IconCheckCircle } from "@/components/icons";

const SCAN_MS = 1600; // let the laser animation play before revealing

export function GoalImporter() {
  const [scanning, setScanning] = useState(false);
  const [professionals, setProfessionals] = useState<ProfessionalAggregate[]>([]);
  const [rows, setRows] = useState<ParsedSaleRow[]>([]);
  const [period, setPeriod] = useState<string>("");
  const [goals, setGoals] = useState<Record<string, string>>({});
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [pending, startTransition] = useTransition();
  const fireConfetti = useConfetti();

  async function handleFile(file: File) {
    setError("");
    setSaved(false);
    setToast(null);
    setPreloadedCount(0);
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

      // Auto-load any goals the manager chose to persist for this month.
      const persisted = p ? await getPersistedGoals(p) : [];
      if (persisted.length > 0) {
        const preset: Record<string, string> = {};
        const names = new Set(agg.map((a) => a.profissional));
        let applied = 0;
        for (const g of persisted) {
          if (names.has(g.profissional)) {
            preset[g.profissional] = String(g.valorMeta);
            applied++;
          }
        }
        setGoals(preset);
        setPreloadedCount(applied);
        if (applied > 0) {
          setToast({
            tone: "info",
            message: `${applied} ${applied === 1 ? "meta persistida foi carregada" : "metas persistidas foram carregadas"} automaticamente para ${p}.`,
          });
        }
      } else {
        setGoals({});
      }
    } catch {
      setError("Erro ao ler o arquivo. Verifique o formato do relatório.");
    } finally {
      setScanning(false);
    }
  }

  function handleGoalChange(name: string, value: string) {
    setGoals((g) => ({ ...g, [name]: value }));
  }

  function collectGoalInputs() {
    return professionals
      .map((p) => ({
        profissional: p.profissional,
        valorMeta: parseFloat(goals[p.profissional] ?? "0") || 0,
      }))
      .filter((g) => g.valorMeta > 0);
  }

  /** Step 1: validate, then open the persist prompt. */
  function handleSaveClick() {
    if (collectGoalInputs().length === 0) {
      setError("Defina ao menos uma meta antes de salvar.");
      return;
    }
    setError("");
    setDialogOpen(true);
  }

  /** Step 2: dialog answered -> persist with the chosen flag. */
  function handleConfirmPersist(persistir: boolean) {
    const goalInputs = collectGoalInputs();
    if (goalInputs.length === 0) {
      setDialogOpen(false);
      setError("Defina ao menos uma meta antes de salvar.");
      return;
    }

    startTransition(async () => {
      const res = await saveImport(period, goalInputs, rows, persistir);
      if (!res.ok) {
        setDialogOpen(false);
        setError(res.error ?? "Não foi possível salvar.");
        return;
      }

      setDialogOpen(false);
      setSaved(true);
      fireConfetti();

      const dup = res.duplicatasIgnoradas ?? 0;
      if (dup > 0) {
        setToast({
          tone: "info",
          message: `Importação concluída. ${dup} ${dup === 1 ? "transação duplicada foi ignorada" : "transações duplicadas foram ignoradas"} com segurança.`,
        });
      } else {
        setToast({
          tone: "success",
          message: persistir
            ? "Metas salvas e mantidas para o mês"
            : "Metas salvas",
        });
      }
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleReset() {
    setProfessionals([]);
    setRows([]);
    setGoals({});
    setPreloadedCount(0);
    setError("");
    setSaved(false);
    setToast(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasData = professionals.length > 0;

  return (
    <div className="mx-auto max-w-[880px]">
      <header className="mb-8">
        <p className="eyebrow mb-2 inline-flex items-center gap-1.5">
          <IconTarget className="h-3 w-3" aria-hidden />
          Gestão de Metas
        </p>
        <h1 className="font-display text-3xl font-bold italic tracking-tight text-ink">
          Importador de Metas
        </h1>
        <p className="mt-2 text-ink-soft">
          Arraste o relatório do período e defina a meta de cada vendedora.
        </p>
      </header>

      <DropZone scanning={scanning} onFile={handleFile} />

      {error && <p className="mt-4 text-sm text-accent-rose">{error}</p>}

      {hasData && (
        <section className="mt-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink">
              Definir metas {period && <span className="text-ink-soft">· {period}</span>}
            </h2>
            <div className="flex items-center gap-2.5">
              {preloadedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-serenity/40 bg-accent-serenity/15 px-3 py-1.5 text-sm font-semibold text-accent-serenity">
                  {preloadedCount} pré-carregada{preloadedCount === 1 ? "" : "s"}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pastel-mint/50 bg-pastel-mint/25 px-3 py-1.5 text-sm font-semibold text-accent-mint">
                {professionals.length}{" "}
                {professionals.length === 1 ? "vendedora" : "vendedoras"}
              </span>
            </div>
          </div>

          <GoalsTable
            professionals={professionals}
            goals={goals}
            onGoalChange={handleGoalChange}
          />

          <div className="mt-7 flex items-center gap-4">
            <button
              onClick={handleSaveClick}
              disabled={pending}
              className="rounded-xl border border-white/70 px-7 py-3.5 text-base font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glow-rose active:translate-y-0 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgba(184,232,200,0.8), rgba(168,216,240,0.8))" }}
            >
              {pending ? "Salvando…" : "Salvar metas"}
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-white/60 bg-transparent px-6 py-3.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink-faint/50 hover:text-ink"
            >
              Importar outro arquivo
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-mint">
                <IconCheckCircle className="h-4 w-4" aria-hidden />
                Metas salvas
              </span>
            )}
          </div>
        </section>
      )}

      <PersistGoalsDialog
        open={dialogOpen}
        period={period}
        pending={pending}
        onConfirm={handleConfirmPersist}
        onCancel={() => setDialogOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
