"use client";

import { useState, useTransition } from "react";
import { login } from "@/app/actions/auth";

/**
 * Tela de entrada. A marca vive só na barra do topo — repeti-la dentro do
 * cartão duplicava o mesmo lockup a poucos centímetros de distância. Não há
 * autocadastro: contas são criadas por uma administradora na aba Usuários.
 */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="glass w-full max-w-sm rounded-[28px] bg-gradient-to-br from-brand-lilac/20 to-transparent p-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-ink-soft">Acesse o painel de metas e comissões.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-soft">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-pastel-serenity focus:shadow-[0_0_0_3px_rgba(212,184,240,0.25)] dark:border-white/15 dark:bg-white/5"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-soft">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-pastel-serenity focus:shadow-[0_0_0_3px_rgba(212,184,240,0.25)] dark:border-white/15 dark:bg-white/5"
          />
        </div>

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-white/70 py-3 text-sm font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glow-rose disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, rgba(248,180,196,0.7), rgba(212,184,240,0.7))" }}
        >
          {pending ? "Aguarde…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
