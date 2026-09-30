"use server";

import { revalidatePath } from "next/cache";
import { makeFail, type Result } from "@/lib/action-result";
import { requireAdmin, requireAdminContext } from "@/lib/admin-auth";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import { todayInDubai } from "@/lib/dates";
import { FINANCE_ENTRY_COLUMNS, entryToRow, sanitizeEntry, type FinanceEntryRow, type LiquidityRow } from "@/lib/finance";
import { isUuid } from "@/lib/sanitize";
import type { TeamOption } from "@/lib/team";
import { listClientOptions } from "../../clients/actions";

const fail = makeFail({
  missing: "The expenses and income table doesn't exist yet.",
  inUse: "The person, client or project you picked no longer exists.",
});

const refresh = (clientId?: string | null) => {
  revalidatePath("/admin/finance", "layout");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
};

/**
 * What the company holds right now, per currency: income entered by hand, plus
 * invoice payments, minus expenses. Summed in the database over every row.
 * null until the ledger migration has been run.
 */
export async function getLiquidity(): Promise<LiquidityRow[] | null> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase.rpc("finance_liquidity", { p_since: `${todayInDubai().slice(0, 7)}-01` });
    if (error) return null;
    return ((data ?? []) as Record<string, string | number>[]).map((row) => ({
      currency: String(row.currency),
      manualIncome: Number(row.manual_income),
      invoiceIncome: Number(row.invoice_income),
      expenses: Number(row.expenses),
      balance: Number(row.balance),
      incomeThisMonth: Number(row.income_since),
      expensesThisMonth: Number(row.expenses_since),
    }));
  } catch {
    return null;
  }
}

/** An invoice payment as it appears in the ledger: income that was never typed in here. */
export interface LedgerPayment {
  id: string;
  amount: number;
  paid_on: string;
  invoice_id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  currency: string;
}

export interface LedgerData {
  entries: FinanceEntryRow[];
  payments: LedgerPayment[];
  liquidity: LiquidityRow[];
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  me: string;
}

export async function getLedger(): Promise<Result<LedgerData>> {
  try {
    const { supabase, admin } = await requireAdminContext();
    const [entriesRes, paymentsRes, teamRes, liquidity, options] = await Promise.all([
      supabase
        .from("finance_entries")
        .select(FINANCE_ENTRY_COLUMNS)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("invoice_payments")
        .select("id, amount, paid_on, invoice_id, invoices!inner(number, client_name, client_id, currency)")
        .order("paid_on", { ascending: false })
        .limit(1000),
      supabase.from("team_members").select("id, full_name, active").order("full_name"),
      getLiquidity(),
      listClientOptions(),
    ]);
    if (entriesRes.error) return fail(entriesRes.error);
    if (paymentsRes.error) return fail(paymentsRes.error);
    if (teamRes.error) return fail(teamRes.error);
    if (!liquidity) return { success: false, error: "The expenses and income table doesn't exist yet.", missingTable: true };

    type PaymentJoin = { id: string; amount: number; paid_on: string; invoice_id: string; invoices: { number: string; client_name: string; client_id: string | null; currency: string } };

    return {
      success: true,
      entries: ((entriesRes.data ?? []) as FinanceEntryRow[]).map((entry) => ({ ...entry, amount: Number(entry.amount) })),
      payments: ((paymentsRes.data ?? []) as unknown as PaymentJoin[]).map((payment) => ({
        id: payment.id,
        amount: Number(payment.amount),
        paid_on: payment.paid_on,
        invoice_id: payment.invoice_id,
        invoice_number: payment.invoices.number,
        client_id: payment.invoices.client_id,
        client_name: payment.invoices.client_name,
        currency: payment.invoices.currency,
      })),
      liquidity,
      team: (teamRes.data ?? []) as TeamOption[],
      clients: options.clients,
      projects: options.projects,
      me: admin.id,
    };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFinanceEntry(input: unknown): Promise<Result<{ id: string }>> {
  try {
    const parsed = sanitizeEntry(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { entry } = parsed;
    const row = entryToRow(entry);

    const supabase = await requireAdmin();
    const query = entry.id
      ? supabase.from("finance_entries").update(row).eq("id", entry.id).select("id, client_id").maybeSingle()
      : supabase.from("finance_entries").insert(row).select("id, client_id").single();
    const { data, error } = await query;
    if (error) return fail(error);
    if (!data) return { success: false, error: "Entry not found — it may have been deleted." };

    refresh(data.client_id as string | null);
    return { success: true, id: data.id as string };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFinanceEntry(id: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("finance_entries").delete().eq("id", id).select("client_id").maybeSingle();
    if (error) return fail(error);
    refresh(data?.client_id as string | null);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
