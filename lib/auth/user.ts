import { cache } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

export type Role = "admin" | "usuario_padrao";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Usuário logado, relido do banco a cada request — uma conta excluída ou
 * rebaixada perde o acesso na hora, mesmo com o cookie ainda válido.
 * `cache` evita repetir a consulta entre o AppShell e a página.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const id = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const { rows } = await db.query<SessionUser>(
    "select user_id as id, email, role from perfis where user_id = $1",
    [id],
  );
  return rows[0] ?? null;
});

export const isAdmin = (role: Role | null | undefined): boolean => role === "admin";
