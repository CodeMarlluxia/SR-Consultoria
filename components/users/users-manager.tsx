"use client";

import { useState, useTransition } from "react";
import { createUser, deleteUser, updateUser } from "@/app/actions/users";
import { Toast, type ToastData } from "@/components/import/toast";
import {
  IconCheck,
  IconPencil,
  IconTarget,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@/components/icons";
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

const FIELD =
  "w-full rounded-[10px] border-[1.5px] border-white/60 bg-white/60 px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand-lilac dark:border-white/15 dark:bg-white/5";

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
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Usuários</h1>
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
        <input id="email" name="email" type="email" required autoComplete="off" className={FIELD} />
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
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-ink-soft">
          Perfil
        </label>
        <select id="role" name="role" defaultValue="usuario_padrao" className={FIELD}>
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
        <div className="text-right">Ações</div>
      </div>
      {perfis.map((p) => (
        <UserRow key={p.user_id} perfil={p} isSelf={p.user_id === currentUserId} onDone={onDone} />
      ))}
    </div>
  );
}

type RowMode = "view" | "edit" | "confirm-delete";

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
  const [mode, setMode] = useState<RowMode>("view");
  const [error, setError] = useState("");

  // Cópia local do perfil: a action revalida a rota, mas manter o estado
  // aqui evita a linha piscar com o valor antigo enquanto o servidor
  // responde.
  const [email, setEmail] = useState(perfil.email);
  const [role, setRole] = useState<Role>(perfil.role);

  // Rascunho da edição — só é aplicado ao salvar, então Cancelar realmente
  // desfaz tudo.
  const [draftEmail, setDraftEmail] = useState(perfil.email);
  const [draftRole, setDraftRole] = useState<Role>(perfil.role);
  const [draftPassword, setDraftPassword] = useState("");

  function openEdit() {
    setDraftEmail(email);
    setDraftRole(role);
    setDraftPassword("");
    setError("");
    setMode("edit");
  }

  function save() {
    setError("");
    startTransition(async () => {
      const res = await updateUser(perfil.user_id, {
        email: draftEmail,
        password: draftPassword || undefined,
        role: draftRole,
      });
      if (!res.ok) {
        setError(res.error ?? "Não foi possível salvar.");
        return;
      }
      setEmail(draftEmail.trim());
      setRole(draftRole);
      setMode("view");
      onDone({ tone: "success", message: `Conta ${draftEmail.trim()} atualizada.` });
    });
  }

  function remove() {
    setError("");
    startTransition(async () => {
      const res = await deleteUser(perfil.user_id);
      if (!res.ok) {
        setError(res.error ?? "Não foi possível excluir.");
        setMode("view");
        onDone({ tone: "error", message: res.error ?? "Não foi possível excluir." });
        return;
      }
      onDone({ tone: "success", message: `Conta ${email} excluída.` });
    });
  }

  return (
    <div className="border-b border-ink-faint/10 last:border-none">
      <div className="grid grid-cols-[1.6fr_1fr_auto] items-center gap-3 px-4 py-3">
        <div className="min-w-0 truncate text-sm font-medium text-ink" title={email}>
          {email}
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

        <div className="flex items-center justify-end gap-1.5">
          {mode === "confirm-delete" ? (
            // Confirmação embutida na própria linha: sem window.confirm, que
            // não segue o tema e não dá para navegar por teclado do mesmo jeito.
            <>
              <span className="mr-1 text-xs text-ink-soft">Excluir?</span>
              <IconButton
                label="Confirmar exclusão"
                tone="danger"
                disabled={pending}
                onClick={remove}
                icon={IconCheck}
              />
              <IconButton
                label="Cancelar"
                disabled={pending}
                onClick={() => setMode("view")}
                icon={IconX}
              />
            </>
          ) : (
            <>
              <IconButton
                label={mode === "edit" ? "Fechar edição" : "Editar conta"}
                disabled={pending}
                onClick={() => (mode === "edit" ? setMode("view") : openEdit())}
                icon={mode === "edit" ? IconX : IconPencil}
              />
              <IconButton
                label={isSelf ? "Você não pode excluir a sua própria conta." : "Excluir conta"}
                tone="danger"
                disabled={pending || isSelf}
                onClick={() => setMode("confirm-delete")}
                icon={IconTrash}
              />
            </>
          )}
        </div>
      </div>

      {mode === "edit" && (
        <div className="grid grid-cols-1 gap-3 border-t border-ink-faint/10 bg-white/30 px-4 py-4 dark:bg-white/[0.03] sm:grid-cols-[1.3fr_1fr_0.9fr_auto] sm:items-end">
          <div>
            <label
              htmlFor={`email-${perfil.user_id}`}
              className="mb-1.5 block text-xs font-medium text-ink-soft"
            >
              E-mail
            </label>
            <input
              id={`email-${perfil.user_id}`}
              type="email"
              value={draftEmail}
              onChange={(e) => setDraftEmail(e.target.value)}
              autoComplete="off"
              className={FIELD}
            />
          </div>

          <div>
            <label
              htmlFor={`senha-${perfil.user_id}`}
              className="mb-1.5 block text-xs font-medium text-ink-soft"
            >
              Nova senha
            </label>
            <input
              id={`senha-${perfil.user_id}`}
              type="text"
              value={draftPassword}
              onChange={(e) => setDraftPassword(e.target.value)}
              placeholder="deixe vazio p/ manter"
              autoComplete="off"
              className={FIELD}
            />
          </div>

          <div>
            <label
              htmlFor={`perfil-${perfil.user_id}`}
              className="mb-1.5 block text-xs font-medium text-ink-soft"
            >
              Perfil
            </label>
            <select
              id={`perfil-${perfil.user_id}`}
              value={draftRole}
              disabled={isSelf}
              title={isSelf ? "Você não pode alterar o seu próprio perfil." : undefined}
              onChange={(e) => setDraftRole(e.target.value as Role)}
              className={`${FIELD} disabled:opacity-60`}
            >
              <option value="usuario_padrao">Usuário padrão</option>
              <option value="admin">Administradora</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-4 py-2.5 text-sm font-bold text-ink shadow-glass transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgba(248,180,196,0.7), rgba(212,184,240,0.7))" }}
            >
              <IconCheck className="h-4 w-4" />
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={pending}
              className="rounded-xl border border-ink-faint/25 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-60 dark:border-white/15"
            >
              Cancelar
            </button>
          </div>

          {error && <p className="text-sm text-accent-rose sm:col-span-4">{error}</p>}
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  tone = "neutral",
}: {
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-ink-faint/25 bg-white/60 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-white/5 ${
        tone === "danger"
          ? "text-ink-soft hover:border-accent-rose/60 hover:text-accent-rose"
          : "text-ink-soft hover:border-brand-lilac hover:text-accent-lavender"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
