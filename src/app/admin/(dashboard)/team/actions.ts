"use server";

import { revalidatePath } from "next/cache";
import { makeFail, type Result } from "@/lib/action-result";
import { requireAdminContext, requireSuperAdmin } from "@/lib/admin-auth";
import type { AdminRole } from "@/lib/admin";
import { cleanText, isUuid } from "@/lib/sanitize";
import { createServiceClient } from "@/lib/supabase/admin";
import { TEAM_MEMBER_COLUMNS, passwordProblem, sanitizeNewMember, type TeamMember } from "@/lib/team";

const fail = makeFail({
  missing: "The team table doesn't exist yet.",
  duplicate: "Someone on the team already uses that email.",
});

const NO_SERVICE_KEY =
  "SUPABASE_SERVICE_ROLE_KEY isn't set on the server, so logins can't be created or changed from here. Add it where the site is hosted, then try again.";

/** Supabase bans are time-based; this is "until someone lifts it". */
const BAN_FOREVER = "876000h";

const refresh = () => revalidatePath("/admin/team");

export async function listTeam(): Promise<
  Result<{ members: TeamMember[]; me: string; canManage: boolean; serviceKeyConfigured: boolean }>
> {
  try {
    const { supabase, admin } = await requireAdminContext();
    if (admin.legacy) return { success: false, error: "The team table doesn't exist yet.", missingTable: true };

    const { data, error } = await supabase.from("team_members").select(TEAM_MEMBER_COLUMNS).order("created_at", { ascending: true });
    if (error) return fail(error);
    return {
      success: true,
      members: (data ?? []) as TeamMember[],
      me: admin.id,
      canManage: admin.role === "super_admin",
      serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Create a login and put it on the team. Two systems are written — Supabase
 * Auth (service role) and team_members (as the super admin, under RLS) — so if
 * the second step fails the new login is removed again. A login without a team
 * row has no access to anything, so even a failed clean-up is harmless.
 */
export async function createTeamMember(input: unknown): Promise<Result<{ member: TeamMember }>> {
  try {
    const parsed = sanitizeNewMember(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { fullName, email, password, role } = parsed.member;

    const { supabase } = await requireSuperAdmin();
    const service = createServiceClient();
    if (!service) return { success: false, error: NO_SERVICE_KEY };

    const { data: created, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (authError || !created.user) {
      if (authError?.code === "email_exists" || /already (been )?registered/i.test(authError?.message ?? "")) {
        return {
          success: false,
          error:
            "A login with this email already exists in Supabase. If it isn't on this list, delete it under Authentication → Users first, or use a different email.",
        };
      }
      return { success: false, error: authError?.message ?? "Couldn't create the login." };
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({ id: created.user.id, email, full_name: fullName, role })
      .select(TEAM_MEMBER_COLUMNS)
      .single();
    if (error) {
      const { error: cleanupError } = await service.auth.admin.deleteUser(created.user.id);
      const failure = fail(error);
      return cleanupError
        ? { ...failure, error: `${failure.error} A login for ${email} was left behind without access — delete it under Authentication → Users in Supabase.` }
        : failure;
    }

    refresh();
    return { success: true, member: data as TeamMember };
  } catch (error) {
    return fail(error);
  }
}

export async function updateTeamMember(id: string, input: { fullName?: string; role?: AdminRole }): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const patch: Record<string, string> = {};
    if (input?.fullName !== undefined) {
      const fullName = cleanText(input.fullName, 80);
      if (!fullName) return { success: false, error: "Enter the person's name." };
      patch.full_name = fullName;
    }
    if (input?.role !== undefined) patch.role = input.role === "super_admin" ? "super_admin" : "admin";
    if (Object.keys(patch).length === 0) return { success: true };

    const { supabase } = await requireSuperAdmin();
    const { error } = await supabase.from("team_members").update(patch).eq("id", id);
    if (error) return fail(error);
    refresh();
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Deactivate: the database goes first — data access and the app gate are
 * revoked in one transaction (and it refuses to touch yourself or the last
 * super admin). The login is then banned so it can't even sign in; if that
 * part fails the person is still locked out of everything.
 *
 * Reactivate: the ban is lifted first, so a half-done reactivation is still
 * "no access" rather than "access without a working login".
 */
export async function setTeamMemberActive(id: string, active: boolean): Promise<Result<{ warning?: string }>> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const { supabase } = await requireSuperAdmin();
    const service = createServiceClient();
    if (!service) return { success: false, error: NO_SERVICE_KEY };

    if (active) {
      const { error: unbanError } = await service.auth.admin.updateUserById(id, { ban_duration: "none" });
      if (unbanError) return { success: false, error: unbanError.message };
    }

    const { data, error } = await supabase.from("team_members").update({ active }).eq("id", id).select("id").maybeSingle();
    if (error) return fail(error);
    if (!data) return { success: false, error: "That person isn't on the team any more." };

    let warning: string | undefined;
    if (!active) {
      const { error: banError } = await service.auth.admin.updateUserById(id, { ban_duration: BAN_FOREVER });
      if (banError) warning = `Their access has been removed, but the login itself couldn't be blocked (${banError.message}).`;
    }

    refresh();
    return { success: true, warning };
  } catch (error) {
    return fail(error);
  }
}

export async function resetTeamMemberPassword(id: string, password: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const problem = passwordProblem(password);
    if (problem) return { success: false, error: problem };

    const { supabase } = await requireSuperAdmin();
    const service = createServiceClient();
    if (!service) return { success: false, error: NO_SERVICE_KEY };

    // Only logins that are on the team can be touched from here
    const { data: member, error: lookupError } = await supabase.from("team_members").select("id").eq("id", id).maybeSingle();
    if (lookupError) return fail(lookupError);
    if (!member) return { success: false, error: "That person isn't on the team any more." };

    const { error } = await service.auth.admin.updateUserById(id, { password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
