"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ReceiptText, Search } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, ErrorBanner, Input } from "@/components/admin/ui";
import { INVOICE_STATUS_TONE } from "@/components/admin/status";
import {
  INVOICE_STATUS_LABELS,
  formatInvoiceDate,
  formatMoney,
  isOverdue,
  todayInDubai,
  type InvoiceSummaryRow,
} from "@/lib/invoices";
import { setInvoiceStatus } from "./actions";

const FILTERS = ["all", "draft", "sent", "overdue", "paid", "void"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = { all: "All", ...INVOICE_STATUS_LABELS, sent: "Awaiting payment", overdue: "Overdue" };

/** Overdue is the one state that must not be missed — it gets ink, not a second colour. */
export function InvoiceStatusBadge({ invoice, today }: { invoice: Pick<InvoiceSummaryRow, "status" | "due_date">; today: string }) {
  if (isOverdue(invoice, today)) return <Badge className="border-stone-900 bg-stone-900 text-white">Overdue</Badge>;
  return <Badge tone={INVOICE_STATUS_TONE[invoice.status]}>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>;
}

export default function InvoicesList({ invoices }: { invoices: InvoiceSummaryRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const today = todayInDubai();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: invoices.length, draft: 0, sent: 0, overdue: 0, paid: 0, void: 0 };
    for (const inv of invoices) {
      c[inv.status] += 1;
      if (isOverdue(inv, today)) c.overdue += 1;
    }
    return c;
  }, [invoices, today]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (filter === "overdue" ? !isOverdue(inv, today) : filter !== "all" && inv.status !== filter) return false;
      return !q || inv.number.toLowerCase().includes(q) || inv.client_name.toLowerCase().includes(q);
    });
  }, [invoices, filter, query, today]);

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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500">
                  <th scope="col" className="px-5 py-3 font-medium">Invoice</th>
                  <th scope="col" className="px-3 py-3 font-medium">Client</th>
                  <th scope="col" className="px-3 py-3 font-medium">Issued</th>
                  <th scope="col" className="px-3 py-3 font-medium">Due</th>
                  <th scope="col" className="px-3 py-3 font-medium">Status</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {visible.map((inv) => (
                  <tr key={inv.id} className="transition-colors duration-150 hover:bg-stone-50">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/finance/invoices/${inv.id}`}
                        className="rounded font-mono text-[13px] font-medium text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-3.5 text-stone-700">{inv.client_name || <span className="text-stone-400">No client yet</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-stone-600">{formatInvoiceDate(inv.issue_date)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-stone-600">{formatInvoiceDate(inv.due_date)}</td>
                    <td className="px-3 py-3.5">
                      <InvoiceStatusBadge invoice={inv} today={today} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium tabular-nums text-stone-900">
                      {formatMoney(inv.total, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {inv.status === "sent" ? (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
