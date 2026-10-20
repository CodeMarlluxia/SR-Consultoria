"use server";

import { db } from "@/lib/db";
import { getUser, isAdmin } from "@/lib/auth/user";
import type { ParsedSaleRow, PersistedGoal } from "@/lib/types";

// =====================================================================
//  Server Actions — persist the imported period to PostgreSQL.
//
//  Flow:
//    1. upsert professionals (get their ids)
//    2. upsert goals for the period
//    3. bulk-insert sales, skipping rows whose hash already exists
//       (idempotent re-imports)
// =====================================================================

export interface GoalInput {
  profissional: string; // normalized name
  valorMeta: number;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
  inserted?: { profissionais: number; metas: number; vendas: number };
  /** How many sales rows were skipped as duplicates (idempotency). */
  duplicatasIgnoradas?: number;
}

/** Importing is an admin-only screen; the actions enforce it too. */
async function requireAdmin(): Promise<string | null> {
  const user = await getUser();
  if (!user) return "Sessão expirada.";
  return isAdmin(user.role) ? null : "Só administradoras podem importar.";
}

/** Ensure every name exists in `profissionais`, return name → id map. */
async function upsertProfessionals(names: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(names));

  await db.query(
    "insert into profissionais (nome) select unnest($1::text[]) on conflict (nome) do nothing",
    [unique],
  );
  const { rows } = await db.query<{ id: string; nome: string }>(
    "select id, nome from profissionais where nome = any($1::text[])",
    [unique],
  );

  return new Map(rows.map((p) => [p.nome, p.id]));
}

/**
 * Save goals for a period. Called from the importer once the manager
 * confirms ("Salvar metas").
 *
 * `persistir` controls whether these goals auto-reload on subsequent CSV
 * imports for the same month (the "keep goals for this month?" prompt).
 */
export async function saveGoals(
  mesAno: string,
  goals: GoalInput[],
  persistir = false,
): Promise<SaveResult> {
  try {
    const denied = await requireAdmin();
    if (denied) return { ok: false, error: denied };

    const valid = goals.filter((g) => g.valorMeta > 0);
    if (valid.length === 0) {
      return { ok: false, error: "Defina ao menos uma meta antes de salvar." };
    }

    const nameToId = await upsertProfessionals(valid.map((g) => g.profissional));

    await db.query(
      `insert into metas (profissional_id, mes_ano, valor_meta, persistir_meta_mes)
       select p, $2, v, $4 from unnest($1::uuid[], $3::numeric[]) as t(p, v)
       on conflict (profissional_id, mes_ano) do update
         set valor_meta = excluded.valor_meta,
             persistir_meta_mes = excluded.persistir_meta_mes`,
      [valid.map((g) => nameToId.get(g.profissional)), mesAno, valid.map((g) => g.valorMeta), persistir],
    );

    return {
      ok: true,
      inserted: { profissionais: nameToId.size, metas: valid.length, vendas: 0 },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? `metas: ${err.message}` : "Erro desconhecido." };
  }
}

/**
 * Persist the imported sales rows. Idempotent: rows whose `hash_transacao`
 * already exists are skipped by the unique constraint (on conflict do nothing).
 */
export async function saveSales(
  mesAno: string,
  rows: ParsedSaleRow[],
): Promise<SaveResult> {
  try {
    const denied = await requireAdmin();
    if (denied) return { ok: false, error: denied };
    if (rows.length === 0) return { ok: false, error: "Nenhuma venda para importar." };

    const nameToId = await upsertProfessionals(rows.map((r) => r.profissional));

    const { rowCount } = await db.query(
      `insert into vendas_importadas
         (profissional_id, data_venda, valor_venda, valor_comissao_calculada,
          categoria, servico, mes_ano, hash_transacao)
       select p, d, v, c, cat, s, $7, h
         from unnest($1::uuid[], $2::date[], $3::numeric[], $4::numeric[],
                     $5::text[], $6::text[], $8::text[]) as t(p, d, v, c, cat, s, h)
       on conflict (hash_transacao) do nothing`,
      [
        rows.map((r) => nameToId.get(r.profissional)),
        rows.map((r) => r.dataVenda),
        rows.map((r) => r.valorVenda),
        rows.map((r) => r.comissaoLinha),
        rows.map((r) => r.categoria),
        rows.map((r) => r.servico),
        mesAno,
        rows.map((r) => r.hashTransacao),
      ],
    );

    const inseridas = rowCount ?? 0;
    // Rows submitted minus rows actually inserted = duplicates the unique
    // hash_transacao constraint idempotently skipped.
    const duplicatasIgnoradas = Math.max(0, rows.length - inseridas);

    return {
      ok: true,
      inserted: {
        profissionais: nameToId.size,
        metas: 0,
        vendas: inseridas,
      },
      duplicatasIgnoradas,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? `vendas: ${err.message}` : "Erro desconhecido." };
  }
}

/**
 * Save goals and sales together — the full "Salvar metas" action from the
 * importer, so a period lands in one shot.
 *
 * `persistir` → whether these goals should auto-reload on future imports of
 * the same month.
 */
export async function saveImport(
  mesAno: string,
  goals: GoalInput[],
  sales: ParsedSaleRow[],
  persistir = false,
): Promise<SaveResult> {
  const goalsResult = await saveGoals(mesAno, goals, persistir);
  if (!goalsResult.ok) return goalsResult;

  const salesResult = await saveSales(mesAno, sales);
  if (!salesResult.ok) return salesResult;

  return {
    ok: true,
    inserted: {
      profissionais: salesResult.inserted?.profissionais ?? 0,
      metas: goalsResult.inserted?.metas ?? 0,
      vendas: salesResult.inserted?.vendas ?? 0,
    },
    duplicatasIgnoradas: salesResult.duplicatasIgnoradas ?? 0,
  };
}

/**
 * Load goals flagged as persistent for a given month, so the importer can
 * pre-fill them automatically on subsequent CSV imports of the same period.
 * Returns normalized (UPPERCASE) professional name → goal value.
 */
export async function getPersistedGoals(mesAno: string): Promise<PersistedGoal[]> {
  if (!/^\d{4}-\d{2}$/.test(mesAno)) return [];
  try {
    if (await requireAdmin()) return [];
    const { rows } = await db.query<{ nome: string; valor_meta: string }>(
      `select p.nome, m.valor_meta
         from metas m join profissionais p on p.id = m.profissional_id
        where m.mes_ano = $1 and m.persistir_meta_mes`,
      [mesAno],
    );
    return rows.map((r) => ({ profissional: r.nome, valorMeta: Number(r.valor_meta) }));
  } catch {
    return [];
  }
}
