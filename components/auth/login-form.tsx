"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions/auth";

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
    <div className="card card-thread w-full max-w-sm overflow-hidden px-8 pb-8 pt-9">
      <p className="eyebrow">
        SR Consultoria
        <span aria-hidden className="ml-1">💡</span>
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {mode === "login"
          ? "Acompanhe metas, comissões e premiações."
          : "Cadastre-se para gerenciar as metas da equipe."}
      </p>

      <form action={handleSubmit} className="mt-7 space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-soft">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field w-full px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-soft">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="field w-full px-3.5 py-2.5 text-sm"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-deep-rose">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-brand-rose to-brand-lilac py-3 text-sm font-bold text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-60"
        >
          {pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
          className="font-semibold text-deep-lilac underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {mode === "login" ? "Criar uma" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
