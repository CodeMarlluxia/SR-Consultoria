export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** 87.4 → '87,4%' */
export const pct = (n: number | null) =>
  n === null ? "—" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export type BandKey = "batida" | "quase" | "ritmo" | "inicio" | "sem-meta";

/** Faixa de progresso → rótulo + cor da barra. */
export function progressBand(pctValue: number | null): {
  key: BandKey;
  label: string;
  bar: string;
  text: string;
} {
  if (pctValue === null) {
    return {
      key: "sem-meta",
      label: "sem meta",
      bar: "var(--ink-faint)",
      text: "text-ink-faint",
    };
  }
  if (pctValue >= 100) {
    return {
      key: "batida",
      label: "meta batida",
      bar: "linear-gradient(90deg, var(--mint), var(--butter))",
      text: "text-deep-mint",
    };
  }
  if (pctValue >= 90) {
    return {
      key: "quase",
      label: "quase lá",
      bar: "linear-gradient(90deg, var(--rose), var(--butter))",
      text: "text-deep-rose",
    };
  }
  if (pctValue >= 50) {
    return {
      key: "ritmo",
      label: "no ritmo",
      bar: "linear-gradient(90deg, var(--lilac), var(--rose))",
      text: "text-deep-lilac",
    };
  }
  return {
    key: "inicio",
    label: "começando",
    bar: "linear-gradient(90deg, var(--sky), var(--lilac))",
    text: "text-deep-sky",
  };
}

/** Selo da posição no ranking. Pódio recebe símbolo; o resto, número. */
export function rankBadge(posicao: number): string {
  if (posicao === 0) return "🏆";
  if (posicao === 1) return "🥈";
  if (posicao === 2) return "🥉";
  return String(posicao + 1);
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
