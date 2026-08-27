// =====================================================================
//  Agregação do dashboard — roda no browser para que o filtro de datas
//  recalcule tudo sem ida ao servidor.
//
//  REGRAS DE NEGÓCIO
//  1. Ranking: ordenado pelo PERCENTUAL DE ATINGIMENTO DA META
//     ((faturamento / meta) * 100) em ordem decrescente. O troféu é de
//     quem tem o maior percentual, independentemente do valor absoluto.
//  2. Premiação: 10% sobre o EXCEDENTE, e só quando a meta é atingida
//     ou ultrapassada. Abaixo da meta, premiação = 0.
// =====================================================================

/** Percentual da premiação sobre o excedente da meta. */
export const PREMIACAO_PCT = 0.1;

/** Uma linha de venda como vem do banco, enxuta para o filtro client-side. */
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
  /** Quanto passou da meta (0 quando não atingiu ou não há meta). */
  excedente: number;
  /** 10% do excedente. Zero quando a meta não foi atingida. */
  premiacao: number;
  /** Posição no ranking oficial (0 = troféu), definida pelo % da meta. */
  posicao: number;
}

export interface DashboardComputed {
  totalFaturamento: number;
  totalComissao: number;
  totalAtendimentos: number;
  totalPremiacao: number;
  metaGlobal: number | null;
  progressoGlobalPct: number | null;
  metasBatidas: number;
  /** Líder do ranking oficial — maior % da meta. */
  topPorMeta: ProfPerformance | null;
  topPorReceita: ProfPerformance | null;
  topPorVolume: ProfPerformance | null;
  servicoMaisExecutado: { nome: string; ocorrencias: number } | null;
  categoriaMaisVendida: { nome: string; receita: number } | null;
  /** Já ordenado pelo % de atingimento da meta (decrescente). */
  rows: ProfPerformance[];
}

const money = (n: number) => Math.round(n * 100) / 100;

/** Filtro de data inclusivo sobre strings 'YYYY-MM-DD' (ordem lexicográfica). */
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
 * Premiação = (faturamento − meta) × 10%, aplicada apenas ao excedente e
 * somente quando faturamento >= meta. Sem meta definida não há premiação.
 */
export function calcPremiacao(
  faturamento: number,
  meta: number | null,
): { excedente: number; premiacao: number } {
  if (meta === null || meta <= 0 || faturamento < meta) {
    return { excedente: 0, premiacao: 0 };
  }
  const excedente = money(faturamento - meta);
  return { excedente, premiacao: money(excedente * PREMIACAO_PCT) };
}

/**
 * Ordenação oficial do ranking: maior % de atingimento primeiro.
 * Empate desempata pelo faturamento. Quem não tem meta definida vai para
 * o fim da lista (não disputa troféu), ordenado por faturamento.
 */
export function sortByGoalAttainment<T extends { progressoPct: number | null; faturamento: number }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const aHas = a.progressoPct !== null;
    const bHas = b.progressoPct !== null;
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (aHas && bHas && a.progressoPct !== b.progressoPct) {
      return (b.progressoPct as number) - (a.progressoPct as number);
    }
    return b.faturamento - a.faturamento;
  });
}

/**
 * Calcula todos os indicadores a partir de um conjunto (possivelmente
 * filtrado) de vendas. `metas` mapeia profissionalId → meta do período.
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
    if (s.categoria) {
      categoriaRev.set(s.categoria, (categoriaRev.get(s.categoria) ?? 0) + s.valorVenda);
    }
  }

  const base = Array.from(byProf.entries()).map(([id, a]) => {
    const meta = metas.get(id) ?? null;
    const faturamento = money(a.fat);
    const progressoPct =
      meta !== null && meta > 0 ? Math.round((faturamento / meta) * 10000) / 100 : null;
    const projecaoFechamento =
      diasDecorridos > 0 && diasDecorridos < diasNoMes
        ? money((faturamento / diasDecorridos) * diasNoMes)
        : faturamento;
    const { excedente, premiacao } = calcPremiacao(faturamento, meta);

    return {
      profissionalId: id,
      nome: a.nome,
      qtdLinhas: a.qtd,
      faturamento,
      comissaoAcumulada: money(a.com),
      meta,
      progressoPct,
      projecaoFechamento,
      excedente,
      premiacao,
      posicao: 0,
    };
  });

  // Regra 1: a posição (e o troféu) sai do % da meta, não do valor.
  const rows: ProfPerformance[] = sortByGoalAttainment(base).map((r, i) => ({
    ...r,
    posicao: i,
  }));

  const totalFaturamento = money(rows.reduce((s, r) => s + r.faturamento, 0));
  const totalComissao = money(rows.reduce((s, r) => s + r.comissaoAcumulada, 0));
  const totalPremiacao = money(rows.reduce((s, r) => s + r.premiacao, 0));
  const totalAtendimentos = rows.reduce((s, r) => s + r.qtdLinhas, 0);
  const metasBatidas = rows.filter((r) => r.progressoPct !== null && r.progressoPct >= 100).length;

  const metasSoma = rows.reduce((s, r) => s + (r.meta ?? 0), 0);
  const metaGlobal = metasSoma > 0 ? money(metasSoma) : null;
  const progressoGlobalPct =
    metaGlobal && metaGlobal > 0
      ? Math.round((totalFaturamento / metaGlobal) * 10000) / 100
      : null;

  const topPorMeta = rows.length && rows[0].progressoPct !== null ? rows[0] : null;
  const topPorReceita = rows.length
    ? [...rows].sort((a, b) => b.faturamento - a.faturamento)[0]
    : null;
  const topPorVolume = rows.length
    ? [...rows].sort((a, b) => b.qtdLinhas - a.qtdLinhas)[0]
    : null;

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
    totalPremiacao,
    metaGlobal,
    progressoGlobalPct,
    metasBatidas,
    topPorMeta,
    topPorReceita,
    topPorVolume,
    servicoMaisExecutado,
    categoriaMaisVendida,
    rows,
  };
}
