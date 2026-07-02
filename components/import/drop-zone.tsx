"use client";

import { useRef, useState, type DragEvent } from "react";
import { ScannerOverlay } from "./scanner-overlay";

interface DropZoneProps {
  scanning: boolean;
  onFile: (file: File) => void;
}

/**
 * Neon drop zone. Handles drag highlight, click-to-select, and renders the
 * laser scanner overlay while `scanning` is true.
 */
export function DropZone({ scanning, onFile }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Solte o arquivo CSV aqui ou clique para selecionar"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
      onDrop={handleDrop}
      className={[
        "relative cursor-pointer overflow-hidden rounded-[18px] border-2 border-dashed",
        "bg-white/40 px-8 py-14 text-center transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-pastel-lavender",
        dragOver
          ? "border-pastel-serenity scale-[1.01] shadow-glass-lg bg-white/60"
          : "border-pastel-serenity/50 ",
      ].join(" ")}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      <ScannerOverlay active={scanning} />

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-pastel-serenity/50 bg-pastel-serenity/20 text-accent-lavender shadow-glass">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p className="text-lg font-bold text-ink">Solte o arquivo .csv aqui</p>
      <p className="mt-1 text-sm text-ink-soft">
        ou <span className="font-semibold text-accent-lavender">clique para selecionar</span> · relatório do período
      </p>
    </div>
  );
}
