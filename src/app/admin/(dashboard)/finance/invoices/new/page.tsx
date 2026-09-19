import React from "react";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";
import FinanceSetupCard from "../../FinanceSetupCard";
import InvoiceEditor from "../InvoiceEditor";
import { getNewInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const res = await getNewInvoice(from);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="New invoice" />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>Couldn&rsquo;t start a new invoice: {res.error}</ErrorBanner>}
      </div>
    );
  }

  return <InvoiceEditor initial={res.invoice} isNew />;
}
