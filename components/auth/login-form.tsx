"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand-mark";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const action = mode === "login" ? login : signup;
      const res = await action(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="glass w-full max-w-sm rounded-[28px] bg-gradient-to-br from-brand-lilac/20 to-transparent p-8">
      <div className="mb-6">
        <div className="mb-4">
          <BrandMark />
        </div>
        <h1 className="font-display text-2xl font-bold italic tracking-tight text-ink">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {mode === "login"
            ? "Acesse o painel de metas e comissões."
            : "Cadastre-se para gerenciar as metas."}
        </p>
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
            className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 dark:border-white/15 dark:bg-white/5 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-pastel-serenity focus:shadow-[0_0_0_3px_rgba(212,184,240,0.25)]"
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 dark:border-white/15 dark:bg-white/5 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-pastel-serenity focus:shadow-[0_0_0_3px_rgba(212,184,240,0.25)]"
          />
        </div>

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-white/70 py-3 text-sm font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glow-rose disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, rgba(248,180,196,0.7), rgba(212,184,240,0.7))" }}
        >
          {pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="font-semibold text-accent-lavender transition-colors hover:text-ink"
        >
          {mode === "login" ? "Criar uma" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
