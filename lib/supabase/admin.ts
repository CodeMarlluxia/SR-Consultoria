import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a Service Role Key — o único que pode mexer no schema `auth`
 * (trocar e-mail/senha de outra conta, excluir a conta de vez). A chave
 * ignora RLS, então este módulo é EXCLUSIVO do servidor: nunca importe em
 * componente de cliente e nunca prefixe a variável com NEXT_PUBLIC_.
 *
 * Retorna `null` quando a variável não está configurada, para que a action
 * consiga responder com um aviso claro em vez de estourar em runtime.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SERVICE_KEY_MISSING =
  "Configure a variável SUPABASE_SERVICE_ROLE_KEY no ambiente (Vercel → Settings → Environment Variables) para editar e-mail/senha e excluir contas.";
