"use client";

import { useState, useTransition } from "react";
import { createUser, updateUserRole } from "@/app/actions/users";
import { Toast, type ToastData } from "@/components/import/toast";
import { IconTarget, IconUserPlus, IconUsers } from "@/components/icons";
import type { Role } from "@/lib/supabase/perfil";

export interface PerfilRow {
  user_id: string;
  email: string;
  role: Role;
  criado_em: string;
}

const ROLE_LABEL: Record<Role, string> = {
  admin: "Administradora",
  usuario_padrao: "Usuário padrão",
};

export function UsersManager({
  perfis,
  currentUserId,
}: {
  perfis: PerfilRow[];
  currentUserId: string;
}) {
  const [toast, setToast] = useState<ToastData | null>(null);

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow mb-2 inline-flex items-center gap-1.5">
          <IconUsers className="h-3 w-3" aria-hidden />
          Controle de acesso
        </p>
        <h1 className="font-display text-3xl font-bold italic tracking-tight text-ink">
          Usuários
        </h1>
        <p className="mt-2 text-ink-soft">
          Quem tem perfil <strong className="text-ink">Usuário padrão</strong> só enxerga o Painel — as abas
          administrativas ficam ocultas. Novas contas entram assim por padrão; promova quem precisar de mais acesso.
        </p>
      </header>

      <CreateUserForm onDone={setToast} />

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
          <IconTarget className="h-4 w-4 text-ink-faint" aria-hidden />
          Contas cadastradas
        </h2>
        <UsersTable perfis={perfis} currentUserId={currentUserId} onDone={setToast} />
      </section>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function CreateUserForm({ onDone }: { onDone: (t: ToastData) => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await createUser(formData);
      if (!res.ok) {
        setError(res.error ?? "Não foi possível criar a conta.");
        return;
      }
      onDone({ tone: "success", message: "Conta criada. Compartilhe o e-mail e a senha com a pessoa." });
      (document.getElementById("create-user-form") as HTMLFormElement | null)?.reset();
    });
  }

  return (
    <form
      id="create-user-form"
      action={handleSubmit}
      className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1.3fr_1fr_0.9fr_auto] sm:items-end"
    >
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-soft">
          E-mail da nova conta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand-lilac dark:border-white/15 dark:bg-white/5"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-ink-soft">
          Senha provisória
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={6}
          autoComplete="off"
          placeholder="mín. 6 caracteres"
          className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand-lilac dark:border-white/15 dark:bg-white/5"
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-ink-soft">
          Perfil
        </label>
        <select
          id="role"
          name="role"
          defaultValue="usuario_padrao"
          className="w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand-lilac dark:border-white/15 dark:bg-white/5"
        >
          <option value="usuario_padrao">Usuário padrão</option>
          <option value="admin">Administradora</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-5 py-2.5 text-sm font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 hover:shadow-glow-rose active:translate-y-0 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, rgba(248,180,196,0.7), rgba(212,184,240,0.7))" }}
      >
        <IconUserPlus className="h-4 w-4" />
        {pending ? "Criando…" : "Criar conta"}
      </button>

      {error && <p className="text-sm text-accent-rose sm:col-span-4">{error}</p>}
    </form>
  );
}

function UsersTable({
  perfis,
  currentUserId,
  onDone,
}: {
  perfis: PerfilRow[];
  currentUserId: string;
  onDone: (t: ToastData) => void;
}) {
  if (perfis.length === 0) {
    return <p className="card px-4 py-6 text-center text-sm text-ink-soft">Nenhuma conta encontrada.</p>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1.6fr_1fr_auto] items-center gap-3 border-b border-ink-faint/15 px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        <div>E-mail</div>
        <div>Perfil</div>
        <div className="text-right">Ação</div>
      </div>
      {perfis.map((p) => (
        <UserRow key={p.user_id} perfil={p} isSelf={p.user_id === currentUserId} onDone={onDone} />
      ))}
    </div>
  );
}

function UserRow({
  perfil,
  isSelf,
  onDone,
}: {
  perfil: PerfilRow;
  isSelf: boolean;
  onDone: (t: ToastData) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>(perfil.role);

  function handleChange(next: Role) {
    const prev = role;
    setRole(next);
    startTransition(async () => {
      const res = await updateUserRole(perfil.user_id, next);
      if (!res.ok) {
        setRole(prev);
        onDone({ tone: "error", message: res.error ?? "Não foi possível atualizar o perfil." });
        return;
      }
      onDone({ tone: "success", message: `${perfil.email} agora é ${ROLE_LABEL[next]}.` });
    });
  }

  return (
    <div className="grid grid-cols-[1.6fr_1fr_auto] items-center gap-3 border-b border-ink-faint/10 px-4 py-3 last:border-none">
      <div className="min-w-0 truncate text-sm font-medium text-ink" title={perfil.email}>
        {perfil.email}
        {isSelf && <span className="ml-2 text-xs font-normal text-ink-faint">(você)</span>}
      </div>
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            role === "admin" ? "bg-brand-rose/25 text-accent-rose" : "bg-brand-sky/25 text-accent-serenity"
          }`}
        >
          {ROLE_LABEL[role]}
        </span>
      </div>
      <div className="text-right">
        <select
          value={role}
          disabled={pending || isSelf}
          onChange={(e) => handleChange(e.target.value as Role)}
          title={isSelf ? "Você não pode alterar seu próprio perfil." : "Alterar perfil"}
          className="rounded-lg border border-ink-faint/25 bg-white/60 px-2 py-1.5 text-xs text-ink outline-none transition-colors focus:border-brand-lilac disabled:opacity-50 dark:border-white/15 dark:bg-white/5"
        >
          <option value="usuario_padrao">Usuário padrão</option>
          <option value="admin">Administradora</option>
        </select>
      </div>
    </div>
  );
}
