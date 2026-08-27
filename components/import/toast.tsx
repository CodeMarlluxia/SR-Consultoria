"use client";

import { useEffect } from "react";
import { IconX } from "@/components/icons";

export type ToastTone = "success" | "info" | "error";

export interface ToastData {
  tone: ToastTone;
  message: string;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success:
    "border-accent-mint/40 bg-accent-mint/15 text-accent-mint dark:bg-accent-mint/10",
  info: "border-accent-serenity/40 bg-accent-serenity/15 text-accent-serenity dark:bg-accent-serenity/10",
  error: "border-accent-rose/40 bg-accent-rose/15 text-accent-rose dark:bg-accent-rose/10",
};

/**
 * Auto-dismissing toast. Uses role="status" + aria-live so screen readers
 * announce the message (e.g. "12 duplicatas ignoradas") without stealing focus.
 */
export function Toast({
  toast,
  onDismiss,
  duration = 6000,
}: {
  toast: ToastData | null;
  onDismiss: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[210] w-[min(92vw,420px)] -translate-x-1/2"
    >
      <div
        className={`glass flex items-start gap-3 rounded-[14px] border px-4 py-3 shadow-glass-lg ${TONE_STYLES[toast.tone]}`}
      >
        <span className="mt-0.5 text-sm font-semibold leading-snug">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="ml-auto flex-shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <IconX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
