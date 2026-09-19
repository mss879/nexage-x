import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ErrorBanner, PageHeader, buttonClass } from "@/components/admin/ui";
import FinanceSetupCard from "../FinanceSetupCard";
import InvoicesList from "./InvoicesList";
import { listInvoices } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const res = await listInvoices();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Create, track and print invoices. Each one opens in an editor with a live preview."
        action={
          res.success ? (
            <Link href="/admin/finance/invoices/new" className={buttonClass("primary")}>
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          ) : undefined
        }
      />

      {res.success ? (
        <InvoicesList invoices={res.invoices} />
      ) : res.missingTable ? (
        <FinanceSetupCard />
      ) : (
        <ErrorBanner>Couldn&rsquo;t load invoices: {res.error}</ErrorBanner>
      )}
    </div>
  );
}
