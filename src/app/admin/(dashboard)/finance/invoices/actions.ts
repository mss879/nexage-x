"use server";

import { revalidatePath } from "next/cache";
import { isMissingColumn, isMissingTable, makeFail, type Result } from "@/lib/action-result";
import { requireAdmin } from "@/lib/admin-auth";
import { CLIENT_COLUMNS, clientToInvoiceClient, type ClientRow } from "@/lib/clients";
import {
  INVOICE_PAYMENT_COLUMNS,
  INVOICE_STATUSES,
  INVOICE_SUMMARY_COLUMNS,
  INVOICE_SUMMARY_COLUMNS_LEGACY,
  blankInvoice,
  draftLinks,
  draftToRow,
  invoiceBalance,
  isIsoDate,
  nextInvoiceNumber,
  rowToDraft,
  sanitizeInvoice,
  sanitizePayment,
  todayInDubai,
  formatMoney,
  type InvoiceDraft,
  type InvoicePayment,
  type InvoicePaymentState,
  type InvoiceRow,
  type InvoiceStatus,
  type InvoiceSummaryRow,
} from "@/lib/invoices";
import { isUuid } from "@/lib/sanitize";

const fail = makeFail({
  missing: "The invoices table doesn't exist yet.",
  duplicate: "Another invoice already uses this number.",
});

/** Payments are a later migration — until it has been run an invoice is simply paid or not. */
const paymentsNotReady = (error: unknown) => isMissingTable(error) || isMissingColumn(error);

const PAYMENTS_SETUP = "Payment tracking isn't set up yet — run supabase/migrations/20260930130000_invoice_payments.sql in Supabase first.";

/** Invoices feed the finance pages, the dashboard calendar and the client pages. */
const refresh = (clientId?: string | null) => {
  revalidatePath("/admin/finance", "layout");
  revalidatePath("/admin");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
};

/**
 * Every invoice, newest first. `paymentsReady` is false until the payments
 * migration has been run; amount_paid is then inferred from the status so the
 * rest of the admin can treat both cases the same.
 */
export async function listInvoices(): Promise<Result<{ invoices: InvoiceSummaryRow[]; paymentsReady: boolean }>> {
  try {
    const supabase = await requireAdmin();
    const select = (columns: string) =>
      supabase.from("invoices").select(columns).order("issue_date", { ascending: false }).order("created_at", { ascending: false }).limit(1000);

    let paymentsReady = true;
    let { data, error } = await select(INVOICE_SUMMARY_COLUMNS);
    if (error && isMissingColumn(error)) {
      paymentsReady = false;
      ({ data, error } = await select(INVOICE_SUMMARY_COLUMNS_LEGACY));
    }
    if (error) return fail(error);

    const invoices = ((data ?? []) as unknown as InvoiceSummaryRow[]).map((row) => {
      const total = Number(row.total);
      return {
        ...row,
        total,
        amount_paid: paymentsReady ? Number(row.amount_paid) : row.status === "paid" ? total : 0,
        client_id: row.client_id ?? null,
      };
    });
    return { success: true, invoices, paymentsReady };
  } catch (error) {
    return fail(error);
  }
}

export interface PaymentFlow {
  amount: number;
  /** YYYY-MM-DD */
  paid_on: string;
  currency: string;
}

/**
 * Payments received on or after `since` (YYYY-MM-DD), each with its invoice's
 * currency — what "collected" is measured from. Callers ask only for the
 * window they show, so the API's row cap is never what decides a total.
 * null until the payments migration has been run.
 */
export async function listPaymentFlows(since: string): Promise<PaymentFlow[] | null> {
  try {
    if (!isIsoDate(since)) return null;
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("invoice_payments")
      .select("amount, paid_on, invoices!inner(currency)")
      .gte("paid_on", since)
      .order("paid_on", { ascending: false })
      .limit(5000);
    if (error) return null;
    return ((data ?? []) as unknown as { amount: number; paid_on: string; invoices: { currency: string } }[]).map((row) => ({
      amount: Number(row.amount),
      paid_on: row.paid_on,
      currency: row.invoices.currency,
    }));
  } catch {
    return null;
  }
}

export interface InvoiceDetail {
  invoice: InvoiceDraft;
  payments: InvoicePayment[];
  amountPaid: number;
  paymentsReady: boolean;
}

export async function getInvoice(id: string): Promise<Result<InvoiceDetail>> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invoice not found." };
    const supabase = await requireAdmin();
    const [invoiceRes, paymentsRes] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).maybeSingle(),
      supabase.from("invoice_payments").select(INVOICE_PAYMENT_COLUMNS).eq("invoice_id", id).order("paid_on", { ascending: false }).order("created_at", { ascending: false }),
    ]);
    if (invoiceRes.error) return fail(invoiceRes.error);
    if (!invoiceRes.data) return { success: false, error: "Invoice not found." };
    if (paymentsRes.error && !paymentsNotReady(paymentsRes.error)) return fail(paymentsRes.error);

    const row = invoiceRes.data as InvoiceRow;
    const paymentsReady = !paymentsRes.error;
    return {
      success: true,
      invoice: rowToDraft(row),
      payments: ((paymentsRes.data ?? []) as InvoicePayment[]).map((payment) => ({ ...payment, amount: Number(payment.amount) })),
      amountPaid: paymentsReady ? Number(row.amount_paid ?? 0) : row.status === "paid" ? Number(row.total) : 0,
      paymentsReady,
    };
  } catch (error) {
    return fail(error);
  }
}

/**
 * A fresh draft. Your business details, currency, tax and payment terms carry
 * over from the most recent invoice, so they're only ever typed once. With
 * `fromId` the client and line items are copied too (Duplicate); with
 * `clientId` the invoice starts out billed to that saved client, in the
 * currency they're usually billed in.
 */
export async function getNewInvoice(fromId?: string, clientId?: string): Promise<Result<{ invoice: InvoiceDraft }>> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return fail(error);

    const latest = data ? rowToDraft(data as InvoiceRow) : null;
    const draft = blankInvoice(nextInvoiceNumber(latest?.number));

    let source = latest;
    if (fromId && isUuid(fromId)) {
      const { data: original } = await supabase.from("invoices").select("*").eq("id", fromId).maybeSingle();
      if (original) {
        source = rowToDraft(original as InvoiceRow);
        draft.client = source.client;
        draft.clientId = source.clientId;
        draft.projectId = source.projectId;
        draft.items = source.items;
        draft.discountType = source.discountType;
        draft.discountValue = source.discountValue;
        draft.notes = source.notes;
      }
    }
    if (source) {
      draft.seller = source.seller;
      draft.currency = source.currency;
      draft.taxLabel = source.taxLabel;
      draft.taxRate = source.taxRate;
      draft.terms = source.terms;
    }

    if (clientId && isUuid(clientId)) {
      const { data: client } = await supabase.from("clients").select(CLIENT_COLUMNS).eq("id", clientId).maybeSingle();
      if (client) {
        const row = client as ClientRow;
        draft.client = clientToInvoiceClient(row);
        draft.clientId = row.id;
        draft.projectId = "";
        draft.currency = row.default_currency;
      }
    }
    return { success: true, invoice: draft };
  } catch (error) {
    return fail(error);
  }
}

const stateOf = (row: { status: InvoiceStatus; paid_at: string | null; total: number; amount_paid?: number }): InvoicePaymentState => ({
  status: row.status,
  paidAt: row.paid_at ?? "",
  total: Number(row.total),
  amountPaid: row.amount_paid === undefined ? (row.status === "paid" ? Number(row.total) : 0) : Number(row.amount_paid),
});

/**
 * Create (no id) or update. Totals are always recomputed here, never taken from
 * the browser. The database has the last word on status: an invoice whose
 * payments cover it comes back "paid" whatever was sent, and one marked paid
 * has its balance recorded as a payment — so the state is returned for the
 * editor to show.
 */
export async function saveInvoice(
  input: unknown
): Promise<Result<{ id: string; state: InvoicePaymentState; /** null until the payments migration has been run */ payments: InvoicePayment[] | null }>> {
  try {
    const parsed = sanitizeInvoice(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { draft } = parsed;
    if (draft.id && !isUuid(draft.id)) return { success: false, error: "Invoice not found." };

    const supabase = await requireAdmin();
    const write = (row: Record<string, unknown>, columns: string) =>
      draft.id
        ? supabase.from("invoices").update(row).eq("id", draft.id).select(columns).maybeSingle()
        : supabase.from("invoices").insert(row).select(columns).single();

    const base = draftToRow(draft);
    let { data, error } = await write({ ...base, ...draftLinks(draft) }, "id, status, paid_at, total, amount_paid, client_id");
    // Before the payments migration there is no client link and no amount_paid
    if (error && isMissingColumn(error)) ({ data, error } = await write(base, "id, status, paid_at, total"));
    if (error) return fail(error);
    if (!data) return { success: false, error: "Invoice not found — it may have been deleted." };

    const saved = data as unknown as { id: string; status: InvoiceStatus; paid_at: string | null; total: number; amount_paid?: number; client_id?: string | null };

    // Marking an invoice paid makes the database record the balance as a payment
    // after the row is written, so read the final state (and the payments) back.
    if (saved.amount_paid !== undefined) {
      const after = await paymentState(supabase, saved.id);
      if (after.success) return { success: true, id: saved.id, state: after.state, payments: after.payments };
    }

    refresh(saved.client_id);
    return { success: true, id: saved.id, state: stateOf(saved), payments: null };
  } catch (error) {
    return fail(error);
  }
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus, paidAt?: string): Promise<Result> {
  try {
    if (!isUuid(id) || !INVOICE_STATUSES.includes(status)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { error } = await supabase
      .from("invoices")
      .update({ status, paid_at: status === "paid" ? (isIsoDate(paidAt) ? paidAt : todayInDubai()) : null })
      .eq("id", id);
    if (error) return fail(error);
    refresh();
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteInvoice(id: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) return fail(error);
    refresh();
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/* ── Payments ───────────────────────────────────────────────────────────── */

type PaymentResult = Result<{ state: InvoicePaymentState; payments: InvoicePayment[] }>;

/** An invoice's money as the database has it now, with its payments newest first. */
async function paymentState(supabase: Awaited<ReturnType<typeof requireAdmin>>, invoiceId: string): Promise<PaymentResult> {
  const [invoiceRes, paymentsRes] = await Promise.all([
    supabase.from("invoices").select("status, paid_at, total, amount_paid, client_id").eq("id", invoiceId).maybeSingle(),
    supabase.from("invoice_payments").select(INVOICE_PAYMENT_COLUMNS).eq("invoice_id", invoiceId).order("paid_on", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  if (invoiceRes.error) return fail(invoiceRes.error);
  if (paymentsRes.error) return fail(paymentsRes.error);
  if (!invoiceRes.data) return { success: false, error: "Invoice not found — it may have been deleted." };

  refresh(invoiceRes.data.client_id as string | null);
  return {
    success: true,
    state: stateOf(invoiceRes.data as { status: InvoiceStatus; paid_at: string | null; total: number; amount_paid: number }),
    payments: ((paymentsRes.data ?? []) as InvoicePayment[]).map((payment) => ({ ...payment, amount: Number(payment.amount) })),
  };
}

/**
 * Record money received against an invoice. The database then works out the
 * rest: amount paid, and whether the invoice is now paid in full.
 */
export async function recordInvoicePayment(input: unknown): Promise<PaymentResult> {
  try {
    const parsed = sanitizePayment(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { payment } = parsed;

    const supabase = await requireAdmin();
    const { data: invoice, error: lookupError } = await supabase
      .from("invoices")
      .select("status, currency, total, amount_paid")
      .eq("id", payment.invoiceId)
      .maybeSingle();
    if (lookupError) return paymentsNotReady(lookupError) ? { success: false, error: PAYMENTS_SETUP } : fail(lookupError);
    if (!invoice) return { success: false, error: "Invoice not found — it may have been deleted." };
    if (invoice.status === "void") return { success: false, error: "This invoice is void — it can't take payments." };

    const balance = invoiceBalance({ total: Number(invoice.total), amount_paid: Number(invoice.amount_paid) });
    if (balance <= 0) return { success: false, error: "This invoice is already paid in full." };
    if (payment.amount > balance) {
      return { success: false, error: `That's more than the ${formatMoney(balance, invoice.currency)} still owed on this invoice.` };
    }

    const { error } = await supabase.from("invoice_payments").insert({
      invoice_id: payment.invoiceId,
      amount: payment.amount,
      paid_on: payment.paidOn,
      method: payment.method,
      reference: payment.reference,
      note: payment.note,
    });
    if (error) return paymentsNotReady(error) ? { success: false, error: PAYMENTS_SETUP } : fail(error);

    return paymentState(supabase, payment.invoiceId);
  } catch (error) {
    return fail(error);
  }
}

/** Remove a payment recorded by mistake. The invoice goes back to "sent" if it is no longer covered. */
export async function deleteInvoicePayment(id: string): Promise<PaymentResult> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("invoice_payments").delete().eq("id", id).select("invoice_id").maybeSingle();
    if (error) return fail(error);
    if (!data) return { success: false, error: "That payment was already removed." };
    return paymentState(supabase, data.invoice_id as string);
  } catch (error) {
    return fail(error);
  }
}
