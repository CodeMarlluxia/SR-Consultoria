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
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink-faint/20 bg-white/50 text-ink-soft transition-colors hover:border-brand-rose hover:text-accent-rose disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
      >
        <IconLogout className="h-4 w-4" />
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
