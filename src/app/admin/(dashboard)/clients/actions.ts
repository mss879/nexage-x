"use server";

import { revalidatePath } from "next/cache";
import { isMissingColumn, isMissingTable, makeFail, type Result } from "@/lib/action-result";
import { requireAdmin, requireAdminContext } from "@/lib/admin-auth";
import {
  CLIENT_COLUMNS,
  CLIENT_STATUSES,
  PROJECT_COLUMNS,
  clientName,
  clientToInvoiceClient,
  sanitizeClient,
  sanitizeProject,
  type ClientOption,
  type ClientRow,
  type ClientStatus,
  type ProjectOption,
  type ProjectRow,
} from "@/lib/clients";
import { FINANCE_ENTRY_COLUMNS, type FinanceEntryRow } from "@/lib/finance";
import { INVOICE_SUMMARY_COLUMNS, type InvoiceSummaryRow } from "@/lib/invoices";
import { isUuid } from "@/lib/sanitize";
import type { TeamOption } from "@/lib/team";
import { TODO_COLUMNS, type TodoRow } from "@/lib/todos";

const fail = makeFail({
  missing: "The clients table doesn't exist yet.",
  inUse: "This client still has projects. Archive the client instead, or delete its projects first.",
});

const refresh = (clientId?: string) => {
  revalidatePath("/admin/clients");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
};

/** A later migration hasn't been run yet — that part of the page is simply empty. */
const notReady = (error: unknown) => isMissingTable(error) || isMissingColumn(error);

const numeric = <T extends { total?: number; amount_paid?: number; amount?: number; value?: number }>(row: T): T => ({
  ...row,
  ...(row.total !== undefined && { total: Number(row.total) }),
  ...(row.amount_paid !== undefined && { amount_paid: Number(row.amount_paid) }),
  ...(row.amount !== undefined && { amount: Number(row.amount) }),
  ...(row.value !== undefined && { value: Number(row.value) }),
});

/** What the clients list shows next to each name. */
export interface ClientListItem extends ClientRow {
  projects: number;
  openProjects: number;
  invoiced: { currency: string; amount: number }[];
  outstanding: { currency: string; amount: number }[];
}

export async function listClients(): Promise<Result<{ clients: ClientListItem[] }>> {
  try {
    const supabase = await requireAdmin();
    const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
      supabase.from("clients").select(CLIENT_COLUMNS).order("company").order("contact_name").limit(1000),
      supabase.from("projects").select("client_id, status").limit(5000),
      supabase.from("invoices").select("client_id, status, currency, total, amount_paid").not("client_id", "is", null).limit(5000),
    ]);
    if (clientsRes.error) return fail(clientsRes.error);
    if (projectsRes.error) return fail(projectsRes.error);
    if (invoicesRes.error && !notReady(invoicesRes.error)) return fail(invoicesRes.error);

    const add = (map: Map<string, Map<string, number>>, client: string, currency: string, amount: number) => {
      const totals = map.get(client) ?? new Map<string, number>();
      totals.set(currency, (totals.get(currency) ?? 0) + amount);
      map.set(client, totals);
    };
    const invoiced = new Map<string, Map<string, number>>();
    const outstanding = new Map<string, Map<string, number>>();
    for (const inv of invoicesRes.data ?? []) {
      // Drafts and void invoices aren't money yet
      if (inv.status !== "sent" && inv.status !== "paid") continue;
      add(invoiced, inv.client_id, inv.currency, Number(inv.total));
      if (inv.status === "sent") add(outstanding, inv.client_id, inv.currency, Math.max(Number(inv.total) - Number(inv.amount_paid), 0));
    }
    const lines = (totals?: Map<string, number>) =>
      [...(totals ?? [])].filter(([, amount]) => amount > 0).map(([currency, amount]) => ({ currency, amount }));

    const clients = ((clientsRes.data ?? []) as ClientRow[]).map((client) => {
      const projects = (projectsRes.data ?? []).filter((p) => p.client_id === client.id);
      return {
        ...client,
        projects: projects.length,
        openProjects: projects.filter((p) => p.status === "planned" || p.status === "active" || p.status === "on_hold").length,
        invoiced: lines(invoiced.get(client.id)),
        outstanding: lines(outstanding.get(client.id)),
      };
    });
    return { success: true, clients };
  } catch (error) {
    return fail(error);
  }
}

export interface Client360 {
  client: ClientRow;
  projects: ProjectRow[];
  invoices: InvoiceSummaryRow[];
  todos: TodoRow[];
  entries: FinanceEntryRow[];
  team: TeamOption[];
  me: string;
  /** false while that part's migration hasn't been run */
  ready: { invoices: boolean; todos: boolean; ledger: boolean };
}

/** Everything known about one client, in one round trip. */
export async function getClient360(id: string): Promise<Result<Client360>> {
  try {
    if (!isUuid(id)) return { success: false, error: "Client not found." };
    const { supabase, admin } = await requireAdminContext();

    const [clientRes, projectsRes, invoicesRes, todosRes, entriesRes, teamRes] = await Promise.all([
      supabase.from("clients").select(CLIENT_COLUMNS).eq("id", id).maybeSingle(),
      supabase.from("projects").select(PROJECT_COLUMNS).eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("invoices").select(INVOICE_SUMMARY_COLUMNS).eq("client_id", id).order("issue_date", { ascending: false }).limit(1000),
      supabase.from("todos").select(TODO_COLUMNS).eq("client_id", id).order("due_date", { ascending: true, nullsFirst: false }).limit(500),
      supabase.from("finance_entries").select(FINANCE_ENTRY_COLUMNS).eq("client_id", id).order("entry_date", { ascending: false }).limit(1000),
      supabase.from("team_members").select("id, full_name, active").order("full_name"),
    ]);
    if (clientRes.error) return fail(clientRes.error);
    if (!clientRes.data) return { success: false, error: "Client not found." };
    if (projectsRes.error) return fail(projectsRes.error);
    for (const res of [invoicesRes, todosRes, entriesRes, teamRes]) {
      if (res.error && !notReady(res.error)) return fail(res.error);
    }

    return {
      success: true,
      client: clientRes.data as ClientRow,
      projects: ((projectsRes.data ?? []) as ProjectRow[]).map(numeric),
      invoices: ((invoicesRes.data ?? []) as unknown as InvoiceSummaryRow[]).map(numeric),
      todos: (todosRes.data ?? []) as TodoRow[],
      entries: ((entriesRes.data ?? []) as FinanceEntryRow[]).map(numeric),
      team: (teamRes.data ?? []) as TeamOption[],
      me: admin.id,
      ready: { invoices: !invoicesRes.error, todos: !todosRes.error, ledger: !entriesRes.error },
    };
  } catch (error) {
    return fail(error);
  }
}

export async function saveClient(input: unknown): Promise<Result<{ id: string }>> {
  try {
    const parsed = sanitizeClient(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { id, ...row } = parsed.client;

    const supabase = await requireAdmin();
    const query = id
      ? supabase.from("clients").update(row).eq("id", id).select("id").maybeSingle()
      : supabase.from("clients").insert(row).select("id").single();
    const { data, error } = await query;
    if (error) return fail(error);
    if (!data) return { success: false, error: "Client not found — it may have been deleted." };

    refresh(data.id);
    return { success: true, id: data.id as string };
  } catch (error) {
    return fail(error);
  }
}

export async function setClientStatus(id: string, status: ClientStatus): Promise<Result> {
  try {
    if (!isUuid(id) || !CLIENT_STATUSES.includes(status)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("clients").update({ status }).eq("id", id);
    if (error) return fail(error);
    refresh(id);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/** Refused by the database while the client still has projects. Invoices, to-dos and ledger entries are only unlinked. */
export async function deleteClient(id: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return fail(error);
    refresh();
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function saveProject(input: unknown): Promise<Result<{ id: string }>> {
  try {
    const parsed = sanitizeProject(input);
    if ("error" in parsed) return { success: false, error: parsed.error };
    const { id, ...project } = parsed.project;
    const row = { ...project, start_date: project.start_date || null, due_date: project.due_date || null };

    const supabase = await requireAdmin();
    const query = id
      ? supabase.from("projects").update(row).eq("id", id).select("id").maybeSingle()
      : supabase.from("projects").insert(row).select("id").single();
    const { data, error } = await query;
    if (error) return makeFail({ missing: "The projects table doesn't exist yet.", inUse: "That client no longer exists." })(error);
    if (!data) return { success: false, error: "Project not found — it may have been deleted." };

    refresh(project.client_id);
    revalidatePath("/admin");
    return { success: true, id: data.id as string };
  } catch (error) {
    return fail(error);
  }
}

/** Its invoices, to-dos and ledger entries stay with the client; only the link to the project is dropped. */
export async function deleteProject(id: string): Promise<Result> {
  try {
    if (!isUuid(id)) return { success: false, error: "Invalid request." };
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("projects").delete().eq("id", id).select("client_id").maybeSingle();
    if (error) return fail(error);
    refresh(data?.client_id as string | undefined);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Clients and projects for pickers (invoice editor, to-dos, ledger). Never
 * fails the page it's used on: before the clients migration it is just empty.
 */
export async function listClientOptions(): Promise<{ ready: boolean; clients: ClientOption[]; projects: ProjectOption[] }> {
  try {
    const supabase = await requireAdmin();
    const [clientsRes, projectsRes] = await Promise.all([
      supabase.from("clients").select(CLIENT_COLUMNS).order("company").order("contact_name").limit(1000),
      supabase.from("projects").select("id, client_id, name, status, currency").order("name").limit(2000),
    ]);
    if (clientsRes.error || projectsRes.error) return { ready: false, clients: [], projects: [] };

    return {
      ready: true,
      clients: ((clientsRes.data ?? []) as ClientRow[]).map((client) => ({
        id: client.id,
        name: clientName(client),
        status: client.status,
        default_currency: client.default_currency,
        billing: clientToInvoiceClient(client),
      })),
      projects: (projectsRes.data ?? []) as ProjectOption[],
    };
  } catch {
    return { ready: false, clients: [], projects: [] };
  }
}
