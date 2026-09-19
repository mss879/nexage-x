"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { isUuid } from "@/lib/chat";
import {
  INVOICE_STATUSES,
  INVOICE_SUMMARY_COLUMNS,
  blankInvoice,
  draftToRow,
  isIsoDate,
  nextInvoiceNumber,
  rowToDraft,
  sanitizeInvoice,
  todayInDubai,
  type InvoiceDraft,
  type InvoiceRow,
  type InvoiceStatus,
  type InvoiceSummaryRow,
} from "@/lib/invoices";

type Failure = { success: false; error: string; missingTable?: boolean };
type Result<T> = ({ success: true } & T) | Failure;

const fail = (error: unknown): Failure => {
  const e = error as { message?: string; code?: string };
  // 42P01 / PGRST205 → the invoices migration hasn't been applied yet
  if (e?.code === "42P01" || e?.code === "PGRST205") {
    return { success: false, error: "The invoices table doesn't exist yet.", missingTable: true };
  }
  if (e?.code === "23505") return { success: false, error: "Another invoice already uses this number." };
  return { success: false, error: e?.message ?? "Something went wrong." };
};

const refresh = () => {
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/invoices");
};

export async function listInvoices(): Promise<Result<{ invoices: InvoiceSummaryRow[] }>> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("invoices")
      .select(INVOICE_SUMMARY_COLUMNS)
      .order("issue_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return fail(error);
    const invoices = ((data ?? []) as unknown as InvoiceSummaryRow[]).map((row) => ({ ...row, total: Number(row.total) }));
    return { success: true, invoices };
  } catch (error) {
    return fail(error);
  }
}

export async function getInvoice(id: string): Promise<Result<{ invoice: InvoiceDraft }>> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invoice not found." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
    if (error) return fail(error);
    if (!data) return { success: false, error: "Invoice not found." };
    return { success: true, invoice: rowToDraft(data as InvoiceRow) };
  } catch (error) {
    return fail(error);
  }
}

/**
 * A fresh draft. Your business details, currency, tax and payment terms carry
 * over from the most recent invoice, so they're only ever typed once. With
 * `fromId` the client and line items are copied too (Duplicate).
 */
export async function getNewInvoice(fromId?: string): Promise<Result<{ invoice: InvoiceDraft }>> {
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
    return { success: true, invoice: draft };
  } catch (error) {
    return fail(error);
  }
}

/** Create (no id) or update. Totals are always recomputed here, never taken from the browser. */
export async function saveInvoice(input: unknown): Promise<Result<{ id: string }>> {
  try {
    const parsed = sanitizeInvoice(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { draft } = parsed;
    if (draft.id && !isUuid(draft.id)) return { success: false, error: "Invoice not found." };

    const supabase = await requireAdmin();
    const row = draftToRow(draft);
    const query = draft.id
      ? supabase.from("invoices").update(row).eq("id", draft.id).select("id").maybeSingle()
      : supabase.from("invoices").insert(row).select("id").single();
    const { data, error } = await query;
    if (error) return fail(error);
    if (!data) return { success: false, error: "Invoice not found — it may have been deleted." };

    refresh();
    return { success: true, id: data.id as string };
  } catch (error) {
    return fail(error);
  }
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus, paidAt?: string): Promise<Result<object>> {
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

export async function deleteInvoice(id: string): Promise<Result<object>> {
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
