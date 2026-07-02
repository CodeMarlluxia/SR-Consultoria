-- =====================================================================
--  Migration 0001 — "Persistir metas do mês"
--  Adds a per-goal flag that, when true, makes the goal auto-reload on
--  subsequent CSV imports for the same period (mes_ano).
--
--  Safe to run multiple times (idempotent).
--  Run in the Supabase SQL Editor or via `supabase db push`.
-- =====================================================================

alter table metas
    add column if not exists persistir_meta_mes boolean not null default false;

-- Speeds up "load persisted goals for this period" lookups from the importer.
create index if not exists idx_metas_persistir
    on metas (mes_ano)
    where persistir_meta_mes = true;
