"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
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
