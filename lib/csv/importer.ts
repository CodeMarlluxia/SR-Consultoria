import Papa from "papaparse";
import type { ParsedSaleRow } from "@/lib/types";

// =====================================================================
//  CSV Importer — parses the sales report, sanitizes values and
//  computes per-line commission.
//
//  Report format (confirmed against the real file):
//    - Delimiter: ";"
//    - Encoding:  ISO-8859-1
//    - Rows 1-7:  metadata  → skipped
//    - Row 8:     header
//    - Row 9+:    data
// =====================================================================

/** Exact header labels as they appear in row 8 of the report. */
export const COLUMNS = {
  data: "Atendimento/Venda",
  profissional: "Profissional",
  servico: "Serviço/Produto/Pacote",
  categoria: "Categoria",
  cliente: "Cliente",
  valor: "Valor",
  baseComissao: "Valor Base Comissão",
  percentComissao: "% Comissão",
  valorComissao: "Valor Comissão",
} as const;

// The report has ~7 metadata rows before the header, but two of them are
// empty ("") and get dropped when skipEmptyLines is on — so the header's
// absolute index shifts. Instead of trusting a fixed offset, we locate the
// header row dynamically by looking for the "Profissional" column. This is
// resilient to the report tool adding/removing metadata lines.
function findHeaderIndex(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i].map((c) => c.trim());
    if (row.includes(COLUMNS.profissional) && row.includes(COLUMNS.valor)) {
      return i;
    }
  }
  return -1;
}

/** UPPERCASE + trim so "Gleiciane", "gleiciane", " GLEICIANE " unify. */
export function normalizeName(raw: string): string {
  return (raw ?? "").trim().toUpperCase();
}

/**
 * Convert a Brazilian-formatted number string to a float.
 *   "1.500,00" -> 1500.00 · "500,00" -> 500.00 · "-" / "" -> 0
 */
export function parseBRNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim();
  if (!cleaned || cleaned === "-") return 0;
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** "16/06/2026" -> "2026-06-16" (ISO date for the DB). */
export function parseBRDate(raw: string): string {
  const m = (raw ?? "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return "";
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

/** "2026-06-16" -> "2026-06" (period key). */
export function toPeriod(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/**
 * Deterministic hash for a transaction so re-importing the same report
 * never inserts duplicates. Built from the fields that together make a
 * line unique, plus an `ocorrencia` counter that distinguishes genuinely
 * repeated identical transactions (e.g. the same client buying the same
 * service twice on the same day — which happens in the real data).
 */
export function makeTransactionHash(parts: {
  data: string;
  profissional: string;
  valor: number;
  baseComissao: number;
  percentComissao: number;
  servico: string;
  cliente: string;
  ocorrencia: number;
}): string {
  const raw = [
    parts.data,
    parts.profissional,
    parts.valor.toFixed(2),
    parts.baseComissao.toFixed(2),
    parts.percentComissao.toFixed(2),
    parts.servico.trim().toUpperCase(),
    parts.cliente.trim().toUpperCase(),
    String(parts.ocorrencia),
  ].join("|");

  // FNV-1a 32-bit — small, dependency-free, stable across runs.
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export interface ParseResult {
  rows: ParsedSaleRow[];
  professionals: string[]; // unique, normalized, sorted
  errors: string[];
}

/**
 * Parse a report File in the browser. Resolves with sanitized rows,
 * the unique professional list and any row-level warnings.
 */
export function parseSalesReport(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      delimiter: ";",
      encoding: "ISO-8859-1",
      skipEmptyLines: true,
      complete: (results) => {
        try {
          resolve(processRows(results.data));
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

/** Shared row-processing logic (also unit-testable with raw arrays). */
export function processRows(allRows: string[][]): ParseResult {
  const errors: string[] = [];

  const headerIdx = findHeaderIndex(allRows);
  if (headerIdx === -1) {
    return {
      rows: [],
      professionals: [],
      errors: ['Cabeçalho não encontrado (coluna "Profissional"). Verifique o formato do relatório.'],
    };
  }

  // Header + data rows, dropping the metadata above the header.
  const afterMeta = allRows.slice(headerIdx);
  const header = afterMeta[0].map((h) => h.trim());
  const idx = (label: string) => header.indexOf(label);

  const iData = idx(COLUMNS.data);
  const iProf = idx(COLUMNS.profissional);
  const iServ = idx(COLUMNS.servico);
  const iCat = idx(COLUMNS.categoria);
  const iCli = idx(COLUMNS.cliente);
  const iVal = idx(COLUMNS.valor);
  const iBase = idx(COLUMNS.baseComissao);
  const iPct = idx(COLUMNS.percentComissao);

  const missing = Object.entries({
    [COLUMNS.data]: iData,
    [COLUMNS.profissional]: iProf,
    [COLUMNS.valor]: iVal,
    [COLUMNS.baseComissao]: iBase,
    [COLUMNS.percentComissao]: iPct,
  })
    .filter(([, i]) => i === -1)
    .map(([name]) => name);

  if (missing.length) {
    return {
      rows: [],
      professionals: [],
      errors: [`Colunas não encontradas: ${missing.join(", ")}. Verifique o formato do relatório.`],
    };
  }

  const rows: ParsedSaleRow[] = [];
  const profSet = new Set<string>();
  const occurrenceCounter = new Map<string, number>(); // content-key -> times seen

  for (let r = 1; r < afterMeta.length; r++) {
    const cols = afterMeta[r];
    const rawName = cols[iProf] ?? "";
    if (!rawName.trim()) continue; // skip blank/summary lines

    const profissional = normalizeName(rawName);
    const dataVenda = parseBRDate(cols[iData] ?? "");
    if (!dataVenda) {
      errors.push(`Linha ${r + headerIdx + 1}: data inválida ("${cols[iData]}").`);
      continue;
    }

    const valorVenda = parseBRNumber(cols[iVal] ?? "");
    const baseComissao = parseBRNumber(cols[iBase] ?? "");
    const percentualComissao = parseBRNumber(cols[iPct] ?? "");
    const categoria = (cols[iCat] ?? "").trim() || null;
    const servico = iServ >= 0 ? cols[iServ] ?? "" : "";
    const cliente = iCli >= 0 ? cols[iCli] ?? "" : "";

    // Row-level commission: Base * (% / 100)
    const comissaoLinha = Math.round(baseComissao * (percentualComissao / 100) * 100) / 100;

    // How many identical content-lines have we seen so far? This makes the
    // hash unique for legitimately repeated transactions while staying
    // stable across re-imports of the same file.
    const contentKey = [
      dataVenda,
      profissional,
      valorVenda.toFixed(2),
      baseComissao.toFixed(2),
      percentualComissao.toFixed(2),
      servico.trim().toUpperCase(),
      cliente.trim().toUpperCase(),
    ].join("|");
    const ocorrencia = occurrenceCounter.get(contentKey) ?? 0;
    occurrenceCounter.set(contentKey, ocorrencia + 1);

    const hashTransacao = makeTransactionHash({
      data: dataVenda,
      profissional,
      valor: valorVenda,
      baseComissao,
      percentComissao: percentualComissao,
      servico,
      cliente,
      ocorrencia,
    });

    profSet.add(profissional);
    rows.push({
      profissional,
      dataVenda,
      valorVenda,
      baseComissao,
      percentualComissao,
      comissaoLinha,
      categoria,
      servico: servico.trim() || null,
      hashTransacao,
    });
  }

  return {
    rows,
    professionals: Array.from(profSet).sort((a, b) => a.localeCompare(b, "pt-BR")),
    errors,
  };
}

// ---------------------------------------------------------------------
// Aggregation helpers (used by the dashboard)
// ---------------------------------------------------------------------

export interface ProfessionalAggregate {
  profissional: string;
  qtdLinhas: number;
  faturamento: number;
  comissaoAcumulada: number;
}

export function aggregateByProfessional(rows: ParsedSaleRow[]): ProfessionalAggregate[] {
  const map = new Map<string, ProfessionalAggregate>();
  for (const row of rows) {
    const cur =
      map.get(row.profissional) ??
      { profissional: row.profissional, qtdLinhas: 0, faturamento: 0, comissaoAcumulada: 0 };
    cur.qtdLinhas += 1;
    cur.faturamento += row.valorVenda;
    cur.comissaoAcumulada += row.comissaoLinha;
    map.set(row.profissional, cur);
  }
  // round money after summation
  return Array.from(map.values())
    .map((a) => ({
      ...a,
      faturamento: Math.round(a.faturamento * 100) / 100,
      comissaoAcumulada: Math.round(a.comissaoAcumulada * 100) / 100,
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
}

/** Progress (%) = (realized revenue / goal) * 100 */
export function computeProgress(faturamento: number, meta: number | null): number | null {
  if (!meta || meta <= 0) return null;
  return Math.round((faturamento / meta) * 100 * 100) / 100;
}
