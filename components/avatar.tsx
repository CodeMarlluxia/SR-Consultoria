import type { CSSProperties } from "react";
import { initials } from "@/components/dashboard/format";

// ---------------------------------------------------------------------
//  Avatar de iniciais. Substitui o logotipo que se repetia em cada linha
//  do ranking: ali o selo da marca não identificava ninguém. Aqui cada
//  profissional recebe um par de pastéis estável, derivado do nome, então
//  a mesma pessoa aparece sempre com a mesma cor entre sessões.
// ---------------------------------------------------------------------
const PALETTE = [
  ["var(--brand-rose)", "var(--brand-lilac)"],
  ["var(--brand-sky)", "var(--brand-mint)"],
  ["var(--brand-lilac)", "var(--brand-sky)"],
  ["var(--brand-butter)", "var(--brand-rose)"],
  ["var(--brand-mint)", "var(--brand-butter)"],
] as const;

/** Hash estável (djb2 enxuto) — mesmo nome, mesma cor, sempre. */
function hueIndex(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i += 1) h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

export function Avatar({
  nome,
  className,
  style,
}: {
  nome: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [from, to] = PALETTE[hueIndex(nome)];

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-display font-semibold uppercase leading-none text-onPastel ring-1 ring-white/50 dark:ring-white/10 ${
        className ?? "h-9 w-9 text-[0.7rem]"
      }`}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})`, ...style }}
      title={nome}
      aria-hidden
    >
      {initials(nome)}
    </span>
  );
}
