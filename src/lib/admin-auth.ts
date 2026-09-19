import { createClient } from "@/lib/supabase/server";
import { isAllowedAdmin } from "@/lib/admin";

/**
 * Server-side guard for admin-only server actions: returns the cookie-bound
 * Supabase client for an authenticated, allow-listed admin, or throws.
 * Database access is additionally enforced by the is_admin() RLS policies.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user || !isAllowedAdmin(user.email)) {
    throw new Error("Unauthorized access");
  }
  return supabase;
}
