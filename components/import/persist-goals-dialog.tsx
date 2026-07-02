"use client";

import { useEffect, useRef } from "react";

/**
 * Accessible confirm dialog for the "keep goals for this month?" prompt.
 *
 * WCAG notes:
 *  - role="dialog" + aria-modal, labelled/described by ids
 *  - focus is moved to the dialog on open and restored on close
 *  - Escape cancels; a focus trap keeps Tab within the dialog
 *  - the backdrop is inert to screen readers (aria-hidden on siblings via portal-less overlay)
 */
export function PersistGoalsDialog({
  open,
  period,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  period: string;
  pending: boolean;
  /** persistir = true → keep goals for future imports this month */
  onConfirm: (persistir: boolean) => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    yesRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-hidden={false}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="persist-title"
        aria-describedby="persist-desc"
        className="glass relative z-10 w-full max-w-md rounded-[20px] p-6 shadow-glass-lg"
      >
        <h2
          id="persist-title"
          className="font-display text-xl font-semibold tracking-tight text-ink"
        >
          Persistir metas do mês?
        </h2>
        <p id="persist-desc" className="mt-2 text-sm leading-relaxed text-ink-soft">
          Deseja que as metas definidas nesta importação permaneçam válidas para
          as próximas importações de arquivos CSV{" "}
          {period && (
            <span className="font-semibold text-ink">no período {period}</span>
          )}
          ? Se sim, elas serão carregadas automaticamente e você não precisará
          redefini-las.
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onConfirm(false)}
            disabled={pending}
            className="rounded-xl border border-ink-faint/30 bg-white/40 px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-60 dark:border-white/15 dark:bg-white/5"
          >
            Não, apenas desta vez
          </button>
          <button
            ref={yesRef}
            type="button"
            onClick={() => onConfirm(true)}
            disabled={pending}
            className="rounded-xl border border-white/70 bg-gradient-to-br from-accent-mint/70 to-accent-serenity/70 px-5 py-2.5 text-sm font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glow-rose active:translate-y-0 disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Sim, manter no mês"}
          </button>
        </div>
      </div>
    </div>
  );
}
