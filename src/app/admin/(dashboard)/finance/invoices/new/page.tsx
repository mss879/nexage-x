import React from "react";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import { listClientOptions } from "../../../clients/actions";
import FinanceSetupCard from "../../FinanceSetupCard";
import InvoiceEditor from "../InvoiceEditor";
import { getNewInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  /** ?from=<invoice id> duplicates an invoice; ?client=<client id> starts one for a saved client */
  searchParams: Promise<{ from?: string; client?: string }>;
}) {
  const { from, client } = await searchParams;
  const [res, options] = await Promise.all([getNewInvoice(from, client), listClientOptions()]);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Create invoice" />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>Couldn&rsquo;t start a new invoice: {res.error}</ErrorBanner>}
      </div>
    );
  }

  // key: duplicating or switching client starts a different form, never a patched one
  return <InvoiceEditor key={`${from ?? ""}:${client ?? ""}`} initial={res.invoice} isNew clients={options.clients} projects={options.projects} clientsReady={options.ready} />;
}
