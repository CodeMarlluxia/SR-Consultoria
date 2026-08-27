import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { SidebarNav } from "@/components/sidebar-nav";

/**
 * Casca visual do app: sidebar de ícones + topo com a marca e a conta,
 * ambos só aparecem para quem está autenticado. Sem sessão, sobra um topo
 * mínimo (só a marca) para as telas de login/cadastro.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="glass flex h-[var(--nav-h)] flex-shrink-0 items-center border-x-0 border-t-0 px-6">
          <Link href="/login">
            <BrandMark />
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-dvh">
      <aside className="glass hidden w-[var(--sidebar-w)] flex-shrink-0 flex-col items-center gap-6 border-y-0 border-l-0 py-5 sm:flex">
        <Link
          href="/dashboard"
          aria-label="Ir para o painel"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base text-onPastel"
          style={{ background: "linear-gradient(135deg, var(--brand-rose), var(--brand-lilac))" }}
        >
          ✿
        </Link>

        <SidebarNav />

        <div className="mt-auto flex flex-col items-center gap-2">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass flex h-[var(--nav-h)] flex-shrink-0 items-center justify-between gap-4 border-x-0 border-t-0 px-4 sm:px-6">
          <Link href="/dashboard" className="min-w-0">
            <BrandMark />
          </Link>

          <div className="flex flex-shrink-0 items-center gap-3">
            <span className="hidden min-w-0 text-right leading-tight sm:block">
              <span className="block max-w-[220px] truncate text-sm font-semibold text-ink">
                {user.email}
              </span>
              <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Painel administrativo
              </span>
            </span>
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-lilac font-display text-sm font-semibold text-onPastel"
              aria-hidden
            >
              {initial}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
