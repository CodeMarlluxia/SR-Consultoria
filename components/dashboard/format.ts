export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Progress-band → fill key + trend label. */
export function progressBand(pct: number | null): {
  fill: string;
  label: string;
} {
  if (pct === null) return { fill: "fill-none", label: "sem meta" };
  if (pct >= 100) return { fill: "fill-mint", label: "✨ meta batida" };
  if (pct >= 90) return { fill: "fill-rose", label: "🔥 quase lá" };
  if (pct >= 50) return { fill: "fill-mint", label: "📈 no ritmo" };
  return { fill: "fill-serenity", label: "⚠️ começando" };
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
