import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRole, isAdmin } from "@/lib/supabase/perfil";

// Routes that don't require authentication.
const PUBLIC_PATHS = ["/login", "/auth"];

// Routes visible only to the 'admin' role — a 'usuario_padrao' bounces to /dashboard.
const ADMIN_ONLY_PATHS = ["/importar", "/usuarios"];

// Failsafe: nunca deixa o middleware travar esperando a Supabase — evita o
// 504 MIDDLEWARE_INVOCATION_TIMEOUT da Vercel quando o projeto Supabase
// está pausado, lento ou com env vars erradas. Bem abaixo do limite de
// execução do Edge Middleware da Vercel.
const SUPABASE_CALL_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("supabase_timeout")), ms),
    ),
  ]);
}

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

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // IMPORTANT: getUser() revalidates the token with Supabase (getSession alone
  // trusts the cookie). Do not run other Supabase-touching code before this.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await withTimeout(supabase.auth.getUser(), SUPABASE_CALL_TIMEOUT_MS);
    user = fetchedUser;
  } catch (err) {
    // Supabase indisponível ou lenta demais: falha em modo seguro (trata
    // como deslogado) em vez de deixar a Vercel derrubar a rota com 504.
    console.error("[middleware] auth.getUser() falhou ou expirou:", err);
    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      url.searchParams.set("erro", "sessao_indisponivel");
      return NextResponse.redirect(url);
    }
    return response;
  }

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
    try {
      const role = await withTimeout(getRole(supabase, user.id), SUPABASE_CALL_TIMEOUT_MS);
      if (!isAdmin(role)) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    } catch (err) {
      console.error("[middleware] getRole() falhou ou expirou:", err);
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
