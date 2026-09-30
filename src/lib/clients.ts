/** Clients 360 — shared types and validation for clients and their projects. */
import { isIsoDate } from "@/lib/dates";
import type { InvoiceClient } from "@/lib/invoices";
import { cleanAmount, cleanText, oneOf, uuidOrNull } from "@/lib/sanitize";

/* ── Clients ────────────────────────────────────────────────────────────── */

export const CLIENT_STATUSES = ["active", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = { active: "Active", archived: "Archived" };

export interface ClientRow {
  id: string;
  created_at: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  website: string;
  tax_id: string;
  default_currency: string;
  status: ClientStatus;
  notes: string;
}

export const CLIENT_COLUMNS =
  "id, created_at, company, contact_name, email, phone, address, country, website, tax_id, default_currency, status, notes";

export type ClientInput = Omit<ClientRow, "id" | "created_at"> & { id?: string };

export const emptyClientInput = (): ClientInput => ({
  company: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  website: "",
  tax_id: "",
  default_currency: "AED",
  status: "active",
  notes: "",
});

/** What a client is called in lists and pickers: the company, else the person. */
export const clientName = (client: Pick<ClientRow, "company" | "contact_name">) => client.company || client.contact_name || "Unnamed client";

export function sanitizeClient(input: unknown): { client: ClientInput } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const company = cleanText(raw.company, 120);
  const contact_name = cleanText(raw.contact_name, 120);
  if (!company && !contact_name) return { error: "Enter a company or a contact name." };

  const default_currency = cleanText(raw.default_currency, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(default_currency)) return { error: "Pick a currency." };

  return {
    client: {
      id: uuidOrNull(raw.id) ?? undefined,
      company,
      contact_name,
      email: cleanText(raw.email, 254),
      phone: cleanText(raw.phone, 40),
      address: cleanText(raw.address, 400),
      country: cleanText(raw.country, 60),
      website: cleanText(raw.website, 200),
      tax_id: cleanText(raw.tax_id, 40),
      default_currency,
      status: oneOf(raw.status, CLIENT_STATUSES, "active"),
      notes: cleanText(raw.notes, 4000),
    },
  };
}

/** The "Billed to" block of an invoice, filled from a saved client. */
export const clientToInvoiceClient = (client: ClientRow): InvoiceClient => ({
  name: client.contact_name,
  company: client.company,
  email: client.email,
  phone: client.phone,
  address: [client.address, client.country].filter(Boolean).join("\n"),
  taxId: client.tax_id,
});

/* ── Projects ───────────────────────────────────────────────────────────── */

export const PROJECT_STATUSES = ["planned", "active", "on_hold", "completed", "cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  active: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Still being worked on — its deadline belongs on the calendar. */
export const isOpenProject = (status: ProjectStatus) => status === "planned" || status === "active" || status === "on_hold";

export interface ProjectRow {
  id: string;
  created_at: string;
  client_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string | null;
  due_date: string | null;
  value: number;
  currency: string;
}

export const PROJECT_COLUMNS = "id, created_at, client_id, name, description, status, start_date, due_date, value, currency";

export interface ProjectInput {
  id?: string;
  client_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  due_date: string;
  value: number;
  currency: string;
}

export function sanitizeProject(input: unknown): { project: ProjectInput } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const client_id = uuidOrNull(raw.client_id);
  if (!client_id) return { error: "Pick the client this project is for." };
  const name = cleanText(raw.name, 160);
  if (!name) return { error: "Give the project a name." };

  const start_date = isIsoDate(raw.start_date) ? raw.start_date : "";
  const due_date = isIsoDate(raw.due_date) ? raw.due_date : "";
  if (start_date && due_date && due_date < start_date) return { error: "The deadline can't be before the start date." };

  const currency = cleanText(raw.currency, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Pick a currency." };

  return {
    project: {
      id: uuidOrNull(raw.id) ?? undefined,
      client_id,
      name,
      description: cleanText(raw.description, 4000),
      status: oneOf(raw.status, PROJECT_STATUSES, "active"),
      start_date,
      due_date,
      value: Math.round(cleanAmount(raw.value) * 100) / 100,
      currency,
    },
  };
}

/* ── Pickers ────────────────────────────────────────────────────────────── */

/** A client as the invoice editor, to-dos and the ledger need it. */
export interface ClientOption {
  id: string;
  name: string;
  status: ClientStatus;
  default_currency: string;
  /** Ready to drop into an invoice's "Billed to" block */
  billing: InvoiceClient;
}

export interface ProjectOption {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  currency: string;
}
