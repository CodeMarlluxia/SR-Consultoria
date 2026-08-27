import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark, LogoMark } from "@/components/brand-mark";
import { SidebarNav } from "@/components/sidebar-nav";
import { getRole } from "@/lib/supabase/perfil";

/**
 * Casca visual do app: sidebar de ícones (navegação + conta, no rodapé) e um
 * topo minimalista com a marca centralizada. Ambos só aparecem para quem
 * está autenticado — sem sessão, sobra um topo mínimo para login/cadastro.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="glass flex h-[var(--nav-h)] flex-shrink-0 items-center justify-center border-x-0 border-t-0 px-6">
          <Link href="/login">
            <BrandMark />
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  const role = await getRole(supabase, user.id);

  return (
    <div className="flex min-h-dvh">
      <aside className="glass hidden w-[var(--sidebar-w)] flex-shrink-0 flex-col items-center gap-6 border-y-0 border-l-0 py-5 sm:flex">
        <Link href="/dashboard" aria-label="Ir para o painel">
          <LogoMark />
        </Link>

        <SidebarNav role={role} />

        {/* Conta: tema, avatar e sair — no rodapé da sidebar. */}
        <div className="mt-auto flex flex-col items-center gap-2 border-t border-ink-faint/10 pt-4">
          <ThemeToggle />
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-lilac font-display text-sm font-semibold text-onPastel"
            title={user.email ?? undefined}
            aria-hidden
          >
            {initial}
          </span>
          <LogoutButton compact />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass relative flex h-[var(--nav-h)] flex-shrink-0 items-center justify-center border-x-0 border-t-0 px-4 sm:px-6">
          <Link href="/dashboard">
            <BrandMark size="lg" />
          </Link>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
