import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role — bypassea RLS. Server-only, nunca exponer al
 * cliente. Se usa solo en endpoints sin sesión de usuario (ej. el webhook
 * de Shortcuts), donde hay que filtrar por user_id a mano.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
