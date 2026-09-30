import React from "react";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import { listClientOptions } from "../../../clients/actions";
import FinanceSetupCard from "../../FinanceSetupCard";
import InvoiceEditor from "../InvoiceEditor";
import { getInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [res, options] = await Promise.all([getInvoice(id), listClientOptions()]);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Invoice" />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>{res.error}</ErrorBanner>}
      </div>
    );
  }

  // key: a different invoice is a different form, never a patched one
  return (
    <InvoiceEditor
      key={id}
      initial={res.invoice}
      isNew={false}
      clients={options.clients}
      projects={options.projects}
      clientsReady={options.ready}
      payments={res.payments}
      amountPaid={res.amountPaid}
      paymentsReady={res.paymentsReady}
    />
  );
}
