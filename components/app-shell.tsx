import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { TopNav } from "@/components/top-nav";
import { getRole } from "@/lib/supabase/perfil";

/**
 * Casca visual do app: uma única barra no topo com a marca à esquerda, a
 * navegação em pílulas ao centro e a conta à direita — a sidebar de ícones
 * saiu de cena e devolveu a largura inteira ao conteúdo. Sem sessão sobra
 * só a marca, para login/cadastro.
 *
 * Em telas estreitas a navegação desce para uma segunda linha, para não
 * espremer a marca nem os controles de conta.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="topbar flex h-[var(--nav-h)] flex-shrink-0 items-center justify-center px-6">
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
    <div className="flex min-h-dvh flex-col">
      <header className="topbar sticky top-0 z-40 flex-shrink-0">
        <div className="flex h-[var(--nav-h)] items-center gap-3 px-4 sm:px-6">
          {/* Zonas laterais flexíveis de mesmo peso: as pílulas ficam no
              centro real da barra, independentemente da largura da marca. */}
          <div className="flex min-w-0 flex-1 items-center">
            <Link href="/dashboard" className="min-w-0" aria-label="Ir para o painel">
              <BrandMark />
            </Link>
          </div>

          <div className="hidden flex-shrink-0 md:flex">
            <TopNav role={role} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-sky to-brand-lilac font-display text-sm font-semibold text-onPastel ring-1 ring-white/50 dark:ring-white/10"
              title={user.email ?? undefined}
            >
              {initial}
            </span>
            <LogoutButton compact />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex justify-center px-3 pb-2 md:hidden">
          <TopNav role={role} />
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
