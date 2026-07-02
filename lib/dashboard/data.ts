import { createClient } from "@/lib/supabase/server";
import type { SaleRecord } from "@/lib/dashboard/compute";

// =====================================================================
//  Server loader — fetches the raw period data once. All filtering and
//  aggregation happens client-side (see lib/dashboard/compute.ts) so the
//  date-range picker updates instantly.
// =====================================================================

export interface DashboardPayload {
  mesAno: string;
  sales: SaleRecord[];
  metas: Array<{ profissionalId: string; valorMeta: number }>;
  diasDecorridos: number;
  diasNoMes: number;
  minDate: string | null;
  maxDate: string | null;
}

function daysInMonth(mesAno: string): number {
  const [y, m] = mesAno.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function elapsedDays(mesAno: string): number {
  const [y, m] = mesAno.split("-").map(Number);
  const now = new Date();
  const total = daysInMonth(mesAno);
  if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) return total;
  if (y === now.getFullYear() && m === now.getMonth() + 1) return now.getDate();
  return 0;
}

/** Load everything the dashboard needs for one period. */
export async function loadDashboardPayload(mesAno: string): Promise<DashboardPayload> {
  const supabase = await createClient();

  const [{ data: vendas, error: vErr }, { data: metas, error: mErr }] = await Promise.all([
    supabase
      .from("vendas_importadas")
      .select(
        "profissional_id, data_venda, valor_venda, valor_comissao_calculada, categoria, servico, profissionais(nome)",
      )
      .eq("mes_ano", mesAno)
      .order("data_venda", { ascending: true }),
    supabase.from("metas").select("profissional_id, valor_meta").eq("mes_ano", mesAno),
  ]);

  if (vErr) throw new Error(`vendas: ${vErr.message}`);
  if (mErr) throw new Error(`metas: ${mErr.message}`);

  const sales: SaleRecord[] = (vendas ?? []).map((v) => {
    const rel = v.profissionais as unknown as { nome: string } | { nome: string }[] | null;
    const nome = Array.isArray(rel) ? rel[0]?.nome : rel?.nome;
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

  const dates = sales.map((s) => s.dataVenda);
  const minDate = dates.length ? dates[0] : null;
  const maxDate = dates.length ? dates[dates.length - 1] : null;

  return {
    mesAno,
    sales,
    metas: (metas ?? []).map((m) => ({
      profissionalId: m.profissional_id as string,
      valorMeta: Number(m.valor_meta),
    })),
    diasDecorridos: elapsedDays(mesAno),
    diasNoMes: daysInMonth(mesAno),
    minDate,
    maxDate,
  };
}

/** Distinct periods that have sales, newest first. */
export async function getAvailablePeriods(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendas_importadas")
    .select("mes_ano")
    .order("mes_ano", { ascending: false });
  if (error) return [];
  return Array.from(new Set((data ?? []).map((r) => r.mes_ano as string)));
}
