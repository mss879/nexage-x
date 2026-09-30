import React from "react";
import SetupCard, { MIGRATIONS } from "@/components/admin/SetupCard";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import { todayInDubai } from "@/lib/dates";
import LedgerView from "./LedgerView";
import { getLedger } from "./actions";

export const dynamic = "force-dynamic";

const code = (file: string) => <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">{file}</code>;

export default async function LedgerPage() {
  const res = await getLedger();

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Expenses & income" description="Everything that came in and went out, and what the company holds right now." />
        {res.missingTable ? (
          <SetupCard title="One step left: create the expenses and income table" file={MIGRATIONS.ledger}>
            It is the last of the five new files — run {code(MIGRATIONS.team)}, {code(MIGRATIONS.clients)}, {code(MIGRATIONS.todos)} and{" "}
            {code(MIGRATIONS.payments)} before it, in that order.
          </SetupCard>
        ) : (
          <ErrorBanner>Couldn&rsquo;t load the ledger: {res.error}</ErrorBanner>
        )}
      </div>
    );
  }

  return (
    <LedgerView
      entries={res.entries}
      payments={res.payments}
      liquidity={res.liquidity}
      team={res.team}
      clients={res.clients}
      projects={res.projects}
      today={todayInDubai()}
    />
  );
}
