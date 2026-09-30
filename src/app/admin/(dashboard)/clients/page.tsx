import React from "react";
import SetupCard, { MIGRATIONS } from "@/components/admin/SetupCard";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import ClientsList from "./ClientsList";
import { listClients } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const res = await listClients();

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Clients" description="Everyone you work for — their details, projects and invoices in one place." />
        {res.missingTable ? (
          <SetupCard title="One step left: create the clients and projects tables" file={MIGRATIONS.clients} />
        ) : (
          <ErrorBanner>Couldn&rsquo;t load clients: {res.error}</ErrorBanner>
        )}
      </div>
    );
  }

  return <ClientsList clients={res.clients} />;
}
