import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

/** Navegação principal. Links e usuário só aparecem quando autenticado. */
export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/60 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex h-[var(--nav-h)] w-full items-center gap-6">
        <Link
          href={user ? "/dashboard" : "/login"}
          className="font-display text-base font-semibold tracking-tight text-ink"
        >
          SR Consultoria
          <span aria-hidden className="ml-1">💡</span>
        </Link>

        {user && (
          <>
            <div className="flex gap-1 text-sm">
              <Link
                href="/dashboard"
                className="rounded-pill px-3.5 py-1.5 font-semibold text-ink-soft transition-colors hover:bg-brand-rose/20 hover:text-ink"
              >
                Dashboard
              </Link>
              <Link
                href="/importar"
                className="rounded-pill px-3.5 py-1.5 font-semibold text-ink-soft transition-colors hover:bg-brand-rose/20 hover:text-ink"
              >
                Metas
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-ink-faint sm:inline">{user.email}</span>
              <LogoutButton />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
