-- =====================================================================
--  Perfis de acesso (RBAC)
--  Dois papéis: 'admin' (acesso total) e 'usuario_padrao' (só o Painel).
--  Sem depender da Service Role Key: um gatilho copia todo novo cadastro
--  de auth.users para `perfis`, então o app nunca precisa ler auth.users
--  diretamente (schema protegido, não acessível pela chave anônima).
-- =====================================================================

create table if not exists perfis (
    user_id     uuid primary key references auth.users(id) on delete cascade,
    email       varchar(255) not null,
    role        varchar(20) not null default 'usuario_padrao'
                    check (role in ('admin', 'usuario_padrao')),
    criado_em   timestamptz not null default now()
);

-- Contas que já existiam antes deste RBAC viram admin automaticamente —
-- são as pessoas que já usavam o sistema livremente até aqui.
insert into perfis (user_id, email, role)
select id, email, 'admin'
from auth.users
on conflict (user_id) do nothing;

-- Todo cadastro novo (self-signup na tela de login, ou criado por um
-- admin na aba Usuários) entra como 'usuario_padrao' por padrão — quem
-- promove a admin é sempre uma conta admin existente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.perfis (user_id, email, role)
    values (new.id, new.email, 'usuario_padrao')
    on conflict (user_id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Função auxiliar (security definer) para evitar recursão de RLS ao
-- checar "esta pessoa é admin?" a partir de uma policy da própria tabela.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1 from public.perfis
        where user_id = auth.uid() and role = 'admin'
    );
$$;

alter table perfis enable row level security;

drop policy if exists "ler o próprio perfil ou tudo se admin" on perfis;
create policy "ler o próprio perfil ou tudo se admin"
    on perfis for select
    to authenticated
    using (user_id = auth.uid() or public.is_admin());

drop policy if exists "só admin altera papéis" on perfis;
create policy "só admin altera papéis"
    on perfis for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Sem policy de insert/delete para `authenticated`: só o gatilho (security
-- definer) cria linhas; ninguém apaga perfil pelo app.
