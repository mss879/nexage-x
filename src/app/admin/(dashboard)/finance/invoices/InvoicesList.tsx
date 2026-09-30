"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Check, Plus, ReceiptText, Search } from "lucide-react";
import { Button, Card, Chip, EmptyState, ErrorBanner, Input, ProgressBar, buttonClass } from "@/components/admin/ui";
import InvoiceStatusBadge from "@/components/admin/invoice/InvoiceStatusBadge";
import {
  INVOICE_STATUS_LABELS,
  formatInvoiceDate,
  formatMoney,
  invoiceBalance,
  isOverdue,
  isPartPaid,
  todayInDubai,
  type InvoiceSummaryRow,
} from "@/lib/invoices";
import RecordPaymentModal from "./RecordPaymentModal";
import { setInvoiceStatus } from "./actions";

const FILTERS = ["all", "draft", "sent", "part", "overdue", "paid", "void"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  ...INVOICE_STATUS_LABELS,
  sent: "Awaiting payment",
  part: "Part paid",
  overdue: "Overdue",
};

const matches = (inv: InvoiceSummaryRow, filter: Filter, today: string) =>
  filter === "all" || (filter === "overdue" ? isOverdue(inv, today) : filter === "part" ? isPartPaid(inv) : inv.status === filter);

export default function InvoicesList({ invoices, paymentsReady }: { invoices: InvoiceSummaryRow[]; paymentsReady: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [paying, setPaying] = useState<InvoiceSummaryRow | null>(null);
  const [, startTransition] = useTransition();
  const today = todayInDubai();

  const counts = useMemo(() => {
    const c = {} as Record<Filter, number>;
    for (const f of FILTERS) c[f] = invoices.filter((inv) => matches(inv, f, today)).length;
    return c;
  }, [invoices, today]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter(
      (inv) => matches(inv, filter, today) && (!q || inv.number.toLowerCase().includes(q) || inv.client_name.toLowerCase().includes(q))
    );
  }, [invoices, filter, query, today]);

  // Before the payments migration an invoice can only be marked paid in one go
  const markPaid = (id: string) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const res = await setInvoiceStatus(id, "paid");
      setPendingId(null);
      if (!res.success) setError(res.error);
      else router.refresh();
    });
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <EmptyState icon={ReceiptText} title="No invoices yet" description="Create your first invoice — your business details are remembered for the next one." />
        <div className="flex justify-center pb-10">
          <Link href="/admin/finance/invoices/new" className={buttonClass("primary")}>
            <Plus className="h-4 w-4" />
            Create invoice
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {FILTERS.filter((f) => f === "all" || counts[f] > 0).map((f) => (
            <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
              {FILTER_LABELS[f]}
              <span className="ml-1.5 tabular-nums text-stone-400">{counts[f]}</span>
            </Chip>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            type="search"
            aria-label="Search invoices"
            placeholder="Search number or client"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon={Search} title="Nothing matches" description="Try a different status or search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500">
                  <th scope="col" className="px-5 py-3 font-medium">Invoice</th>
                  <th scope="col" className="px-3 py-3 font-medium">Client</th>
                  <th scope="col" className="px-3 py-3 font-medium">Issued</th>
                  <th scope="col" className="px-3 py-3 font-medium">Due</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="w-[190px] px-3 py-3 font-medium">Paid</th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {visible.map((inv) => {
                  const counted = inv.status === "sent" || inv.status === "paid";
                  const balance = invoiceBalance(inv);
                  return (
                    <tr key={inv.id} className="transition-colors duration-150 hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/finance/invoices/${inv.id}`}
                          className="rounded font-mono text-[13px] font-medium text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-3.5 text-stone-700">
                        {inv.client_id ? (
                          <Link
                            href={`/admin/clients/${inv.client_id}`}
                            className="rounded underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                          >
                            {inv.client_name || "Client"}
                          </Link>
                        ) : (
                          inv.client_name || <span className="text-stone-400">No client yet</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-stone-600">{formatInvoiceDate(inv.issue_date)}</td>
                      <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-stone-600">{formatInvoiceDate(inv.due_date)}</td>
                      <td className="px-3 py-3.5">
                        <InvoiceStatusBadge invoice={inv} today={today} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium tabular-nums text-stone-900">
                        {formatMoney(inv.total, inv.currency)}
                      </td>
                      <td className="px-3 py-3.5">
                        {counted ? (
                          <div className="flex flex-col gap-1.5">
                            <ProgressBar value={inv.amount_paid} max={inv.total} label={`Paid on invoice ${inv.number}`} />
                            <span className="whitespace-nowrap text-xs tabular-nums text-stone-500">
                              {balance <= 0 ? "Paid in full" : inv.amount_paid > 0 ? `${formatMoney(balance, inv.currency)} left` : "Nothing paid yet"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        {inv.status === "sent" && paymentsReady ? (
                          <Button variant="secondary" size="sm" onClick={() => setPaying(inv)}>
                            <Banknote className="h-3.5 w-3.5" />
                            Record payment
                          </Button>
                        ) : inv.status === "sent" ? (
                          <Button variant="secondary" size="sm" onClick={() => markPaid(inv.id)} disabled={pendingId === inv.id}>
                            <Check className="h-3.5 w-3.5" />
                            {pendingId === inv.id ? "Saving…" : "Mark paid"}
                          </Button>
                        ) : (
                          <Link
                            href={`/admin/finance/invoices/${inv.id}`}
                            className="rounded text-xs font-medium text-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                          >
                            Open
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {paying && (
        <RecordPaymentModal
          key={paying.id}
          invoice={{
            id: paying.id,
            number: paying.number,
            clientName: paying.client_name,
            currency: paying.currency,
            total: paying.total,
            amountPaid: paying.amount_paid,
          }}
          onClose={() => setPaying(null)}
          onRecorded={() => {
            setPaying(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
