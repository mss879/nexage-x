import React from "react";
import { Card } from "@/components/admin/ui";

/** Shown in place of a feature until its migration has been run in Supabase. */
export default function SetupCard({
  title,
  file,
  children,
}: {
  title: string;
  /** Path of the SQL file to run, relative to the repo root */
  file: string;
  /** Anything worth knowing after "…and run it." */
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        In the Supabase dashboard → SQL Editor, paste the whole of{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">{file}</code> and run it.
        {children && <> {children}</>}
      </p>
    </Card>
  );
}

/** The new admin migrations, in the order they must be run. */
export const MIGRATIONS = {
  team: "supabase/migrations/20260930100000_team_members.sql",
  clients: "supabase/migrations/20260930110000_clients_projects.sql",
  todos: "supabase/migrations/20260930120000_todos.sql",
  payments: "supabase/migrations/20260930130000_invoice_payments.sql",
  ledger: "supabase/migrations/20260930140000_finance_entries.sql",
} as const;
