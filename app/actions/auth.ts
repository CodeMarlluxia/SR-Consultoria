"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/session";

export interface AuthResult {
  error?: string;
}

/** Sign in with email + password. Redirects on success. */
export async function login(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const { rows } = await db.query<{ user_id: string; senha_hash: string }>(
    "select user_id, senha_hash from perfis where lower(email) = lower($1)",
    [email],
  );
  const conta = rows[0];
  // Hash inválido (ex.: conta sem senha vinda da Supabase) conta como senha errada.
  const ok = conta && (await bcrypt.compare(password, conta.senha_hash).catch(() => false));
  if (!ok) return { error: "E-mail ou senha incorretos." };

  (await cookies()).set(SESSION_COOKIE, await signSession(conta.user_id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/", "layout");
  // Só caminhos internos — "//host" ou URL absoluta virariam open redirect.
  redirect(redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard");
}

/** Sign out and return to login. */
export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
