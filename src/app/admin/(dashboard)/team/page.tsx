import React from "react";
import SetupCard, { MIGRATIONS } from "@/components/admin/SetupCard";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import TeamList from "./TeamList";
import { listTeam } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const res = await listTeam();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Team" description="The people who can sign in to this admin, and what each of them can do." />

      {res.success ? (
        <TeamList members={res.members} me={res.me} canManage={res.canManage} serviceKeyConfigured={res.serviceKeyConfigured} />
      ) : res.missingTable ? (
        <SetupCard title="One step left: create the team table" file={MIGRATIONS.team}>
          You become the super admin, and can then add the other directors from this page. Until then the admin keeps
          working exactly as before.
        </SetupCard>
      ) : (
        <ErrorBanner>Couldn&rsquo;t load the team: {res.error}</ErrorBanner>
      )}
    </div>
  );
}
