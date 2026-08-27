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
  /** When true, this goal auto-reloads on future imports of the same month. */
  persistir_meta_mes: boolean;
}

/** A persisted goal preloaded into the importer, keyed by normalized name. */
export interface PersistedGoal {
  profissional: string; // UPPERCASE, trimmed
  valorMeta: number;
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

/** Aggregated performance row for the dashboard table. */
export interface PerformanceRow {
  profissionalId: string;
  nome: string;
  qtdLinhas: number;
  faturamento: number;
  comissaoAcumulada: number;
  meta: number | null;
  progressoPct: number | null;
}
