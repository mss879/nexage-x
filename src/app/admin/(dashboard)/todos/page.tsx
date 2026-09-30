import React from "react";
import SetupCard, { MIGRATIONS } from "@/components/admin/SetupCard";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import { isIsoDate, todayInDubai } from "@/lib/dates";
import { isUuid } from "@/lib/sanitize";
import TodosBoard from "./TodosBoard";
import { getTodoBoard } from "./actions";

export const dynamic = "force-dynamic";

export default async function TodosPage({
  searchParams,
}: {
  /** ?open=<id> opens a to-do; ?new=1&due=YYYY-MM-DD starts one (both used by the dashboard calendar) */
  searchParams: Promise<{ open?: string; new?: string; due?: string }>;
}) {
  const params = await searchParams;
  const res = await getTodoBoard();

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="To-dos" description="Tasks for the team, with who is doing them and when they're due." />
        {res.missingTable ? (
          <SetupCard title="One step left: create the to-dos table" file={MIGRATIONS.todos}>
            It needs the team and clients migrations first — run{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">{MIGRATIONS.team}</code> and{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">{MIGRATIONS.clients}</code> before it.
          </SetupCard>
        ) : (
          <ErrorBanner>Couldn&rsquo;t load to-dos: {res.error}</ErrorBanner>
        )}
      </div>
    );
  }

  return (
    <TodosBoard
      todos={res.todos}
      team={res.team}
      clients={res.clients}
      projects={res.projects}
      me={res.me}
      today={todayInDubai()}
      openId={isUuid(params.open) ? params.open : undefined}
      startNew={params.new === "1"}
      newDue={isIsoDate(params.due) ? params.due : undefined}
    />
  );
}
