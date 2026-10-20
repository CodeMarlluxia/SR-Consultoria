"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUser, isAdmin, type Role } from "@/lib/auth/user";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Garante que quem chamou a action é um admin logado. */
async function requireAdmin() {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Sessão expirada." };
  if (!isAdmin(user.role)) return { ok: false as const, error: "Só administradoras podem fazer isso." };
  return { ok: true as const, userId: user.id };
}

/** Código do PostgreSQL para violação de UNIQUE (aqui: e-mail repetido). */
const isUniqueViolation = (err: unknown) => (err as { code?: string })?.code === "23505";

/** Cria uma conta nova — sem tocar na sessão da admin que está criando. */
export async function createUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "usuario_padrao") as Role;

  if (!email || !password) return { ok: false, error: "Informe e-mail e senha." };
  if (password.length < 6) return { ok: false, error: "A senha precisa ter ao menos 6 caracteres." };
  if (role !== "admin" && role !== "usuario_padrao") return { ok: false, error: "Perfil inválido." };

  try {
    await db.query("insert into perfis (email, senha_hash, role) values ($1, $2, $3)", [
      email,
      await bcrypt.hash(password, 10),
      role,
    ]);
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "Este e-mail já está cadastrado." };
    return { ok: false, error: err instanceof Error ? err.message : "Não foi possível criar a conta." };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

export interface UserEdit {
  email: string;
  /** Vazio = manter a senha atual. */
  password?: string;
  role: Role;
}

/** Edita uma conta: e-mail, senha (opcional) e perfil. */
export async function updateUser(userId: string, edit: UserEdit): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const email = edit.email.trim();
  const password = edit.password?.trim() ?? "";

  if (!email) return { ok: false, error: "Informe o e-mail." };
  if (password && password.length < 6) {
    return { ok: false, error: "A senha precisa ter ao menos 6 caracteres." };
  }
  if (edit.role !== "admin" && edit.role !== "usuario_padrao") {
    return { ok: false, error: "Perfil inválido." };
  }
  if (userId === admin.userId && edit.role !== "admin") {
    return { ok: false, error: "Você não pode rebaixar o seu próprio perfil." };
  }

  try {
    const { rowCount } = await db.query(
      `update perfis
          set email = $2, role = $3, senha_hash = coalesce($4, senha_hash)
        where user_id = $1`,
      [userId, email, edit.role, password ? await bcrypt.hash(password, 10) : null],
    );
    if (!rowCount) return { ok: false, error: "Conta não encontrada." };
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, error: "Este e-mail já está em uso por outra conta." };
    return { ok: false, error: err instanceof Error ? err.message : "Não foi possível salvar." };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

/** Exclui a conta de vez — a sessão dela deixa de valer no próximo request. */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };
  if (userId === admin.userId) {
    return { ok: false, error: "Você não pode excluir a sua própria conta." };
  }

  try {
    await db.query("delete from perfis where user_id = $1", [userId]);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Não foi possível excluir." };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}
