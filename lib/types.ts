// =====================================================================
//  Domain types shared across the app
// =====================================================================

export interface Profissional {
  id: string;
  nome: string;
  criado_em: string;
}

export interface Meta {
  id: string;
  profissional_id: string;
  mes_ano: string; // 'YYYY-MM'
  valor_meta: number;
}

export interface VendaImportada {
  id: string;
  profissional_id: string;
  data_venda: string; // 'YYYY-MM-DD'
  valor_venda: number;
  valor_comissao_calculada: number;
  categoria: string | null;
  mes_ano: string;
  hash_transacao: string;
}

/** A single parsed + sanitized row coming out of the CSV importer. */
export interface ParsedSaleRow {
  profissional: string; // UPPERCASE, trimmed
  dataVenda: string; // 'YYYY-MM-DD'
  valorVenda: number;
  baseComissao: number;
  percentualComissao: number;
  comissaoLinha: number; // baseComissao * (percentualComissao / 100)
  categoria: string | null;
  servico: string | null;
  hashTransacao: string;
}

/** Linha agregada de desempenho exibida na tabela do dashboard. */
export interface PerformanceRow {
  profissionalId: string;
  nome: string;
  qtdLinhas: number;
  faturamento: number;
  comissaoAcumulada: number;
  meta: number | null;
  progressoPct: number | null;
  /** Valor acima da meta (0 quando não atingiu). */
  excedente: number;
  /** 10% do excedente — só existe a partir de 100% da meta. */
  premiacao: number;
  /** Posição no ranking oficial (0 = troféu), definida pelo % da meta. */
  posicao: number;
}
