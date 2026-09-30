/**
 * Invoices — shared types, money maths and validation.
 *
 * Used by the editor (live preview), the server actions (which never trust the
 * browser's totals and recompute them here) and the finance analytics page.
 */
import { addDays, formatDate, isIsoDate, todayInDubai } from "@/lib/dates";
import { cleanAmount as amount, cleanText as text, uuidOrNull } from "@/lib/sanitize";
import { SITE, SITE_URL } from "@/lib/site";

export { addDays, isIsoDate, todayInDubai };

export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};

export const CURRENCIES = ["AED", "LKR", "USD", "GBP", "EUR", "SAR"] as const;

/** The two currencies YARI actually bills in — offered first, one click apart. */
export const PRIMARY_CURRENCIES = ["AED", "LKR"] as const;

/** AED, LKR, then everything else alphabetically — the order money is listed in across the admin. */
export function orderCurrencies(codes: Iterable<string>): string[] {
  const rank = (code: string) => {
    const i = (PRIMARY_CURRENCIES as readonly string[]).indexOf(code);
    return i === -1 ? PRIMARY_CURRENCIES.length : i;
  };
  return [...new Set(codes)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export type DiscountType = "percent" | "amount";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceSeller {
  name: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  /** Tax registration number (TRN / VAT no.) */
  taxId: string;
}

export interface InvoiceClient {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
}

export interface InvoiceDraft {
  id?: string;
  number: string;
  status: InvoiceStatus;
  /** YYYY-MM-DD */
  issueDate: string;
  dueDate: string;
  /** Only meaningful when status is "paid". */
  paidAt: string;
  currency: string;
  /** The saved client this invoice belongs to ("" = typed by hand, not linked). */
  clientId: string;
  projectId: string;
  seller: InvoiceSeller;
  client: InvoiceClient;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  taxLabel: string;
  /** Percent, 0–100 */
  taxRate: number;
  notes: string;
  terms: string;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/** The columns the list and the analytics page read. */
export interface InvoiceSummaryRow {
  id: string;
  number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  currency: string;
  client_name: string;
  total: number;
  /** Sum of the payments recorded against it (payments migration). */
  amount_paid: number;
  client_id: string | null;
}

/** Before the payments migration has been run… */
export const INVOICE_SUMMARY_COLUMNS_LEGACY = "id, number, status, issue_date, due_date, paid_at, currency, client_name, total";
/** …and after. */
export const INVOICE_SUMMARY_COLUMNS = `${INVOICE_SUMMARY_COLUMNS_LEGACY}, amount_paid, client_id`;

export const MAX_INVOICE_ITEMS = 60;

/* ── Money ──────────────────────────────────────────────────────────────── */

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const lineAmount = (item: InvoiceItem) => round2(item.quantity * item.unitPrice);

export function computeTotals(draft: Pick<InvoiceDraft, "items" | "discountType" | "discountValue" | "taxRate">): InvoiceTotals {
  const subtotal = round2(draft.items.reduce((sum, item) => sum + lineAmount(item), 0));
  const rawDiscount = draft.discountType === "percent" ? (subtotal * draft.discountValue) / 100 : draft.discountValue;
  const discount = round2(Math.min(Math.max(rawDiscount, 0), subtotal));
  const tax = round2(((subtotal - discount) * draft.taxRate) / 100);
  return { subtotal, discount, tax, total: round2(subtotal - discount + tax) };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-AE", { style: "currency", currency, currencyDisplay: "code" }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Amount without the currency code — for table cells under a "Amount (AED)" style header. */
export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

/* ── Dates ──────────────────────────────────────────────────────────────── */

export const formatInvoiceDate = formatDate;

/** Sent, unpaid and past its due date. */
export const isOverdue = (invoice: { status: InvoiceStatus; due_date: string | null }, today = todayInDubai()) =>
  invoice.status === "sent" && Boolean(invoice.due_date) && (invoice.due_date as string) < today;

/* ── Payments ───────────────────────────────────────────────────────────── */

export const PAYMENT_METHODS = ["bank_transfer", "cash", "card", "cheque", "online", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash",
  card: "Card",
  cheque: "Cheque",
  online: "Online payment",
  other: "Other",
};

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  /** YYYY-MM-DD */
  paid_on: string;
  method: PaymentMethod;
  reference: string;
  note: string;
}

export const INVOICE_PAYMENT_COLUMNS = "id, invoice_id, amount, paid_on, method, reference, note";

/** What the database says about an invoice's money right now. */
export interface InvoicePaymentState {
  status: InvoiceStatus;
  paidAt: string;
  total: number;
  amountPaid: number;
}

/** What's still owed. Never negative — an overpaid invoice owes nothing. */
export const invoiceBalance = (invoice: { total: number; amount_paid: number }) => round2(Math.max(invoice.total - invoice.amount_paid, 0));

/** Sent, with some — but not all — of it paid. */
export const isPartPaid = (invoice: { status: InvoiceStatus; total: number; amount_paid: number }) =>
  invoice.status === "sent" && invoice.amount_paid > 0 && invoice.amount_paid < invoice.total;

export function sanitizePayment(input: unknown):
  | { payment: { invoiceId: string; amount: number; paidOn: string; method: PaymentMethod; reference: string; note: string } }
  | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const invoiceId = uuidOrNull(raw.invoiceId);
  if (!invoiceId) return { error: "Invoice not found." };
  const value = round2(amount(raw.amount));
  if (value <= 0) return { error: "Enter how much was paid." };
  if (!isIsoDate(raw.paidOn)) return { error: "Pick the date the payment arrived." };
  return {
    payment: {
      invoiceId,
      amount: value,
      paidOn: raw.paidOn,
      method: PAYMENT_METHODS.includes(raw.method as PaymentMethod) ? (raw.method as PaymentMethod) : "bank_transfer",
      reference: text(raw.reference, 80),
      note: text(raw.note, 500),
    },
  };
}

/* ── Defaults ───────────────────────────────────────────────────────────── */

export function defaultSeller(): InvoiceSeller {
  return {
    name: SITE.legalName,
    // No street address is on record — the admin fills this in once and it carries over to every new invoice.
    address: "Dubai, United Arab Emirates",
    email: SITE.email,
    phone: SITE.phones[0].number,
    website: SITE_URL.replace(/^https?:\/\//, ""),
    taxId: "",
  };
}

export const emptyClient = (): InvoiceClient => ({ name: "", company: "", email: "", phone: "", address: "", taxId: "" });

export function blankInvoice(number: string): InvoiceDraft {
  const today = todayInDubai();
  return {
    number,
    status: "draft",
    issueDate: today,
    dueDate: addDays(today, 14),
    paidAt: "",
    currency: "AED",
    clientId: "",
    projectId: "",
    seller: defaultSeller(),
    client: emptyClient(),
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
    discountType: "percent",
    discountValue: 0,
    taxLabel: "VAT",
    taxRate: 5,
    notes: "",
    terms: "",
  };
}

/** "INV-2026-014" → "INV-2026-015". Falls back to a fresh series when there's nothing to continue. */
export function nextInvoiceNumber(lastNumber: string | null | undefined, year = todayInDubai().slice(0, 4)): string {
  const match = lastNumber?.match(/^(.*?)(\d+)$/);
  if (!match) return `INV-${year}-001`;
  const [, prefix, digits] = match;
  return `${prefix}${String(Number(digits) + 1).padStart(digits.length, "0")}`;
}

/* ── Validation (server-side source of truth) ───────────────────────────── */

/** Coerce anything the browser sends into a well-formed draft, or explain what's wrong. */
export function sanitizeInvoice(input: unknown): { draft: InvoiceDraft } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const seller = (raw.seller ?? {}) as Record<string, unknown>;
  const client = (raw.client ?? {}) as Record<string, unknown>;

  const number = text(raw.number, 40);
  if (!number) return { error: "Give the invoice a number." };

  const status = INVOICE_STATUSES.includes(raw.status as InvoiceStatus) ? (raw.status as InvoiceStatus) : "draft";
  if (!isIsoDate(raw.issueDate)) return { error: "Pick an issue date." };
  const dueDate = isIsoDate(raw.dueDate) ? raw.dueDate : "";
  if (dueDate && dueDate < raw.issueDate) return { error: "The due date can't be before the issue date." };

  const currency = text(raw.currency, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Pick a currency." };

  const items = (Array.isArray(raw.items) ? raw.items : [])
    .slice(0, MAX_INVOICE_ITEMS)
    .map((item): InvoiceItem => {
      const i = (item ?? {}) as Record<string, unknown>;
      return { description: text(i.description, 600), quantity: round2(amount(i.quantity, 1_000_000)), unitPrice: round2(amount(i.unitPrice)) };
    })
    .filter((item) => item.description || item.unitPrice > 0);

  const clientClean: InvoiceClient = {
    name: text(client.name, 120),
    company: text(client.company, 120),
    email: text(client.email, 254),
    phone: text(client.phone, 40),
    address: text(client.address, 400),
    taxId: text(client.taxId, 40),
  };
  if (status !== "draft" && !clientClean.name && !clientClean.company) {
    return { error: "Add who the invoice is billed to before marking it sent or paid." };
  }

  const discountType: DiscountType = raw.discountType === "amount" ? "amount" : "percent";

  return {
    draft: {
      id: typeof raw.id === "string" ? raw.id : undefined,
      number,
      status,
      issueDate: raw.issueDate,
      dueDate,
      paidAt: status === "paid" ? (isIsoDate(raw.paidAt) ? raw.paidAt : todayInDubai()) : "",
      currency,
      clientId: uuidOrNull(raw.clientId) ?? "",
      projectId: uuidOrNull(raw.projectId) ?? "",
      seller: {
        name: text(seller.name, 120),
        address: text(seller.address, 400),
        email: text(seller.email, 254),
        phone: text(seller.phone, 40),
        website: text(seller.website, 120),
        taxId: text(seller.taxId, 40),
      },
      client: clientClean,
      items,
      discountType,
      discountValue: round2(amount(raw.discountValue, discountType === "percent" ? 100 : 1_000_000_000)),
      taxLabel: text(raw.taxLabel, 20) || "Tax",
      taxRate: round2(amount(raw.taxRate, 100)),
      notes: text(raw.notes, 2000),
      terms: text(raw.terms, 2000),
    },
  };
}

/* ── Row mapping ────────────────────────────────────────────────────────── */

export interface InvoiceRow extends Omit<InvoiceSummaryRow, "amount_paid" | "client_id"> {
  /** Absent until the payments migration has been run. */
  amount_paid?: number;
  client_id?: string | null;
  project_id?: string | null;
  client: Partial<InvoiceClient>;
  seller: Partial<InvoiceSeller>;
  items: Partial<InvoiceItem>[];
  discount_type: DiscountType;
  discount_value: number;
  tax_label: string;
  tax_rate: number;
  notes: string | null;
  terms: string | null;
}

export function draftToRow(draft: InvoiceDraft) {
  const totals = computeTotals(draft);
  return {
    number: draft.number,
    status: draft.status,
    issue_date: draft.issueDate,
    due_date: draft.dueDate || null,
    paid_at: draft.status === "paid" ? draft.paidAt || todayInDubai() : null,
    currency: draft.currency,
    client_name: draft.client.company || draft.client.name,
    client: draft.client,
    seller: draft.seller,
    items: draft.items,
    discount_type: draft.discountType,
    discount_value: draft.discountValue,
    tax_label: draft.taxLabel,
    tax_rate: draft.taxRate,
    subtotal: totals.subtotal,
    discount_total: totals.discount,
    tax_total: totals.tax,
    total: totals.total,
    notes: draft.notes || null,
    terms: draft.terms || null,
  };
}

/** The link to a saved client / project — columns that only exist after the payments migration. */
export const draftLinks = (draft: InvoiceDraft) => ({
  client_id: draft.clientId || null,
  project_id: draft.projectId || null,
});

export function rowToDraft(row: InvoiceRow): InvoiceDraft {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date ?? "",
    paidAt: row.paid_at ?? "",
    currency: row.currency,
    clientId: row.client_id ?? "",
    projectId: row.project_id ?? "",
    seller: { ...defaultSeller(), ...row.seller },
    client: { ...emptyClient(), ...row.client },
    items: (row.items ?? []).map((i) => ({
      description: i.description ?? "",
      quantity: Number(i.quantity ?? 0),
      unitPrice: Number(i.unitPrice ?? 0),
    })),
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    taxLabel: row.tax_label,
    taxRate: Number(row.tax_rate),
    notes: row.notes ?? "",
    terms: row.terms ?? "",
  };
}
