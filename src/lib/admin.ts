import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Who may use /admin — shared by the proxy, the login action, the dashboard
 * layout and every server action.
 *
 * The answer comes from the database: public.current_admin() returns the
 * caller's team_members row (name + role) when they are an active member, and
 * nothing otherwise. People are added and removed on the Team page, so no
 * deploy or env change is needed.
 *
 * Before the team migration has been run that function doesn't exist, and the
 * check falls back to the ADMIN_EMAILS env var exactly as it worked before.
 * Row Level Security (is_admin()) remains the authoritative gate on the data
 * either way.
 */
export type AdminRole = "super_admin" | "admin";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
};

export interface AdminIdentity {
  id: string;
  email: string;
  /** "" in legacy mode — there is no name on record yet */
  fullName: string;
  role: AdminRole;
  /** True while the team migration hasn't been run: access came from ADMIN_EMAILS, not the team table. */
  legacy: boolean;
}

/**
 * ADMIN_EMAILS is a comma-separated list of emails allowed into /admin. Only
 * used until the team migration has been run (or after current_admin() is
 * dropped as a break-glass). When it is unset the check is skipped.
 */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) return true;
  return !!email && allowlist.includes(email.toLowerCase());
}

/** PostgREST / Postgres: "that function doesn't exist". */
const FUNCTION_MISSING = ["PGRST202", "42883"];

/**
 * The signed-in user as an admin, or null when they aren't one. Fails closed:
 * any error other than "the team migration hasn't been run" means no access.
 */
export async function resolveAdmin(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null } | null | undefined
): Promise<AdminIdentity | null> {
  if (!user) return null;

  const { data, error } = await supabase.rpc("current_admin").maybeSingle();

  if (error) {
    if (FUNCTION_MISSING.includes(error.code ?? "")) {
      return isAllowedAdmin(user.email)
        ? { id: user.id, email: user.email ?? "", fullName: "", role: "admin", legacy: true }
        : null;
    }
    console.error("Admin check failed:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as { id: string; email: string; full_name: string; role: string };
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role === "super_admin" ? "super_admin" : "admin",
    legacy: false,
  };
}
