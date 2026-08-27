/** Lockup da marca: ícone em pastel + nome em serifa itálica + tagline. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base leading-none text-onPastel"
        style={{ background: "linear-gradient(135deg, var(--brand-rose), var(--brand-lilac))" }}
        aria-hidden
      >
        ✿
      </span>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-lg font-semibold italic text-ink">SR Consultoria</p>
          <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
            Metas &amp; Comissões
          </p>
        </div>
      )}
    </div>
  );
}
