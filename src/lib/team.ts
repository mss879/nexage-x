/** Team — the people who can sign in to /admin. Shared types and validation. */
import type { AdminRole } from "@/lib/admin";
import { cleanText, isEmail } from "@/lib/sanitize";

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  deactivated_at: string | null;
}

export const TEAM_MEMBER_COLUMNS = "id, email, full_name, role, active, created_at, deactivated_at";

/** What a picker needs: enough to show and assign a person. */
export interface TeamOption {
  id: string;
  full_name: string;
  active: boolean;
}

export const TEAM_ROLES: AdminRole[] = ["admin", "super_admin"];

export const ROLE_HELP: Record<AdminRole, string> = {
  admin: "Everything except managing the team",
  super_admin: "Everything, including adding and removing people",
};

export const PASSWORD_MIN = 10;
/** bcrypt only reads the first 72 bytes */
export const PASSWORD_MAX = 72;

export const passwordProblem = (password: unknown): string | null => {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters for the password.`;
  if (password.length > PASSWORD_MAX) return `Keep the password under ${PASSWORD_MAX} characters.`;
  return null;
};

export function sanitizeNewMember(input: unknown):
  | { member: { fullName: string; email: string; password: string; role: AdminRole } }
  | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fullName = cleanText(raw.fullName, 80);
  if (!fullName) return { error: "Enter the person's name." };
  const email = cleanText(raw.email, 254).toLowerCase();
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  const problem = passwordProblem(raw.password);
  if (problem) return { error: problem };
  return { member: { fullName, email, password: raw.password as string, role: raw.role === "super_admin" ? "super_admin" : "admin" } };
}

/** "Shahid Shamir" → "SS" — for the small assignee mark on to-dos. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
