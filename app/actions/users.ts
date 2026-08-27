"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, SERVICE_KEY_MISSING } from "@/lib/supabase/admin";
import { getRole, isAdmin, type Role } from "@/lib/supabase/perfil";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Garante que quem chamou a action é um admin logado. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: "Sessão expirada." };
  const role = await getRole(supabase, user.id);
  if (!isAdmin(role)) return { supabase, ok: false as const, error: "Só administradoras podem fazer isso." };
  return { supabase, ok: true as const, userId: user.id };
}

/**
 * Cria uma conta nova. Usa um cliente Supabase à parte (sem cookies) para
 * chamar o `signUp` público — assim a sessão da admin que está criando o
 * usuário não é substituída pela sessão da conta recém-criada.
 */
export async function createUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "usuario_padrao") as Role;

  if (!email || !password) return { ok: false, error: "Informe e-mail e senha." };
  if (password.length < 6) return { ok: false, error: "A senha precisa ter ao menos 6 caracteres." };
  if (role !== "admin" && role !== "usuario_padrao") return { ok: false, error: "Perfil inválido." };

  const isolated = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await isolated.auth.signUp({ email, password });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already registered")) return { ok: false, error: "Este e-mail já está cadastrado." };
    return { ok: false, error: error.message };
  }
  if (!data.user) return { ok: false, error: "Não foi possível criar a conta." };

  // O gatilho já criou o perfil como 'usuario_padrao'; se a admin escolheu
  // 'admin', promove agora usando o client normal (respeita a RLS: só
  // admin pode alterar `role`).
  if (role === "admin") {
    const { error: updErr } = await admin.supabase
      .from("perfis")
      .update({ role: "admin" })
      .eq("user_id", data.user.id);
    if (updErr) return { ok: false, error: `Conta criada, mas não deu para definir o perfil: ${updErr.message}` };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

/** Promove/rebaixa uma conta existente. */
export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };
  if (role !== "admin" && role !== "usuario_padrao") return { ok: false, error: "Perfil inválido." };

  const { error } = await admin.supabase.from("perfis").update({ role }).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/usuarios");
  return { ok: true };
}

export interface UserEdit {
  email: string;
  /** Vazio = manter a senha atual. */
  password?: string;
  role: Role;
}

/**
 * Edita uma conta: e-mail, senha (opcional) e perfil.
 *
 * O perfil sai pela RLS normal, mas e-mail e senha vivem em `auth.users`,
 * que a chave anônima não alcança — essa parte só roda com a Service Role
 * Key. Quando ela não está configurada, o perfil ainda é salvo e a resposta
 * explica o que faltou, em vez de falhar em silêncio.
 */
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

  const { data: atual, error: readErr } = await admin.supabase
    .from("perfis")
    .select("email, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!atual) return { ok: false, error: "Conta não encontrada." };

  const trocouEmail = email !== atual.email;
  const precisaAuth = trocouEmail || Boolean(password);

  if (precisaAuth) {
    const service = createAdminClient();
    if (!service) return { ok: false, error: SERVICE_KEY_MISSING };

    const { error } = await service.auth.admin.updateUserById(userId, {
      ...(trocouEmail ? { email } : {}),
      ...(password ? { password } : {}),
    });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("already") && m.includes("registered")) {
        return { ok: false, error: "Este e-mail já está em uso por outra conta." };
      }
      return { ok: false, error: error.message };
    }
  }

  // `perfis.email` é uma cópia usada na listagem: mantém em dia junto.
  const { error: updErr } = await admin.supabase
    .from("perfis")
    .update({ email, role: edit.role })
    .eq("user_id", userId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/usuarios");
  return { ok: true };
}

/**
 * Exclui a conta de verdade, em `auth.users` — a linha de `perfis` some
 * junto pelo ON DELETE CASCADE. Apagar só o perfil deixaria a pessoa ainda
 * capaz de entrar, então esta operação exige a Service Role Key.
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error };
  if (userId === admin.userId) {
    return { ok: false, error: "Você não pode excluir a sua própria conta." };
  }

  const service = createAdminClient();
  if (!service) return { ok: false, error: SERVICE_KEY_MISSING };

  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/usuarios");
  return { ok: true };
}
