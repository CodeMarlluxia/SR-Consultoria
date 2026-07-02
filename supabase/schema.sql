-- =====================================================================
--  Sales Performance & Commission Dashboard — Supabase Schema
--  PostgreSQL (Supabase)
--  Run this in the Supabase SQL Editor (or via `supabase db push`).
-- =====================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Professionals Registry (auto-populated during CSV upload)
-- ---------------------------------------------------------------------
create table if not exists profissionais (
    id          uuid primary key default gen_random_uuid(),
    nome        varchar(255) unique not null,   -- stored UPPERCASE + trimmed
    criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Goal Tracking per Period
-- ---------------------------------------------------------------------
create table if not exists metas (
    id                uuid primary key default gen_random_uuid(),
    profissional_id   uuid not null references profissionais(id) on delete cascade,
    mes_ano           varchar(7) not null,        -- 'YYYY-MM' e.g. '2026-06'
    valor_meta        decimal(10,2) not null check (valor_meta >= 0),
    -- When true, this goal is automatically reloaded on subsequent CSV
    -- imports for the same mes_ano (manager opted to persist it).
    persistir_meta_mes boolean not null default false,
    unique (profissional_id, mes_ano)
);

-- Idempotent migration for databases created before this column existed.
alter table metas
    add column if not exists persistir_meta_mes boolean not null default false;

-- ---------------------------------------------------------------------
-- 3. Consolidated Sales History
-- ---------------------------------------------------------------------
create table if not exists vendas_importadas (
    id                          uuid primary key default gen_random_uuid(),
    profissional_id             uuid not null references profissionais(id) on delete cascade,
    data_venda                  date not null,
    valor_venda                 decimal(10,2) not null,
    valor_comissao_calculada    decimal(10,2) not null,   -- stored formula result
    categoria                   varchar(100),
    servico                     varchar(255),              -- for "most executed service"
    mes_ano                     varchar(7) not null,       -- denormalized for fast period filtering
    hash_transacao              varchar(255) unique not null  -- idempotent imports
);

-- ---------------------------------------------------------------------
-- Indexes (query performance for dashboard aggregations)
-- ---------------------------------------------------------------------
create index if not exists idx_vendas_profissional  on vendas_importadas (profissional_id);
create index if not exists idx_vendas_mes_ano        on vendas_importadas (mes_ano);
create index if not exists idx_vendas_prof_periodo   on vendas_importadas (profissional_id, mes_ano);
create index if not exists idx_metas_mes_ano         on metas (mes_ano);

-- ---------------------------------------------------------------------
-- Row Level Security
--   Enable RLS and allow authenticated users full access.
--   Tighten these policies later if you add multi-tenant / per-user scoping.
-- ---------------------------------------------------------------------
alter table profissionais       enable row level security;
alter table metas               enable row level security;
alter table vendas_importadas   enable row level security;

drop policy if exists "auth full access - profissionais" on profissionais;
create policy "auth full access - profissionais"
    on profissionais for all
    to authenticated
    using (true) with check (true);

drop policy if exists "auth full access - metas" on metas;
create policy "auth full access - metas"
    on metas for all
    to authenticated
    using (true) with check (true);

drop policy if exists "auth full access - vendas" on vendas_importadas;
create policy "auth full access - vendas"
    on vendas_importadas for all
    to authenticated
    using (true) with check (true);

-- ---------------------------------------------------------------------
-- Convenience view: per-professional performance for a given period.
--   Query with:  select * from vw_performance where mes_ano = '2026-06';
-- ---------------------------------------------------------------------
create or replace view vw_performance as
select
    p.id                                        as profissional_id,
    p.nome                                      as nome,
    v.mes_ano                                   as mes_ano,
    count(v.id)                                 as qtd_linhas,
    coalesce(sum(v.valor_venda), 0)             as faturamento,
    coalesce(sum(v.valor_comissao_calculada),0) as comissao_acumulada,
    m.valor_meta                                as meta,
    case
        when m.valor_meta is null or m.valor_meta = 0 then null
        else round((coalesce(sum(v.valor_venda),0) / m.valor_meta) * 100, 2)
    end                                         as progresso_pct
from profissionais p
left join vendas_importadas v on v.profissional_id = p.id
left join metas m on m.profissional_id = p.id and m.mes_ano = v.mes_ano
group by p.id, p.nome, v.mes_ano, m.valor_meta;
