import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRole, isAdmin } from "@/lib/supabase/perfil";

// Routes that don't require authentication.
const PUBLIC_PATHS = ["/login", "/auth"];

// Routes visible only to the 'admin' role — a 'usuario_padrao' bounces to /dashboard.
const ADMIN_ONLY_PATHS = ["/importar", "/usuarios"];

/**
 * Refreshes the Supabase session on every request and redirects
 * unauthenticated users to /login. Called from the root middleware.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase (getSession alone
  // trusts the cookie). Do not run code between createServerClient and this.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in but visiting /login → send to dashboard.
  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 'usuario_padrao' só vê o Painel — abas administrativas redirecionam.
  if (user && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
    const role = await getRole(supabase, user.id);
    if (!isAdmin(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
