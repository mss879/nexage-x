"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Minus, Plus, ReceiptText, Search, Wallet } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, Input, PageHeader, ProgressBar, Select } from "@/components/admin/ui";
import { MoneyStack } from "@/components/admin/money";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import { formatDate, monthName } from "@/lib/dates";
import { emptyEntry, entryToInput, liquidityCards, sumByCurrency, type FinanceEntryInput, type FinanceEntryRow, type LiquidityRow } from "@/lib/finance";
import { formatMoney, orderCurrencies } from "@/lib/invoices";
import type { TeamOption } from "@/lib/team";
import { cn } from "@/lib/utils";
import EntryModal from "./EntryModal";
import type { LedgerPayment } from "./actions";

const DIRECTIONS = ["all", "in", "out"] as const;
type Direction = (typeof DIRECTIONS)[number];
const DIRECTION_LABELS: Record<Direction, string> = { all: "Everything", in: "Money in", out: "Money out" };

/** One line of the cash book — an entry typed in here, or a payment recorded on an invoice. */
interface Line {
  key: string;
  date: string;
  direction: "in" | "out";
  description: string;
  category: string;
  currency: string;
  amount: number;
  client?: { id: string | null; name: string };
  project?: string;
  paidBy?: string;
  /** Set for typed entries — they can be edited here */
  entry?: FinanceEntryRow;
  /** Set for invoice payments — they are changed on the invoice */
  invoiceId?: string;
}

/** What the company holds in one currency, and how it got there. */
function LiquidityCard({ row, month }: { row: LiquidityRow; month: string }) {
  const money = (value: number) => formatMoney(value, row.currency);
  const income = row.manualIncome + row.invoiceIncome;
  const empty = income === 0 && row.expenses === 0;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500">Liquidity · {row.currency}</span>
        <Wallet className="h-4 w-4 text-stone-400" />
      </div>

      <div>
        {/* A negative balance is stated in ink with a minus sign — not a warning colour */}
        <span className={cn("text-3xl font-semibold tracking-tight tabular-nums", row.balance > 0 ? "text-gold-700" : "text-stone-900")}>
          {money(row.balance)}
        </span>
        <p className="mt-1 text-xs text-stone-500">{empty ? "Nothing recorded in this currency yet" : "Money in minus money out, all time"}</p>
      </div>

      <div>
        <ProgressBar value={row.expenses} max={Math.max(income, row.expenses)} label={`Share of ${row.currency} income spent`} />
        <dl className="mt-3 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Invoice payments</dt>
            <dd className="tabular-nums text-stone-800">{money(row.invoiceIncome)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Other income</dt>
            <dd className="tabular-nums text-stone-800">{money(row.manualIncome)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Expenses</dt>
            <dd className="tabular-nums text-stone-800">−{money(row.expenses)}</dd>
          </div>
        </dl>
      </div>

      <p className="border-t border-stone-200 pt-3 text-xs text-stone-500">
        {month}: <span className="font-medium tabular-nums text-stone-800">{money(row.incomeThisMonth)}</span> in ·{" "}
        <span className="font-medium tabular-nums text-stone-800">{money(row.expensesThisMonth)}</span> out
      </p>
    </Card>
  );
}

export default function LedgerView({
  entries,
  payments,
  liquidity,
  team,
  clients,
  projects,
  today,
}: {
  entries: FinanceEntryRow[];
  payments: LedgerPayment[];
  liquidity: LiquidityRow[];
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  today: string;
}) {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>("all");
  const [currency, setCurrency] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<FinanceEntryInput | null>(null);

  const lines = useMemo<Line[]>(() => {
    const names = new Map(team.map((member) => [member.id, member.full_name]));
    const clientNames = new Map(clients.map((client) => [client.id, client.name]));
    const projectNames = new Map(projects.map((project) => [project.id, project.name]));

    const typed = entries.map<Line>((entry) => ({
      key: entry.id,
      date: entry.entry_date,
      direction: entry.type === "income" ? "in" : "out",
      description: entry.description,
      category: entry.category,
      currency: entry.currency,
      amount: entry.amount,
      client: entry.client_id ? { id: entry.client_id, name: clientNames.get(entry.client_id) ?? "Client" } : undefined,
      project: entry.project_id ? projectNames.get(entry.project_id) : undefined,
      paidBy: entry.paid_by_id ? names.get(entry.paid_by_id) : entry.paid_by_name || undefined,
      entry,
    }));
    const invoiced = payments.map<Line>((payment) => ({
      key: `payment-${payment.id}`,
      date: payment.paid_on,
      direction: "in",
      description: `Payment on invoice ${payment.invoice_number}`,
      category: "Invoice payment",
      currency: payment.currency,
      amount: payment.amount,
      client: payment.client_name ? { id: payment.client_id, name: payment.client_name } : undefined,
      invoiceId: payment.invoice_id,
    }));
    return [...typed, ...invoiced].sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, payments, team, clients, projects]);

  const currencies = useMemo(() => orderCurrencies(lines.map((line) => line.currency)), [lines]);
  const categories = useMemo(() => [...new Set(lines.map((line) => line.category))].sort(), [lines]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lines.filter(
      (line) =>
        (direction === "all" || line.direction === direction) &&
        (currency === "all" || line.currency === currency) &&
        (category === "all" || line.category === category) &&
        (!q || [line.description, line.category, line.client?.name ?? "", line.paidBy ?? ""].some((value) => value.toLowerCase().includes(q)))
    );
  }, [lines, direction, currency, category, query]);

  const shownIn = sumByCurrency(visible.filter((line) => line.direction === "in"), (line) => line.currency, (line) => line.amount);
  const shownOut = sumByCurrency(visible.filter((line) => line.direction === "out"), (line) => line.currency, (line) => line.amount);
  const filtered = direction !== "all" || currency !== "all" || category !== "all" || query.trim() !== "";

  const cards = liquidityCards(liquidity);
  const month = monthName(today.slice(0, 7), { month: "long" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses & income"
        description="Everything that came in and went out, and what the company holds right now. Invoice payments are counted for you."
        action={
          <>
            <Button variant="secondary" onClick={() => setEditing(emptyEntry({ type: "income" }))}>
              <Plus className="h-4 w-4" />
              Add income
            </Button>
            <Button onClick={() => setEditing(emptyEntry({ type: "expense" }))}>
              <Minus className="h-4 w-4" />
              Add expense
            </Button>
          </>
        }
      />

      <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", cards.length > 2 && "xl:grid-cols-3")}>
        {cards.map((row) => (
          <LiquidityCard key={row.currency} row={row} month={month} />
        ))}
      </div>

      {lines.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Nothing recorded yet"
            description="Add what the company holds today as income with the category “Opening balance”, then add expenses as they happen."
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Money in or out">
                {DIRECTIONS.map((d) => (
                  <Chip key={d} selected={direction === d} onClick={() => setDirection(d)}>
                    {DIRECTION_LABELS[d]}
                  </Chip>
                ))}
              </div>
              {currencies.length > 1 && (
                <Select aria-label="Currency" className="w-44" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="all">All currencies</option>
                  {currencies.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              )}
              <Select aria-label="Category" className="w-52" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div className="relative w-full xl:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input type="search" aria-label="Search entries" placeholder="Search entries" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2 border-b border-stone-200 px-5 py-3 text-xs text-stone-500">
              <span>
                {visible.length} {visible.length === 1 ? "entry" : "entries"}
                {filtered ? " match" : ""}
              </span>
              <div className="flex gap-8">
                <span className="flex items-start gap-2">
                  In
                  <MoneyStack lines={shownIn} className="font-medium tabular-nums text-stone-900" />
                </span>
                <span className="flex items-start gap-2">
                  Out
                  <MoneyStack lines={shownOut} className="font-medium tabular-nums text-stone-900" />
                </span>
              </div>
            </div>

            {visible.length === 0 ? (
              <EmptyState icon={Search} title="Nothing matches" description="Try a different filter or search term." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs text-stone-500">
                      <th scope="col" className="px-5 py-3 font-medium">Date</th>
                      <th scope="col" className="px-3 py-3 font-medium">Description</th>
                      <th scope="col" className="px-3 py-3 font-medium">Category</th>
                      <th scope="col" className="px-3 py-3 font-medium">Client</th>
                      <th scope="col" className="px-3 py-3 font-medium">Paid by</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {visible.map((line) => (
                      <tr key={line.key} className="transition-colors duration-150 hover:bg-stone-50">
                        <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-stone-600">{formatDate(line.date)}</td>
                        <td className="max-w-[300px] px-3 py-3.5">
                          {line.entry ? (
                            <button
                              type="button"
                              onClick={() => setEditing(entryToInput(line.entry as FinanceEntryRow))}
                              className="block max-w-full truncate rounded text-left font-medium text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
                            >
                              {line.description}
                            </button>
                          ) : (
                            <Link
                              href={`/admin/finance/invoices/${line.invoiceId}`}
                              className="inline-flex max-w-full items-center gap-1.5 truncate rounded font-medium text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                            >
                              <ReceiptText className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                              {line.description}
                            </Link>
                          )}
                          {line.project && <span className="block truncate text-xs text-stone-500">{line.project}</span>}
                        </td>
                        <td className="px-3 py-3.5">
                          <Badge tone={line.invoiceId ? "soft" : "outline"}>{line.category}</Badge>
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-3.5 text-stone-600">
                          {line.client?.id ? (
                            <Link
                              href={`/admin/clients/${line.client.id}`}
                              className="rounded underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                            >
                              {line.client.name}
                            </Link>
                          ) : (
                            (line.client?.name ?? <span className="text-stone-300">—</span>)
                          )}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-3.5 text-stone-600">{line.paidBy ?? <span className="text-stone-300">—</span>}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          {/* Direction is carried by the sign and the arrow — never by red and green */}
                          <span className={cn("inline-flex items-center gap-1.5 font-medium tabular-nums", line.direction === "in" ? "text-stone-900" : "text-stone-600")}>
                            {line.direction === "in" ? (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-gold-600" aria-label="Money in" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-stone-400" aria-label="Money out" />
                            )}
                            {line.direction === "in" ? "+" : "−"}
                            {formatMoney(line.amount, line.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {editing && (
        <EntryModal
          key={editing.id ?? `new-${editing.type}`}
          initial={editing}
          team={team}
          clients={clients}
          projects={projects}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
