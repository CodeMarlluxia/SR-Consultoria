export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** 87.4 → '87,4%' */
export const pct = (n: number | null) =>
  n === null ? "—" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type BandKey = "batida" | "quase" | "ritmo" | "inicio" | "sem-meta";

/**
 * Faixa de progresso → rótulo + preenchimento da barra.
 * As barras usam os pastéis da marca (--brand-*), que são superfícies e não
 * mudam entre temas; o rótulo usa o ramp --accent-*, que flipa no dark.
 * O degradê de cada faixa é o original do projeto: a barra atravessa dois
 * pastéis vizinhos da paleta, e a faixa muda conforme o progresso.
 */
export function progressBand(pctValue: number | null): {
  key: BandKey;
  label: string;
  bar: string;
  text: string;
} {
  if (pctValue === null) {
    return { key: "sem-meta", label: "sem meta", bar: "var(--ink-faint)", text: "text-ink-faint" };
  }
  if (pctValue >= 100) {
    return {
      key: "batida",
      label: "meta batida",
      bar: "linear-gradient(90deg, var(--brand-mint), var(--brand-butter))",
      text: "text-accent-mint",
    };
  }
  if (pctValue >= 90) {
    return {
      key: "quase",
      label: "quase lá",
      bar: "linear-gradient(90deg, var(--brand-rose), var(--brand-butter))",
      text: "text-accent-rose",
    };
  }
  if (pctValue >= 50) {
    return {
      key: "ritmo",
      label: "no ritmo",
      bar: "linear-gradient(90deg, var(--brand-lilac), var(--brand-rose))",
      text: "text-accent-lavender",
    };
  }
  return {
    key: "inicio",
    label: "começando",
    bar: "linear-gradient(90deg, var(--brand-sky), var(--brand-lilac))",
    text: "text-accent-serenity",
  };
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** 'YYYY-MM' → 'Junho 2026' */
export function formatPeriod(mesAno: string): string {
  const [y, m] = mesAno.split("-").map(Number);
  return `${MESES[m - 1]} ${y}`;
}

/** 'YYYY-MM-DD' → 'DD/MM' */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}
