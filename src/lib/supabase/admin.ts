import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY. It bypasses Row Level Security,
 * so it must never be imported from a client component and the key must never
 * be exposed with a NEXT_PUBLIC_ prefix. Used where the server acts for an
 * anonymous visitor after verifying them itself (the AI chat).
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't configured, so callers can
 * degrade gracefully instead of crashing.
 */
let cached: SupabaseClient | null | undefined;

export function createServiceClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() must never run in the browser");
  }
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return cached;
}
