import { Pool, types } from "pg";

// `date` volta como 'YYYY-MM-DD' (como a Supabase entregava), não como Date
// local — o painel compara e fatia essas strings diretamente.
types.setTypeParser(types.builtins.DATE, (v) => v);

/**
 * Pool do PostgreSQL — EXCLUSIVO do servidor. `DATABASE_URL` vem do ambiente
 * (Vercel → Settings → Environment Variables). O global sobrevive ao hot
 * reload do `next dev`, que senão abriria um pool novo a cada edição.
 */
const g = globalThis as unknown as { pgPool?: Pool };
export const db = (g.pgPool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
}));
