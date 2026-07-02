// =====================================================================
//  Dashboard aggregation — runs in the browser so the date-range filter
//  can recompute everything in real time without a server round-trip.
// =====================================================================

/** A sale row as loaded from the DB, kept lean for client filtering. */
export interface SaleRecord {
  profissionalId: string;
  nome: string;
  dataVenda: string; // 'YYYY-MM-DD'
  valorVenda: number;
  valorComissao: number;
  categoria: string | null;
  servico: string | null;
}

export interface ProfPerformance {
  profissionalId: string;
  nome: string;
  qtdLinhas: number;
  faturamento: number;
  comissaoAcumulada: number;
  meta: number | null;
  progressoPct: number | null;
  projecaoFechamento: number | null;
}

export interface DashboardComputed {
  totalFaturamento: number;
  totalComissao: number;
  totalAtendimentos: number;
  metaGlobal: number | null;
  progressoGlobalPct: number | null;
  topPorReceita: ProfPerformance | null;
  topPorVolume: ProfPerformance | null;
  servicoMaisExecutado: { nome: string; ocorrencias: number } | null;
  categoriaMaisVendida: { nome: string; receita: number } | null;
  rows: ProfPerformance[];
}

const money = (n: number) => Math.round(n * 100) / 100;

/** Inclusive date filter on 'YYYY-MM-DD' strings (lexicographic works). */
export function filterByDateRange(
  sales: SaleRecord[],
  from: string | null,
  to: string | null,
): SaleRecord[] {
  return sales.filter((s) => {
    if (from && s.dataVenda < from) return false;
    if (to && s.dataVenda > to) return false;
    return true;
  });
}

/**
 * Compute every dashboard indicator from a (possibly filtered) set of
 * sales. `metas` maps profissionalId → goal for the period.
 *
 * `diasDecorridos`/`diasNoMes` drive the linear closing projection; pass
 * them from the server so "today" is consistent.
 */
export function computeDashboard(
  sales: SaleRecord[],
  metas: Map<string, number>,
  diasDecorridos: number,
  diasNoMes: number,
): DashboardComputed {
  type Acc = { nome: string; qtd: number; fat: number; com: number };
  const byProf = new Map<string, Acc>();
  const servicoCount = new Map<string, number>();
  const categoriaRev = new Map<string, number>();

  for (const s of sales) {
    const cur = byProf.get(s.profissionalId) ?? { nome: s.nome, qtd: 0, fat: 0, com: 0 };
    cur.qtd += 1;
    cur.fat += s.valorVenda;
    cur.com += s.valorComissao;
    byProf.set(s.profissionalId, cur);

    if (s.servico) servicoCount.set(s.servico, (servicoCount.get(s.servico) ?? 0) + 1);
    if (s.categoria) categoriaRev.set(s.categoria, (categoriaRev.get(s.categoria) ?? 0) + s.valorVenda);
  }

  const rows: ProfPerformance[] = Array.from(byProf.entries()).map(([id, a]) => {
    const meta = metas.get(id) ?? null;
    const faturamento = money(a.fat);
    const progressoPct = meta && meta > 0 ? Math.round((faturamento / meta) * 10000) / 100 : null;
    const projecaoFechamento =
      diasDecorridos > 0 && diasDecorridos < diasNoMes
        ? money((faturamento / diasDecorridos) * diasNoMes)
        : faturamento;
    return {
      profissionalId: id,
      nome: a.nome,
      qtdLinhas: a.qtd,
      faturamento,
      comissaoAcumulada: money(a.com),
      meta,
      progressoPct,
      projecaoFechamento,
    };
  });

  rows.sort((a, b) => b.faturamento - a.faturamento);

  const totalFaturamento = money(rows.reduce((s, r) => s + r.faturamento, 0));
  const totalComissao = money(rows.reduce((s, r) => s + r.comissaoAcumulada, 0));
  const totalAtendimentos = rows.reduce((s, r) => s + r.qtdLinhas, 0);

  const metasSoma = rows.reduce((s, r) => s + (r.meta ?? 0), 0);
  const metaGlobal = metasSoma > 0 ? money(metasSoma) : null;
  const progressoGlobalPct =
    metaGlobal && metaGlobal > 0 ? Math.round((totalFaturamento / metaGlobal) * 10000) / 100 : null;

  const topPorReceita = rows.length ? rows[0] : null;
  const topPorVolume = rows.length ? [...rows].sort((a, b) => b.qtdLinhas - a.qtdLinhas)[0] : null;

  let servicoMaisExecutado: DashboardComputed["servicoMaisExecutado"] = null;
  for (const [nome, ocorrencias] of servicoCount) {
    if (!servicoMaisExecutado || ocorrencias > servicoMaisExecutado.ocorrencias) {
      servicoMaisExecutado = { nome, ocorrencias };
    }
  }

  let categoriaMaisVendida: DashboardComputed["categoriaMaisVendida"] = null;
  for (const [nome, receita] of categoriaRev) {
    if (!categoriaMaisVendida || receita > categoriaMaisVendida.receita) {
      categoriaMaisVendida = { nome, receita: money(receita) };
    }
  }

  return {
    totalFaturamento,
    totalComissao,
    totalAtendimentos,
    metaGlobal,
    progressoGlobalPct,
    topPorReceita,
    topPorVolume,
    servicoMaisExecutado,
    categoriaMaisVendida,
    rows,
  };
}
