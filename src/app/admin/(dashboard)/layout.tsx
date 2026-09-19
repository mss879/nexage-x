import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdmin } from "@/lib/admin";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard: the proxy already gates /admin, but layouts must not
  // rely on middleware alone — verify the session and allowlist here too.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdmin(user.email)) {
    redirect("/admin/login");
  }

  // Visitors waiting for a person — shown as a badge on "AI chats". Stays 0 if
  // the chat tables haven't been created yet.
  const { count } = await supabase
    .from("chat_conversations")
    .select("id", { count: "exact", head: true })
    .eq("needs_human", true);

  return (
    <DashboardShell email={user.email ?? "Admin"} chatsWaiting={count ?? 0}>
      {children}
    </DashboardShell>
  );
}
