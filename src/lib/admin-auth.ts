import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { resolveAdmin, type AdminIdentity } from "@/lib/admin";

export interface AdminContext {
  /** Cookie-bound client: every query runs as this person, under Row Level Security */
  supabase: SupabaseClient;
  admin: AdminIdentity;
}

export type AdminSession = { signedIn: false } | { signedIn: true; supabase: SupabaseClient; admin: AdminIdentity | null };

/**
 * Who is making this request. Memoised per render, so the layout and the page
 * share one lookup.
 */
export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { signedIn: false };
  return { signedIn: true, supabase, admin: await resolveAdmin(supabase, user) };
});

/**
 * Server-side guard for admin-only pages and server actions: the caller must be
 * an active team member, or this throws. Database access is additionally
 * enforced by the is_admin() RLS policies.
 */
export async function requireAdminContext(): Promise<AdminContext> {
  const session = await getAdminSession();
  if (!session.signedIn || !session.admin) throw new Error("Unauthorized access");
  return { supabase: session.supabase, admin: session.admin };
}

/** The same guard, for the many callers that only need the client. */
export async function requireAdmin() {
  return (await requireAdminContext()).supabase;
}

/** Team management only. Not available until the team migration has been run. */
export async function requireSuperAdmin(): Promise<AdminContext> {
  const context = await requireAdminContext();
  if (context.admin.legacy || context.admin.role !== "super_admin") {
    throw new Error("Only a super admin can manage the team.");
  }
  return context;
}
