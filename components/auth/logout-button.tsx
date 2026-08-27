"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { IconLogout } from "@/components/icons";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  if (compact) {
    return (
      <button
        onClick={() => startTransition(() => logout())}
        disabled={pending}
        aria-label={pending ? "Saindo…" : "Sair"}
        title="Sair"
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-faint transition-all hover:bg-white/50 hover:text-accent-rose disabled:opacity-60 dark:hover:bg-white/10"
      >
        <IconLogout className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-white/50 hover:text-ink disabled:opacity-60"
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
