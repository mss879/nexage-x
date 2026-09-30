import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { todayInDubai } from "@/lib/dates";
import DashboardShell from "./DashboardShell";
import NoAccess from "./NoAccess";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard: the proxy already gates /admin, but layouts must not
  // rely on it alone — verify the session and team membership here too.
  const session = await getAdminSession();
  if (!session.signedIn) redirect("/admin/login");

  // Signed in but not (or no longer) on the team. Never redirect here: the
  // proxy sends signed-in non-admins to the login page, which would loop.
  if (!session.admin) return <NoAccess />;

  const { supabase, admin } = session;

  // Sidebar badges. Both stay 0 while their tables haven't been created yet.
  const [chats, todos] = await Promise.all([
    // Visitors waiting for a person
    supabase.from("chat_conversations").select("id", { count: "exact", head: true }).eq("needs_human", true),
    // My open to-dos that are due today or already late
    supabase
      .from("todos")
      .select("id", { count: "exact", head: true })
      .eq("assignee_id", admin.id)
      .neq("status", "done")
      .lte("due_date", todayInDubai()),
  ]);

  return (
    <DashboardShell
      admin={{ fullName: admin.fullName, email: admin.email, role: admin.role, legacy: admin.legacy }}
      chatsWaiting={chats.count ?? 0}
      todosDue={todos.count ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
