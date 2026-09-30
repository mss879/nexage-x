/**
 * Finance ledger — expenses and income that isn't an invoice payment — and
 * liquidity. Amounts in different currencies are never added together.
 */
import { isIsoDate, todayInDubai } from "@/lib/dates";
import { orderCurrencies, round2 } from "@/lib/invoices";
import { cleanAmount, cleanText, oneOf, uuidOrNull } from "@/lib/sanitize";

export const ENTRY_TYPES = ["expense", "income"] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = { expense: "Expense", income: "Income" };

export const ENTRY_CATEGORIES: Record<EntryType, readonly string[]> = {
  expense: [
    "Project costs",
    "Freelancers & contractors",
    "Software & subscriptions",
    "Advertising",
    "Salaries",
    "Office & rent",
    "Travel",
    "Equipment",
    "Bank & payment fees",
    "Taxes & government fees",
    "Other",
  ],
  income: ["Project payment", "Retainer", "Capital from directors", "Opening balance", "Refund received", "Other"],
};

export interface FinanceEntryRow {
  id: string;
  created_at: string;
  type: EntryType;
  amount: number;
  currency: string;
  /** YYYY-MM-DD */
  entry_date: string;
  category: string;
  description: string;
  client_id: string | null;
  project_id: string | null;
  paid_by_id: string | null;
  paid_by_name: string;
  notes: string;
}

export const FINANCE_ENTRY_COLUMNS =
  "id, created_at, type, amount, currency, entry_date, category, description, client_id, project_id, paid_by_id, paid_by_name, notes";

export interface FinanceEntryInput {
  id?: string;
  type: EntryType;
  amount: number;
  currency: string;
  entry_date: string;
  category: string;
  description: string;
  client_id: string;
  project_id: string;
  paid_by_id: string;
  paid_by_name: string;
  notes: string;
}

export const emptyEntry = (defaults: Partial<FinanceEntryInput> = {}): FinanceEntryInput => ({
  type: "expense",
  amount: 0,
  currency: "AED",
  entry_date: todayInDubai(),
  category: ENTRY_CATEGORIES[defaults.type ?? "expense"][0],
  description: "",
  client_id: "",
  project_id: "",
  paid_by_id: "",
  paid_by_name: "",
  notes: "",
  ...defaults,
});

export const entryToInput = (entry: FinanceEntryRow): FinanceEntryInput => ({
  id: entry.id,
  type: entry.type,
  amount: entry.amount,
  currency: entry.currency,
  entry_date: entry.entry_date,
  category: entry.category,
  description: entry.description,
  client_id: entry.client_id ?? "",
  project_id: entry.project_id ?? "",
  paid_by_id: entry.paid_by_id ?? "",
  paid_by_name: entry.paid_by_name,
  notes: entry.notes,
});

export function sanitizeEntry(input: unknown): { entry: FinanceEntryInput } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const type = oneOf(raw.type, ENTRY_TYPES, "expense");
  const amount = round2(cleanAmount(raw.amount));
  if (amount <= 0) return { error: "Enter an amount above zero." };
  const currency = cleanText(raw.currency, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Pick a currency." };
  if (!isIsoDate(raw.entry_date)) return { error: "Pick a date." };
  const description = cleanText(raw.description, 300);
  if (!description) return { error: type === "expense" ? "Say what the money was spent on." : "Say where the money came from." };

  const paid_by_id = uuidOrNull(raw.paid_by_id) ?? "";
  return {
    entry: {
      id: uuidOrNull(raw.id) ?? undefined,
      type,
      amount,
      currency,
      entry_date: raw.entry_date,
      category: cleanText(raw.category, 60) || "Other",
      description,
      client_id: uuidOrNull(raw.client_id) ?? "",
      project_id: uuidOrNull(raw.project_id) ?? "",
      paid_by_id,
      // A typed name is only kept when no team member was picked
      paid_by_name: paid_by_id ? "" : cleanText(raw.paid_by_name, 80),
      notes: cleanText(raw.notes, 2000),
    },
  };
}

export const entryToRow = (entry: FinanceEntryInput) => ({
  type: entry.type,
  amount: entry.amount,
  currency: entry.currency,
  entry_date: entry.entry_date,
  category: entry.category,
  description: entry.description,
  client_id: entry.client_id || null,
  project_id: entry.project_id || null,
  paid_by_id: entry.paid_by_id || null,
  paid_by_name: entry.paid_by_name,
  notes: entry.notes,
});

/* ── Liquidity ──────────────────────────────────────────────────────────── */

/** One currency's cash position, from public.finance_liquidity(). */
export interface LiquidityRow {
  currency: string;
  /** Income entered by hand (not invoices) */
  manualIncome: number;
  /** Payments recorded against invoices */
  invoiceIncome: number;
  expenses: number;
  /** manualIncome + invoiceIncome − expenses */
  balance: number;
  /** Money in / out since the start of the current month */
  incomeThisMonth: number;
  expensesThisMonth: number;
}

export const emptyLiquidity = (currency: string): LiquidityRow => ({
  currency,
  manualIncome: 0,
  invoiceIncome: 0,
  expenses: 0,
  balance: 0,
  incomeThisMonth: 0,
  expensesThisMonth: 0,
});

/** AED and LKR are always shown, even at zero; other currencies only once they're used. */
export function liquidityCards(rows: LiquidityRow[]): LiquidityRow[] {
  const byCode = new Map(rows.map((row) => [row.currency, row]));
  return orderCurrencies(["AED", "LKR", ...byCode.keys()]).map((code) => byCode.get(code) ?? emptyLiquidity(code));
}

/* ── Multi-currency sums ────────────────────────────────────────────────── */

/** Totals per currency, in display order. Zero totals are dropped. */
export function sumByCurrency<T>(rows: T[], currencyOf: (row: T) => string, amountOf: (row: T) => number): { currency: string; amount: number }[] {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(currencyOf(row), (totals.get(currencyOf(row)) ?? 0) + amountOf(row));
  return orderCurrencies(totals.keys())
    .map((currency) => ({ currency, amount: round2(totals.get(currency) ?? 0) }))
    .filter((line) => line.amount !== 0);
}
