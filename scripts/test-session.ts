/**
 * Auto-teste do cookie de sessão:   node scripts/test-session.ts
 * (Node 22.6+ roda TypeScript direto.)
 */
import assert from "node:assert/strict";
import { signSession, verifySession } from "../lib/auth/session.ts";

process.env.AUTH_SECRET = "segredo-de-teste";
const token = await signSession("user-1");

assert.equal(await verifySession(token), "user-1");
assert.equal(await verifySession(undefined), null);
assert.equal(await verifySession("lixo"), null);

// Payload adulterado (outro usuário) com a assinatura original → recusado.
const [, sig] = token.split(".");
const forged = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + 1e9 })).toString("base64url");
assert.equal(await verifySession(`${forged}.${sig}`), null);

// Outro segredo → recusado.
process.env.AUTH_SECRET = "outro-segredo";
assert.equal(await verifySession(token), null);

console.log("sessão: ok");
