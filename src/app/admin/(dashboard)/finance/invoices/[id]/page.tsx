import React from "react";
import Link from "next/link";
import { ErrorBanner, PageHeader, buttonClass } from "@/components/admin/ui";
import FinanceSetupCard from "../../FinanceSetupCard";
import InvoiceEditor from "../InvoiceEditor";
import { getInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getInvoice(id);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Invoice"
          action={
            <Link href="/admin/finance/invoices" className={buttonClass("secondary")}>
              All invoices
            </Link>
          }
        />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>{res.error}</ErrorBanner>}
      </div>
    );
  }

  // key: a different invoice is a different form, never a patched one
  return <InvoiceEditor key={id} initial={res.invoice} isNew={false} />;
}
