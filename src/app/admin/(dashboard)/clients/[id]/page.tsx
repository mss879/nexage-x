import React from "react";
import Link from "next/link";
import SetupCard, { MIGRATIONS } from "@/components/admin/SetupCard";
import { ErrorBanner, PageHeader, buttonClass } from "@/components/admin/ui";
import { todayInDubai } from "@/lib/dates";
import ClientDetail from "../ClientDetail";
import { getClient360 } from "../actions";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getClient360(id);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Client"
          action={
            <Link href="/admin/clients" className={buttonClass("secondary")}>
              All clients
            </Link>
          }
        />
        {res.missingTable ? (
          <SetupCard title="One step left: create the clients and projects tables" file={MIGRATIONS.clients} />
        ) : (
          <ErrorBanner>{res.error}</ErrorBanner>
        )}
      </div>
    );
  }

  // key: a different client is a different page state (open tab, open modal), never a patched one
  return <ClientDetail key={id} data={res} today={todayInDubai()} />;
}
