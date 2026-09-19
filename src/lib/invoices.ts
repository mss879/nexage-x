/**
 * Invoices — shared types, money maths and validation.
 *
 * Used by the editor (live preview), the server actions (which never trust the
 * browser's totals and recompute them here) and the finance analytics page.
 */
import { SITE, SITE_URL } from "@/lib/site";

export const INVOICE_STATUSES = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};

export const CURRENCIES = ["AED", "USD", "GBP", "EUR", "SAR", "LKR"] as const;

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
}

export const INVOICE_SUMMARY_COLUMNS = "id, number, status, issue_date, due_date, paid_at, currency, client_name, total";

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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (value: unknown): value is string =>
  typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Today's calendar date in Dubai, as YYYY-MM-DD. */
export const todayInDubai = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const formatInvoiceDate = (isoDate: string | null | undefined) =>
  isIsoDate(isoDate)
    ? new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : "—";

/** Sent, unpaid and past its due date. */
export const isOverdue = (invoice: { status: InvoiceStatus; due_date: string | null }, today = todayInDubai()) =>
  invoice.status === "sent" && Boolean(invoice.due_date) && (invoice.due_date as string) < today;

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

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const amount = (value: unknown, max = 1_000_000_000) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};

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

export interface InvoiceRow extends InvoiceSummaryRow {
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

export function rowToDraft(row: InvoiceRow): InvoiceDraft {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date ?? "",
    paidAt: row.paid_at ?? "",
    currency: row.currency,
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
