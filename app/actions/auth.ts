"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

/** Sign in with email + password. Redirects on success. */
export async function login(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traduzErro(error.message) };

  revalidatePath("/", "layout");
  redirect(redirectTo || "/dashboard");
}

/** Create an account. Depending on project settings, may require e-mail confirmation. */
export async function signup(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha." };
  if (password.length < 6) return { error: "A senha precisa ter ao menos 6 caracteres." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: traduzErro(error.message) };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Sign out and return to login. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/** Friendlier PT-BR messages for the common Supabase auth errors. */
function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um momento.";
  return msg;
}
