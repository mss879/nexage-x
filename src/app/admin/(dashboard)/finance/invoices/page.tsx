import React from "react";
import { Banknote, CalendarDays, Clock, ReceiptText } from "lucide-react";
import { ErrorBanner, PageHeader, StatCard } from "@/components/admin/ui";
import { MoneyStack } from "@/components/admin/money";
import { monthName } from "@/lib/dates";
import { sumByCurrency } from "@/lib/finance";
import { invoiceBalance, isOverdue, todayInDubai } from "@/lib/invoices";
import FinanceSetupCard from "../FinanceSetupCard";
import InvoicesList from "./InvoicesList";
import { listInvoices, listPaymentFlows } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const today = todayInDubai();
  const month = today.slice(0, 7);
  const [res, flows] = await Promise.all([listInvoices(), listPaymentFlows(`${month}-01`)]);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Past invoices" />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>Couldn&rsquo;t load invoices: {res.error}</ErrorBanner>}
      </div>
    );
  }

  const thisMonth = monthName(month, { month: "long" });

  // Drafts aren't real yet and void invoices are cancelled — neither counts as money
  const issued = res.invoices.filter((inv) => inv.status === "sent" || inv.status === "paid");
  const issuedThisMonth = issued.filter((inv) => inv.issue_date.startsWith(month));
  const unpaid = issued.filter((inv) => inv.status === "sent");
  const overdue = unpaid.filter((inv) => isOverdue(inv, today));

  const totalValue = sumByCurrency(issued, (inv) => inv.currency, (inv) => inv.total);
  const invoicedThisMonth = sumByCurrency(issuedThisMonth, (inv) => inv.currency, (inv) => inv.total);
  const toCollect = sumByCurrency(unpaid, (inv) => inv.currency, invoiceBalance);
  // Money that actually arrived this month: payments when they're tracked, otherwise invoices marked paid
  const collectedThisMonth = flows
    ? sumByCurrency(flows, (flow) => flow.currency, (flow) => flow.amount)
    : sumByCurrency(issued.filter((inv) => inv.status === "paid" && inv.paid_at?.startsWith(month)), (inv) => inv.currency, (inv) => inv.total);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Past invoices"
        description="Every invoice you've made. Open one to edit it, record what the customer has paid, or print it."
      />

      {res.invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total invoice value"
            value={<MoneyStack lines={totalValue} />}
            icon={ReceiptText}
            hint={`${issued.length} invoice${issued.length === 1 ? "" : "s"} sent, all time`}
          />
          <StatCard
            label={`Invoiced in ${thisMonth}`}
            value={<MoneyStack lines={invoicedThisMonth} />}
            icon={CalendarDays}
            hint={`${issuedThisMonth.length} invoice${issuedThisMonth.length === 1 ? "" : "s"} this month`}
          />
          <StatCard label={`Collected in ${thisMonth}`} value={<MoneyStack lines={collectedThisMonth} />} icon={Banknote} hint="Payments received this month" />
          <StatCard
            label="Still to collect"
            value={<MoneyStack lines={toCollect} />}
            icon={Clock}
            emphasis
            hint={
              unpaid.length === 0
                ? "Everything is paid"
                : `${unpaid.length} unpaid${overdue.length > 0 ? ` · ${overdue.length} overdue` : ""}`
            }
          />
        </div>
      )}

      {!res.paymentsReady && res.invoices.length > 0 && (
        <p className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600">
          Part payments aren&rsquo;t switched on yet — run{" "}
          <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800">supabase/migrations/20260930130000_invoice_payments.sql</code>{" "}
          in Supabase to record how much of each invoice has been paid.
        </p>
      )}

      <InvoicesList invoices={res.invoices} paymentsReady={res.paymentsReady} />
    </div>
  );
}
