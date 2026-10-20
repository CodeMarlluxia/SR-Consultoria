/**
 * Utilitário do banco (lê DATABASE_URL do ambiente):
 *
 *   npm run db:schema                          aplica db/schema.sql
 *   npm run db:admin -- <email> <senha>        cria/redefine uma conta admin
 *   SUPABASE_DB_URL=... npm run db:migrate     copia os dados da Supabase
 *
 * SUPABASE_DB_URL = Supabase → Project Settings → Database → Connection string.
 */
import fs from "node:fs";
import bcrypt from "bcryptjs";
import pg from "pg";

// `date` como texto: virar Date local e depois JSON pode trocar o dia pelo fuso.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

const [cmd, ...args] = process.argv.slice(2);
if (!process.env.DATABASE_URL) throw new Error("Defina DATABASE_URL.");
const target = new pg.Client({ connectionString: process.env.DATABASE_URL });
await target.connect();

try {
  if (cmd === "schema") {
    await target.query(fs.readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
    console.log("Schema aplicado.");
  } else if (cmd === "admin") {
    const [email, senha] = args;
    if (!email || !senha || senha.length < 6) throw new Error("Uso: db:admin -- <email> <senha (6+ caracteres)>");
    await target.query(
      `insert into perfis (email, senha_hash, role) values ($1, $2, 'admin')
       on conflict ((lower(email))) do update set senha_hash = excluded.senha_hash, role = 'admin'`,
      [email, await bcrypt.hash(senha, 10)],
    );
    console.log(`Admin pronta: ${email}`);
  } else if (cmd === "migrate") {
    await migrate();
  } else {
    throw new Error("Comando: schema | admin | migrate");
  }
} finally {
  await target.end();
}

async function migrate() {
  if (!process.env.SUPABASE_DB_URL) throw new Error("Defina SUPABASE_DB_URL.");
  const source = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL });
  await source.connect();

  // Ordem respeita as FKs. Ids preservados; reexecutar não duplica nada.
  // A senha vem de auth.users (bcrypt) — as pessoas entram com a mesma de antes.
  const tables = {
    profissionais: "select id, nome, criado_em from profissionais",
    metas: "select id, profissional_id, mes_ano, valor_meta, persistir_meta_mes from metas",
    vendas_importadas: "select * from vendas_importadas",
    perfis: `select p.user_id, p.email, coalesce(u.encrypted_password, '') as senha_hash, p.role, p.criado_em
               from perfis p join auth.users u on u.id = p.user_id`,
  };

  try {
    for (const [table, sql] of Object.entries(tables)) {
      // shortcut: carrega a tabela inteira na memória, ok até dezenas de milhares de linhas; acima disso, paginar.
      const { rows } = await source.query(sql);
      const { rowCount } = await target.query(
        `insert into ${table} select * from json_populate_recordset(null::${table}, $1) on conflict do nothing`,
        [JSON.stringify(rows)],
      );
      console.log(`${table}: ${rowCount}/${rows.length} linhas copiadas`);
    }
  } finally {
    await source.end();
  }
}
