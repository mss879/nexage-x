import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Banknote, Clock, Plus, ReceiptText, Wallet } from "lucide-react";
import { Card, CardHeader, EmptyState, ErrorBanner, PageHeader, StatCard, buttonClass } from "@/components/admin/ui";
import { BarList, MoneyBars, type MoneyPoint } from "@/components/admin/charts";
import InvoiceStatusBadge from "@/components/admin/invoice/InvoiceStatusBadge";
import { lastDayOf, monthName, shiftMonth } from "@/lib/dates";
import { liquidityCards } from "@/lib/finance";
import { formatInvoiceDate, formatMoney, invoiceBalance, isOverdue, todayInDubai, type InvoiceSummaryRow } from "@/lib/invoices";
import { cn } from "@/lib/utils";
import FinanceSetupCard from "./FinanceSetupCard";
import { listInvoices, listPaymentFlows } from "./invoices/actions";
import { getLiquidity } from "./ledger/actions";

export const dynamic = "force-dynamic";

const PERIODS = ["month", "last-month", "year", "12m"] as const;
type Period = (typeof PERIODS)[number];
const PERIOD_LABELS: Record<Period, string> = { month: "This month", "last-month": "Last month", year: "This year", "12m": "12 months" };
/** How the previous, comparable period is named in the KPI hints. */
const PREVIOUS_LABELS: Record<Period, string> = {
  month: "Last month",
  "last-month": "Month before",
  year: "Last year",
  "12m": "Previous 12 months",
};

const sum = (rows: InvoiceSummaryRow[]) => rows.reduce((total, row) => total + row.total, 0);
/** What has actually been received on these invoices */
const sumPaid = (rows: InvoiceSummaryRow[]) => rows.reduce((total, row) => total + row.amount_paid, 0);
/** What is still owed on them */
const sumOwed = (rows: InvoiceSummaryRow[]) => rows.reduce((total, row) => total + invoiceBalance(row), 0);

interface DateWindow {
  /** Inclusive YYYY-MM-DD bounds */
  from: string;
  to: string;
}

/** Calendar windows (Dubai dates): the chosen period and the one it is compared with. */
function windowsFor(period: Period, today: string): { current: DateWindow; previous: DateWindow; title: string } {
  const thisMonth = today.slice(0, 7);
  const year = Number(today.slice(0, 4));
  const wholeMonth = (ym: string): DateWindow => ({ from: `${ym}-01`, to: `${ym}-${String(lastDayOf(ym)).padStart(2, "0")}` });

  switch (period) {
    case "month":
      return { current: wholeMonth(thisMonth), previous: wholeMonth(shiftMonth(thisMonth, -1)), title: monthName(thisMonth, { month: "long", year: "numeric" }) };
    case "last-month": {
      const ym = shiftMonth(thisMonth, -1);
      return { current: wholeMonth(ym), previous: wholeMonth(shiftMonth(ym, -1)), title: monthName(ym, { month: "long", year: "numeric" }) };
    }
    case "year":
      return { current: { from: `${year}-01-01`, to: `${year}-12-31` }, previous: { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }, title: String(year) };
    case "12m":
      return {
        current: { from: `${shiftMonth(thisMonth, -11)}-01`, to: wholeMonth(thisMonth).to },
        previous: { from: `${shiftMonth(thisMonth, -23)}-01`, to: wholeMonth(shiftMonth(thisMonth, -12)).to },
        title: `${monthName(shiftMonth(thisMonth, -11), { month: "short", year: "numeric" })} – ${monthName(thisMonth, { month: "short", year: "numeric" })}`,
      };
  }
}

const within = (date: string | null, w: DateWindow) => Boolean(date) && (date as string) >= w.from && (date as string) <= w.to;

/** Chart buckets: one per day for a month view, one per month for a year view. */
function bucketsFor(period: Period, w: DateWindow): { prefix: string; label: string; longLabel: string }[] {
  if (period === "month" || period === "last-month") {
    const ym = w.from.slice(0, 7);
    return Array.from({ length: lastDayOf(ym) }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return { prefix: `${ym}-${day}`, label: String(i + 1), longLabel: `${i + 1} ${monthName(ym, { month: "long", year: "numeric" })}` };
    });
  }
  const first = w.from.slice(0, 7);
  return Array.from({ length: 12 }, (_, i) => {
    const ym = shiftMonth(first, i);
    return { prefix: ym, label: monthName(ym, { month: "short" }), longLabel: monthName(ym, { month: "long", year: "numeric" }) };
  });
}

export default async function FinanceAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; currency?: string }>;
}) {
  const params = await searchParams;
  const period: Period = (PERIODS as readonly string[]).includes(params.period ?? "") ? (params.period as Period) : "month";
  const today = todayInDubai();
  const { current, previous, title } = windowsFor(period, today);
  // Payments are only needed back to the start of the period this one is compared with
  const [res, flows, liquidity] = await Promise.all([listInvoices(), listPaymentFlows(previous.from), getLiquidity()]);

  if (!res.success) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Finance analytics" description="What you've invoiced, what's been paid and what's still owed." />
        {res.missingTable ? <FinanceSetupCard /> : <ErrorBanner>Couldn&rsquo;t load invoices: {res.error}</ErrorBanner>}
      </div>
    );
  }

  // Void invoices are cancelled and drafts aren't real yet — neither counts as money
  const issued = res.invoices.filter((inv) => inv.status === "sent" || inv.status === "paid");

  // Amounts in different currencies can't be added together, so the page shows one at a time
  const byCurrency = new Map<string, number>();
  for (const inv of issued.length > 0 ? issued : res.invoices) byCurrency.set(inv.currency, (byCurrency.get(inv.currency) ?? 0) + 1);
  const currencies = [...byCurrency.entries()].sort((a, b) => b[1] - a[1]).map(([code]) => code);
  const currency = currencies.includes(params.currency ?? "") ? (params.currency as string) : (currencies[0] ?? "AED");
  const money = (value: number) => formatMoney(value, currency);

  const rows = issued.filter((inv) => inv.currency === currency);
  const paidRows = rows.filter((inv) => inv.status === "paid");

  const invoicedNow = rows.filter((inv) => within(inv.issue_date, current));
  const invoicedBefore = sum(rows.filter((inv) => within(inv.issue_date, previous)));
  const outstanding = rows.filter((inv) => inv.status === "sent");
  const overdue = outstanding.filter((inv) => isOverdue(inv, today));

  // "Collected" is money that arrived. With payment tracking that is each payment on the day it was
  // received (so part payments count); before it, an invoice's whole total on the day it was marked paid.
  const receipts = flows
    ? flows.filter((flow) => flow.currency === currency).map((flow) => ({ date: flow.paid_on, amount: flow.amount }))
    : paidRows.map((inv) => ({ date: inv.paid_at ?? "", amount: inv.total }));
  const received = (match: (date: string) => boolean) => receipts.filter((r) => match(r.date)).reduce((total, r) => total + r.amount, 0);
  const collectedNow = received((date) => within(date, current));
  const collectedCount = receipts.filter((r) => within(r.date, current)).length;
  const collectedBefore = received((date) => within(date, previous));

  const chart: MoneyPoint[] = bucketsFor(period, current).map(({ prefix, label, longLabel }) => ({
    label,
    longLabel,
    invoiced: sum(rows.filter((inv) => inv.issue_date.startsWith(prefix))),
    collected: received((date) => date.startsWith(prefix)),
  }));
  const daily = period === "month" || period === "last-month";

  // Where the money from this period's invoices stands today
  const draftsNow = res.invoices.filter((inv) => inv.status === "draft" && inv.currency === currency && within(inv.issue_date, current));
  const standing = [
    { label: "Paid", value: sumPaid(invoicedNow) },
    { label: "Awaiting payment", value: sumOwed(invoicedNow.filter((inv) => inv.status === "sent" && !isOverdue(inv, today))) },
    { label: "Overdue", value: sumOwed(invoicedNow.filter((inv) => isOverdue(inv, today))) },
    { label: "Draft — not sent yet", value: sum(draftsNow) },
  ]
    .filter((row) => row.value > 0)
    .map((row) => ({ ...row, value: Math.round(row.value) }));
  const invoicedTotal = sum(invoicedNow);
  const paidShare = invoicedTotal > 0 ? Math.round((sumPaid(invoicedNow) / invoicedTotal) * 100) : null;

  const clientTotals = new Map<string, number>();
  for (const inv of invoicedNow) {
    const name = inv.client_name || "No client";
    clientTotals.set(name, (clientTotals.get(name) ?? 0) + inv.total);
  }
  const topClients = [...clientTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value: Math.round(value) }));

  // Days from issue to payment, for invoices paid off in the period
  const paidDays = paidRows.filter((inv) => within(inv.paid_at, current)).map((inv) =>
    Math.max(0, Math.round((Date.parse(inv.paid_at as string) - Date.parse(inv.issue_date)) / 86_400_000))
  );
  const avgDaysToPay = paidDays.length > 0 ? Math.round(paidDays.reduce((a, b) => a + b, 0) / paidDays.length) : null;

  const href = (next: { period?: Period; currency?: string }) =>
    `/admin/finance?period=${next.period ?? period}&currency=${next.currency ?? currency}`;

  const pickerLink = (activeItem: boolean) =>
    cn(
      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
      activeItem ? "bg-gold-50 text-gold-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
    );

  const pickers = (
    <>
      {currencies.length > 1 && (
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1" role="group" aria-label="Currency">
          {currencies.map((code) => (
            <Link key={code} href={href({ currency: code })} aria-current={code === currency ? "true" : undefined} className={pickerLink(code === currency)}>
              {code}
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1" role="group" aria-label="Period">
        {PERIODS.map((p) => (
          <Link key={p} href={href({ period: p })} aria-current={p === period ? "true" : undefined} className={pickerLink(p === period)}>
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </div>
    </>
  );

  if (res.invoices.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Finance analytics" description="What you've invoiced, what's been paid and what's still owed." />
        <Card>
          <EmptyState icon={ReceiptText} title="No invoices yet" description="Numbers appear here as soon as you send your first invoice." />
          <div className="flex justify-center pb-10">
            <Link href="/admin/finance/invoices/new" className={buttonClass("primary")}>
              <Plus className="h-4 w-4" />
              Create invoice
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance analytics"
        description={`${title} · built from your invoices, in ${currency}. Drafts and void invoices don't count as money.`}
        action={pickers}
      />

      {liquidity && (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Liquidity right now</h2>
              <p className="mt-0.5 text-xs text-stone-500">Invoice payments and other income, minus expenses — per currency, all time.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {liquidityCards(liquidity).map((row) => (
              <div key={row.currency} className="flex flex-col">
                <span className="text-xs text-stone-500">{row.currency}</span>
                <span className={cn("text-lg font-semibold tracking-tight tabular-nums", row.balance > 0 ? "text-gold-700" : "text-stone-900")}>
                  {formatMoney(row.balance, row.currency)}
                </span>
              </div>
            ))}
            <Link
              href="/admin/finance/ledger"
              className="inline-flex items-center gap-1 rounded text-xs font-medium text-gold-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              Expenses &amp; income
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={`Collected · ${title}`}
          value={money(collectedNow)}
          icon={Banknote}
          emphasis
          hint={`${collectedCount} payment${collectedCount === 1 ? "" : "s"} · ${PREVIOUS_LABELS[period].toLowerCase()} ${money(collectedBefore)}`}
        />
        <StatCard
          label={`Invoiced · ${title}`}
          value={money(invoicedTotal)}
          icon={ReceiptText}
          hint={`${invoicedNow.length} sent · ${PREVIOUS_LABELS[period].toLowerCase()} ${money(invoicedBefore)}`}
        />
        <StatCard
          label="Outstanding now"
          value={money(sumOwed(outstanding))}
          icon={Clock}
          hint={`${outstanding.length} invoice${outstanding.length === 1 ? "" : "s"} awaiting payment`}
        />
        <StatCard
          label="Overdue now"
          value={money(sumOwed(overdue))}
          icon={AlertTriangle}
          hint={overdue.length === 0 ? "Nothing is late" : `${overdue.length} invoice${overdue.length === 1 ? "" : "s"} past due`}
        />
      </div>

      <Card>
        <CardHeader
          title="Invoiced vs collected"
          description={`${daily ? "Day by day" : "Month by month"} · ${title} · ${currency}`}
        />
        <div className="px-3 py-4 sm:px-5">
          <MoneyBars data={chart} currency={currency} caption={`Invoiced and collected amounts ${daily ? "by day" : "by month"}, ${title}`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Where the money stands"
            description={
              paidShare === null
                ? `Invoices dated ${title}`
                : `${paidShare}% of what you invoiced in ${title} has been paid${avgDaysToPay === null ? "" : ` · ${avgDaysToPay} day${avgDaysToPay === 1 ? "" : "s"} to pay on average`}`
            }
          />
          <BarList rows={standing} valueLabel={`Amount (${currency})`} emptyLabel="No invoices dated in this period" />
        </Card>

        <Card>
          <CardHeader title="Top clients" description={`Invoiced in ${title} · ${currency}`} />
          <BarList rows={topClients} valueLabel={`Invoiced (${currency})`} emptyLabel="No invoices sent in this period" />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Waiting to be paid"
            description="What is still owed, oldest due date first"
            action={
              <Link href="/admin/finance/invoices" className="rounded text-xs font-medium text-gold-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500">
                Past invoices
              </Link>
            }
          />
          {outstanding.length === 0 ? (
            <EmptyState icon={Banknote} title="All paid up" description="No sent invoices are waiting for payment." />
          ) : (
            <ul className="divide-y divide-stone-200">
              {[...outstanding]
                .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
                .slice(0, 6)
                .map((inv) => (
                  <li key={inv.id}>
                    <Link
                      href={`/admin/finance/invoices/${inv.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-stone-800">{inv.client_name || inv.number}</span>
                        <span className="block text-xs text-stone-500">
                          <span className="font-mono">{inv.number}</span> · due {formatInvoiceDate(inv.due_date)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <InvoiceStatusBadge invoice={inv} today={today} />
                        <span className="text-sm font-medium tabular-nums text-stone-900">{money(invoiceBalance(inv))}</span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
