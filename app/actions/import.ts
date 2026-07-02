"use server";

import { createClient } from "@/lib/supabase/server";
import type { ParsedSaleRow, PersistedGoal } from "@/lib/types";

// =====================================================================
//  Server Actions — persist the imported period to Supabase.
//
//  Flow:
//    1. upsert professionals (get their ids)
//    2. upsert goals for the period
//    3. bulk-upsert sales, ignoring rows whose hash already exists
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

/** Ensure every name exists in `profissionais`, return name → id map. */
async function upsertProfessionals(
  supabase: Awaited<ReturnType<typeof createClient>>,
  names: string[],
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(names));

  // Insert missing ones (ignore conflicts on the unique `nome`).
  const { error: insErr } = await supabase
    .from("profissionais")
    .upsert(
      unique.map((nome) => ({ nome })),
      { onConflict: "nome", ignoreDuplicates: true },
    );
  if (insErr) throw new Error(`profissionais: ${insErr.message}`);

  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome")
    .in("nome", unique);
  if (error) throw new Error(`profissionais select: ${error.message}`);

  return new Map((data ?? []).map((p) => [p.nome, p.id]));
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
    const supabase = await createClient();

    const valid = goals.filter((g) => g.valorMeta > 0);
    if (valid.length === 0) {
      return { ok: false, error: "Defina ao menos uma meta antes de salvar." };
    }

    const nameToId = await upsertProfessionals(
      supabase,
      valid.map((g) => g.profissional),
    );

    const metaRows = valid.map((g) => ({
      profissional_id: nameToId.get(g.profissional)!,
      mes_ano: mesAno,
      valor_meta: g.valorMeta,
      persistir_meta_mes: persistir,
    }));

    const { error } = await supabase
      .from("metas")
      .upsert(metaRows, { onConflict: "profissional_id,mes_ano" });
    if (error) return { ok: false, error: `metas: ${error.message}` };

    return {
      ok: true,
      inserted: { profissionais: nameToId.size, metas: metaRows.length, vendas: 0 },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

/**
 * Persist the imported sales rows. Idempotent: rows whose `hash_transacao`
 * already exists are skipped by the unique constraint (ignoreDuplicates).
 */
export async function saveSales(
  mesAno: string,
  rows: ParsedSaleRow[],
): Promise<SaveResult> {
  try {
    const supabase = await createClient();
    if (rows.length === 0) return { ok: false, error: "Nenhuma venda para importar." };

    const nameToId = await upsertProfessionals(
      supabase,
      rows.map((r) => r.profissional),
    );

    const vendaRows = rows.map((r) => ({
      profissional_id: nameToId.get(r.profissional)!,
      data_venda: r.dataVenda,
      valor_venda: r.valorVenda,
      valor_comissao_calculada: r.comissaoLinha,
      categoria: r.categoria,
      servico: r.servico,
      mes_ano: mesAno,
      hash_transacao: r.hashTransacao,
    }));

    // ignoreDuplicates → existing hashes are silently skipped.
    const { data, error } = await supabase
      .from("vendas_importadas")
      .upsert(vendaRows, { onConflict: "hash_transacao", ignoreDuplicates: true })
      .select("id");
    if (error) return { ok: false, error: `vendas: ${error.message}` };

    const inseridas = data?.length ?? 0;
    // Rows submitted minus rows actually inserted = duplicates the unique
    // hash_transacao constraint idempotently skipped.
    const duplicatasIgnoradas = Math.max(0, vendaRows.length - inseridas);

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
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("metas")
      .select("valor_meta, persistir_meta_mes, profissionais(nome)")
      .eq("mes_ano", mesAno)
      .eq("persistir_meta_mes", true);
    if (error || !data) return [];

    return data.flatMap((row) => {
      // Supabase types the joined relation as an array; take the first name.
      const rel = row.profissionais as unknown as { nome: string } | { nome: string }[] | null;
      const nome = Array.isArray(rel) ? rel[0]?.nome : rel?.nome;
      if (!nome) return [];
      return [{ profissional: nome, valorMeta: Number(row.valor_meta) }];
    });
  } catch {
    return [];
  }
}
