import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "admin" | "usuario_padrao";

/** Papel do usuário logado. `null` se não houver perfil (não deveria acontecer — o gatilho cria um em todo signup). */
export async function getRole(supabase: SupabaseClient, userId: string): Promise<Role | null> {
  const { data } = await supabase.from("perfis").select("role").eq("user_id", userId).maybeSingle();
  return (data?.role as Role | undefined) ?? null;
}

export const isAdmin = (role: Role | null): boolean => role === "admin";
