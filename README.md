# SR Consultoria — Painel de metas e comissões

Next.js 14 + PostgreSQL puro (driver `pg`). Login próprio: senha em bcrypt na tabela `perfis`, sessão em cookie assinado com `AUTH_SECRET`.

## Variáveis de ambiente

Veja [.env.example](.env.example): `DATABASE_URL` e `AUTH_SECRET`.

## Banco

```bash
npm run db:schema                                   # cria as tabelas (idempotente)
SUPABASE_DB_URL=postgres://... npm run db:migrate   # opcional: copia dados e contas da Supabase
npm run db:admin -- voce@empresa.com SenhaForte      # cria/redefine uma admin
```

`db:migrate` preserva ids e senhas (os hashes bcrypt da Supabase continuam válidos). Pode rodar de novo sem duplicar.

## Desenvolvimento

```bash
cp .env.example .env.local   # preencha os valores
npm install && npm run dev
```

## Deploy na Vercel

1. Importe o repositório do GitHub na Vercel (framework detectado: Next.js).
2. Em **Settings → Environment Variables**, cadastre `DATABASE_URL` (com `?sslmode=require` em banco gerenciado) e `AUTH_SECRET`.
3. Rode `npm run db:schema` (e `db:migrate` / `db:admin`) apontando `DATABASE_URL` para o banco de produção.
4. Remova as variáveis antigas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.

Banco serverless (Neon/Vercel Postgres): use a string de conexão **pooled**.
