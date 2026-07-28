/**
 * Admin allowlist shared by the proxy, server actions, and admin layouts.
 *
 * ADMIN_EMAILS is a comma-separated list of emails allowed into /admin.
 * When it is unset the check is skipped (so existing deploys keep working),
 * but it MUST be set in production — otherwise any Supabase user that can
 * sign in passes the app-level check. The database migration
 * (admin_emails table + is_admin() RLS) is the authoritative enforcement.
 */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) return true;
  return !!email && allowlist.includes(email.toLowerCase());
}
