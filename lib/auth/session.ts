/**
 * Sessão sem estado: cookie `payload.assinatura`, assinado com HMAC-SHA256
 * usando AUTH_SECRET. Só usa Web Crypto, então roda tanto no Edge
 * (middleware) quanto no Node (server actions).
 */
export const SESSION_COOKIE = "sr_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias, em segundos

const enc = new TextEncoder();

function key(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Configure a variável AUTH_SECRET no ambiente.");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

export async function signSession(userId: string): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ sub: userId, exp: Date.now() + SESSION_MAX_AGE * 1000 })));
  const sig = await crypto.subtle.sign("HMAC", await key(), enc.encode(payload));
  return `${payload}.${b64url(new Uint8Array(sig))}`;
}

/** Id do usuário se o token for autêntico e não expirado; senão `null`. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  const [payload, sig] = token?.split(".") ?? [];
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const { sub, exp } = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof sub === "string" && typeof exp === "number" && exp > Date.now() ? sub : null;
  } catch {
    return null;
  }
}
