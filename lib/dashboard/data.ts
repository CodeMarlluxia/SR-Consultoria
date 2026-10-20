import { db } from "@/lib/db";
import type { SaleRecord } from "@/lib/dashboard/compute";

// =====================================================================
//  Server loader.
//
//  The date-range picker is the ONLY period control: the selected
//  [from, to] window drives the SQL query directly. A window may span
//  more than one month, so goals — which are stored per month (mes_ano) —
//  are loaded for every month the window touches and summed per professional.
// =====================================================================

export interface DashboardPayload {
  /** Selected window (ISO 'YYYY-MM-DD'). Null only when the DB is empty. */
  from: string | null;
  to: string | null;
  /** Full extent of available data, used as the picker's min/max bounds. */
  boundsMin: string | null;
  boundsMax: string | null;
  sales: SaleRecord[];
  metas: Array<{ profissionalId: string; valorMeta: number }>;
  /** Projection inputs, derived from the selected window. */
  diasDecorridos: number;
  diasNoMes: number;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Every 'YYYY-MM' touched by an inclusive [from, to] date window. */
export function monthsInRange(from: string, to: string): string[] {
  const out: string[] = [];
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  if (!fy || !fm || !ty || !tm) return out;
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/**
 * Projection inputs for the selected window.
 *
 * The linear closing projection only makes sense while a month is still
 * running. So: if the window ends in the future (an in-flight month), we
 * project from days elapsed → days in that month. If the window is fully in
 * the past, there is nothing to project — elapsed == total, and
 * `computeDashboard` collapses the projection to the realised figure.
 */
function projectionDays(from: string, to: string): { diasDecorridos: number; diasNoMes: number } {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const span = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  const today = new Date();
  const todayIso = iso(today);

  // Window already closed → no extrapolation.
  if (to < todayIso) return { diasDecorridos: span, diasNoMes: span };

  // Window still open → elapsed portion vs. the full window.
  const elapsedEnd = todayIso < to ? today : end;
  const elapsed =
    Math.round((elapsedEnd.getTime() - start.getTime()) / 86400000) + 1;

  return {
    diasDecorridos: Math.max(1, Math.min(elapsed, span)),
    diasNoMes: span,
  };
}

/** Full extent of the imported data — the picker's min/max bounds. */
export async function getDataBounds(): Promise<{ min: string | null; max: string | null }> {
  const { rows } = await db.query<{ min: string | null; max: string | null }>(
    "select min(data_venda) as min, max(data_venda) as max from vendas_importadas",
  );
  return rows[0];
}

/**
 * Load everything the dashboard needs for the selected [from, to] window.
 * Sales are filtered by data_venda; goals are pulled for every month the
 * window covers and summed per professional.
 */
export async function loadDashboardPayload(
  from: string,
  to: string,
): Promise<DashboardPayload> {
  const months = monthsInRange(from, to);

  const [{ rows: vendas }, { rows: metas }] = await Promise.all([
    db.query(
      `select v.profissional_id, p.nome, v.data_venda, v.valor_venda,
              v.valor_comissao_calculada, v.categoria, v.servico
         from vendas_importadas v join profissionais p on p.id = v.profissional_id
        where v.data_venda between $1 and $2
        order by v.data_venda`,
      [from, to],
    ),
    db.query("select profissional_id, valor_meta from metas where mes_ano = any($1::text[])", [months]),
  ]);

  const sales: SaleRecord[] = vendas.map((v) => {
    const nome = v.nome as string;
    return {
      profissionalId: v.profissional_id as string,
      nome: nome ?? "\u2014",
      dataVenda: v.data_venda as string,
      valorVenda: Number(v.valor_venda),
      valorComissao: Number(v.valor_comissao_calculada),
      categoria: (v.categoria as string) ?? null,
      servico: (v.servico as string) ?? null,
    };
  });

  // A window spanning N months carries N monthly goals per professional —
  // sum them so the target matches the span being measured.
  const metaByProf = new Map<string, number>();
  for (const m of metas) {
    const id = m.profissional_id as string;
    metaByProf.set(id, (metaByProf.get(id) ?? 0) + Number(m.valor_meta));
  }

  const { diasDecorridos, diasNoMes } = projectionDays(from, to);
  const bounds = await getDataBounds();

  return {
    from,
    to,
    boundsMin: bounds.min,
    boundsMax: bounds.max,
    sales,
    metas: Array.from(metaByProf.entries()).map(([profissionalId, valorMeta]) => ({
      profissionalId,
      valorMeta,
    })),
    diasDecorridos,
    diasNoMes,
  };
}
