"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
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
