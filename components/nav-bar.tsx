import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

/** Top navigation. Shows nav links + user only when authenticated. */
export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="glass flex h-[var(--nav-h)] items-center border-x-0 border-t-0 px-6">
      <div className="flex w-full items-center gap-6">
        <Link href={user ? "/dashboard" : "/login"} className="text-sm font-extrabold tracking-tight text-ink">
          SR Consultoria <span aria-hidden>💡</span>
        </Link>

        {user && (
          <>
            <div className="flex gap-1 text-sm">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 font-medium text-ink-soft transition-colors hover:bg-white/50 hover:text-ink dark:hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                href="/importar"
                className="rounded-lg px-3 py-1.5 font-medium text-ink-soft transition-colors hover:bg-white/50 hover:text-ink dark:hover:bg-white/10"
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
