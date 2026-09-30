"use client";

import React, { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, KeyRound, Pencil, RefreshCw, UserPlus } from "lucide-react";
import { Badge, Button, Card, ErrorBanner, Field, Input, Modal, Select } from "@/components/admin/ui";
import { TEAM_ROLE_TONE } from "@/components/admin/status";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { PASSWORD_MAX, PASSWORD_MIN, ROLE_HELP, TEAM_ROLES, initials, type TeamMember } from "@/lib/team";
import { cn } from "@/lib/utils";
import { createTeamMember, resetTeamMemberPassword, setTeamMemberActive, updateTeamMember } from "./actions";

/** A starting password that is easy to read out and type: no look-alike characters. */
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

function PasswordInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the password is visible to copy by hand */
    }
  };

  return (
    <div className="flex gap-2">
      {/* Shown in clear: the super admin has to pass it on to the person */}
      <Input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        required
        minLength={PASSWORD_MIN}
        maxLength={PASSWORD_MAX}
        className="font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button variant="secondary" onClick={() => onChange(generatePassword())} className="shrink-0 px-3" aria-label="Generate a password">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="secondary" onClick={copy} disabled={!value} className="shrink-0 px-3" aria-label="Copy the password">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

type Dialog =
  | { kind: "add" }
  | { kind: "edit"; member: TeamMember }
  | { kind: "password"; member: TeamMember }
  | { kind: "active"; member: TeamMember };

export default function TeamList({
  members,
  me,
  canManage,
  serviceKeyConfigured,
}: {
  members: TeamMember[];
  /** The signed-in person's id */
  me: string;
  canManage: boolean;
  serviceKeyConfigured: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  // Form fields, shared by the dialogs (only one is ever open)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");

  const open = (next: Dialog) => {
    setError(null);
    setNotice(null);
    setFullName(next.kind === "edit" ? next.member.full_name : "");
    setEmail("");
    setPassword(next.kind === "add" || next.kind === "password" ? generatePassword() : "");
    setRole(next.kind === "edit" ? next.member.role : "admin");
    setDialog(next);
  };

  const close = () => {
    setDialog(null);
    setPassword("");
  };

  const run = (action: () => Promise<{ success: true; warning?: string } | { success: false; error: string }>, done: string) => {
    setError(null);
    startBusy(async () => {
      const res = await action();
      if (!res.success) {
        setError(res.error);
        return;
      }
      close();
      setNotice(res.warning ?? done);
      router.refresh();
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialog) return;
    if (dialog.kind === "add") {
      run(() => createTeamMember({ fullName, email, password, role }), `${fullName.trim()} can now sign in. Pass the password on to them — they can change it from the sidebar.`);
    } else if (dialog.kind === "edit") {
      const self = dialog.member.id === me;
      run(() => updateTeamMember(dialog.member.id, self ? { fullName } : { fullName, role }), "Saved.");
    } else if (dialog.kind === "password") {
      run(() => resetTeamMemberPassword(dialog.member.id, password), `Password reset for ${dialog.member.full_name}. Pass the new one on to them.`);
    } else {
      const activate = !dialog.member.active;
      run(
        () => setTeamMemberActive(dialog.member.id, activate),
        activate ? `${dialog.member.full_name} can sign in again.` : `${dialog.member.full_name} can no longer sign in or see any data.`
      );
    }
  };

  const id = (name: string) => `${uid}-${name}`;
  const blocked = canManage && !serviceKeyConfigured;

  return (
    <div className="flex flex-col gap-4">
      {!canManage && (
        <Card className="px-5 py-4 text-sm text-stone-600">Only a super admin can add or change people. You can see who is on the team.</Card>
      )}
      {blocked && (
        <ErrorBanner>
          <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> isn&rsquo;t set on the server, so logins can&rsquo;t be
          created, reset or deactivated from here yet. Add it where the site is hosted (Supabase → Project Settings → API).
        </ErrorBanner>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-stone-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          {notice}
        </div>
      )}
      {error && !dialog && <ErrorBanner>{error}</ErrorBanner>}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              {members.length} {members.length === 1 ? "person" : "people"}
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">Admins can do everything except manage this page.</p>
          </div>
          {canManage && (
            <Button onClick={() => open({ kind: "add" })} disabled={blocked}>
              <UserPlus className="h-4 w-4" />
              Add person
            </Button>
          )}
        </div>

        <ul className="divide-y divide-stone-200">
          {members.map((member) => (
            <li key={member.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    member.active ? "border-gold-200 bg-gold-50 text-gold-700" : "border-stone-200 bg-stone-100 text-stone-400"
                  )}
                >
                  {initials(member.full_name)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("truncate text-sm font-medium", member.active ? "text-stone-900" : "text-stone-500")}>{member.full_name}</span>
                    {member.id === me && <span className="text-xs text-stone-400">you</span>}
                    <Badge tone={member.active ? TEAM_ROLE_TONE[member.role] : "muted"}>
                      {member.active ? ADMIN_ROLE_LABELS[member.role] : "Deactivated"}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-stone-500">
                    {member.email} · {member.active ? `added ${formatDate(member.created_at.slice(0, 10))}` : `deactivated ${formatDate(member.deactivated_at?.slice(0, 10))}`}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => open({ kind: "edit", member })}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  {member.id !== me && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => open({ kind: "password", member })} disabled={blocked || !member.active}>
                        <KeyRound className="h-3.5 w-3.5" />
                        Reset password
                      </Button>
                      <Button variant={member.active ? "danger" : "secondary"} size="sm" onClick={() => open({ kind: "active", member })} disabled={blocked}>
                        {member.active ? "Deactivate" : "Reactivate"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {dialog?.kind === "add" && (
        <Modal title="Add a person" description="Creates a login for them. You choose the starting password and pass it on." onClose={close} className="max-w-lg">
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <Field label="Full name" htmlFor={id("name")}>
              <Input id={id("name")} required maxLength={80} autoComplete="off" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email — what they sign in with" htmlFor={id("email")}>
              <Input id={id("email")} type="email" required maxLength={254} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label={`Starting password (${PASSWORD_MIN} characters or more)`} htmlFor={id("password")}>
              <PasswordInput id={id("password")} value={password} onChange={setPassword} />
            </Field>
            <Field label="Role" htmlFor={id("role")}>
              <Select id={id("role")} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                {TEAM_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ADMIN_ROLE_LABELS[r]} — {ROLE_HELP[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create login"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "edit" && (
        <Modal title={`Edit ${dialog.member.full_name}`} description={dialog.member.email} onClose={close} className="max-w-lg">
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <Field label="Full name" htmlFor={id("edit-name")}>
              <Input id={id("edit-name")} required maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            {dialog.member.id === me ? (
              <p className="text-xs text-stone-500">You can&rsquo;t change your own role — another super admin has to.</p>
            ) : (
              <Field label="Role" htmlFor={id("edit-role")}>
                <Select id={id("edit-role")} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                  {TEAM_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ADMIN_ROLE_LABELS[r]} — {ROLE_HELP[r]}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "password" && (
        <Modal
          title={`Reset ${dialog.member.full_name}'s password`}
          description="Their old password stops working straight away."
          onClose={close}
          className="max-w-lg"
        >
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <Field label={`New password (${PASSWORD_MIN} characters or more)`} htmlFor={id("reset")}>
              <PasswordInput id={id("reset")} value={password} onChange={setPassword} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Resetting…" : "Reset password"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog?.kind === "active" && (
        <Modal
          title={dialog.member.active ? `Deactivate ${dialog.member.full_name}?` : `Reactivate ${dialog.member.full_name}?`}
          description={
            dialog.member.active
              ? "They won't be able to sign in or see any data. Their to-dos and records stay, and you can reactivate them later."
              : "They'll be able to sign in again with their existing password."
          }
          onClose={close}
          className="max-w-md"
        >
          <form onSubmit={submit} className="flex flex-col gap-4">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant={dialog.member.active ? "danger" : "primary"} disabled={busy}>
                {busy ? "Working…" : dialog.member.active ? "Deactivate" : "Reactivate"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
