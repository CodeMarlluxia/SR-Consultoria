-- =====================================================================
--  Sales Performance & Commission Dashboard — Schema
--  PostgreSQL puro (13+). Idempotente: pode rodar mais de uma vez.
--    psql "$DATABASE_URL" -f db/schema.sql
-- =====================================================================

-- Needed for gen_random_uuid() on PostgreSQL < 13.
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
-- 4. Contas de acesso (RBAC) — substitui auth.users + perfis da Supabase.
--    'admin' (acesso total) e 'usuario_padrao' (só o Painel).
--    senha_hash é bcrypt — o mesmo formato da Supabase, então as senhas
--    migradas continuam valendo.
-- ---------------------------------------------------------------------
create table if not exists perfis (
    user_id     uuid primary key default gen_random_uuid(),
    email       varchar(255) not null,
    senha_hash  varchar(255) not null,
    role        varchar(20) not null default 'usuario_padrao'
                    check (role in ('admin', 'usuario_padrao')),
    criado_em   timestamptz not null default now()
);

-- E-mail único sem diferenciar maiúsculas (o login compara com lower()).
create unique index if not exists idx_perfis_email on perfis (lower(email));

-- ---------------------------------------------------------------------
-- Indexes (query performance for dashboard aggregations)
-- ---------------------------------------------------------------------
create index if not exists idx_vendas_profissional  on vendas_importadas (profissional_id);
create index if not exists idx_vendas_mes_ano        on vendas_importadas (mes_ano);
create index if not exists idx_vendas_prof_periodo   on vendas_importadas (profissional_id, mes_ano);
create index if not exists idx_vendas_data           on vendas_importadas (data_venda);
create index if not exists idx_metas_mes_ano         on metas (mes_ano);
-- Speeds up "load persisted goals for this period" lookups from the importer.
create index if not exists idx_metas_persistir       on metas (mes_ano) where persistir_meta_mes = true;

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
