"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Clock,
  FolderKanban,
  ListTodo,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  Wallet,
} from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, ErrorBanner, Modal, PageHeader, ProgressBar, StatCard, buttonClass } from "@/components/admin/ui";
import InvoiceStatusBadge from "@/components/admin/invoice/InvoiceStatusBadge";
import { MoneyStack } from "@/components/admin/money";
import { CLIENT_STATUS_TONE, PROJECT_STATUS_TONE } from "@/components/admin/status";
import {
  CLIENT_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  clientName,
  clientToInvoiceClient,
  type ClientOption,
  type ProjectInput,
  type ProjectOption,
  type ProjectRow,
} from "@/lib/clients";
import { formatDate } from "@/lib/dates";
import { emptyEntry, entryToInput, sumByCurrency, type FinanceEntryInput } from "@/lib/finance";
import { formatMoney, invoiceBalance } from "@/lib/invoices";
import { emptyTodo, todoToInput, type TodoInput, type TodoRow } from "@/lib/todos";
import { cn } from "@/lib/utils";
import EntryModal from "../finance/ledger/EntryModal";
import TodoModal from "../todos/TodoModal";
import { TodoListItem } from "../todos/TodosBoard";
import { setTodoStatus } from "../todos/actions";
import ClientModal from "./ClientModal";
import ProjectModal from "./ProjectModal";
import { deleteClient, setClientStatus, type Client360 } from "./actions";

const TABS = ["projects", "invoices", "todos", "money"] as const;
type Tab = (typeof TABS)[number];

const projectInput = (project: ProjectRow): ProjectInput => ({
  id: project.id,
  client_id: project.client_id,
  name: project.name,
  description: project.description,
  status: project.status,
  start_date: project.start_date ?? "",
  due_date: project.due_date ?? "",
  value: project.value,
  currency: project.currency,
});

/** Shown in a tab whose migration hasn't been run yet. */
function NotReady({ what, file }: { what: string; file: string }) {
  return (
    <p className="px-5 py-10 text-center text-xs leading-relaxed text-stone-500">
      {what} will appear here once{" "}
      <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-800">{file}</code> has been run in Supabase.
    </p>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="whitespace-pre-line break-words text-sm text-stone-800">{children}</dd>
    </div>
  );
}

export default function ClientDetail({ data, today }: { data: Client360; today: string }) {
  const router = useRouter();
  const { client, projects, invoices, todos, entries, team, me, ready } = data;
  const name = clientName(client);

  const [tab, setTab] = useState<Tab>("projects");
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [project, setProject] = useState<ProjectInput | null>(null);
  const [todo, setTodo] = useState<TodoInput | null>(null);
  const [entry, setEntry] = useState<FinanceEntryInput | null>(null);
  const [pendingTodo, setPendingTodo] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();

  // The pickers inside the modals only ever need this client and its projects
  const clientOptions = useMemo<ClientOption[]>(
    () => [{ id: client.id, name, status: client.status, default_currency: client.default_currency, billing: clientToInvoiceClient(client) }],
    [client, name]
  );
  const projectOptions = useMemo<ProjectOption[]>(
    () => projects.map((p) => ({ id: p.id, client_id: p.client_id, name: p.name, status: p.status, currency: p.currency })),
    [projects]
  );
  const names = useMemo(() => new Map(team.map((member) => [member.id, member.full_name])), [team]);
  const projectNames = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  // Drafts and void invoices aren't money
  const issued = invoices.filter((inv) => inv.status === "sent" || inv.status === "paid");
  const invoiced = sumByCurrency(issued, (inv) => inv.currency, (inv) => inv.total);
  const collected = sumByCurrency(issued, (inv) => inv.currency, (inv) => inv.amount_paid);
  const outstanding = sumByCurrency(issued.filter((inv) => inv.status === "sent"), (inv) => inv.currency, invoiceBalance);
  const costs = sumByCurrency(entries.filter((e) => e.type === "expense"), (e) => e.currency, (e) => e.amount);

  const openTodos = todos.filter((t) => t.status !== "done");
  const sortedTodos = [...openTodos, ...todos.filter((t) => t.status === "done")];

  const counts: Record<Tab, number> = { projects: projects.length, invoices: invoices.length, todos: openTodos.length, money: entries.length };
  const TAB_LABELS: Record<Tab, string> = { projects: "Projects", invoices: "Invoices", todos: "To-dos", money: "Costs & income" };

  const refresh = () => router.refresh();

  const toggleArchive = () => {
    setError(null);
    startBusy(async () => {
      const res = await setClientStatus(client.id, client.status === "active" ? "archived" : "active");
      if (!res.success) setError(res.error);
      else refresh();
    });
  };

  const remove = () => {
    setError(null);
    startBusy(async () => {
      const res = await deleteClient(client.id);
      if (!res.success) {
        setError(res.error);
        setConfirmDelete(false);
      } else router.push("/admin/clients");
    });
  };

  const toggleTodo = (item: TodoRow) => {
    setError(null);
    setPendingTodo(item.id);
    startBusy(async () => {
      const res = await setTodoStatus(item.id, item.status === "done" ? "todo" : "done");
      setPendingTodo(null);
      if (!res.success) setError(res.error);
      else refresh();
    });
  };

  const newInvoiceHref = `/admin/finance/invoices/new?client=${client.id}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 rounded text-xs font-medium text-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clients
        </Link>
        <div className="mt-1">
          <PageHeader
            title={name}
            description={[client.company && client.contact_name, client.country].filter(Boolean).join(" · ") || undefined}
            action={
              <>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
                <Button variant="secondary" size="sm" onClick={toggleArchive} disabled={busy}>
                  {client.status === "active" ? <Archive className="h-3.5 w-3.5" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
                  {client.status === "active" ? "Archive" : "Restore"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEditingClient(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Link href={newInvoiceHref} className={buttonClass("primary")}>
                  <Plus className="h-4 w-4" />
                  New invoice
                </Link>
              </>
            }
          />
        </div>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invoiced" value={<MoneyStack lines={invoiced} />} icon={ReceiptText} hint={`${issued.length} invoice${issued.length === 1 ? "" : "s"} sent`} />
        <StatCard label="Collected" value={<MoneyStack lines={collected} />} icon={Banknote} hint="Payments received" />
        <StatCard label="Still to collect" value={<MoneyStack lines={outstanding} />} icon={Clock} emphasis hint="Unpaid balance on sent invoices" />
        <StatCard label="Costs recorded" value={<MoneyStack lines={costs} />} icon={Wallet} hint="Expenses logged against this client" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* ── Who they are ── */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-stone-900">Details</h2>
            <Badge tone={CLIENT_STATUS_TONE[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
          </div>
          <dl className="mt-4 flex flex-col gap-3.5">
            {client.company && <Detail label="Company">{client.company}</Detail>}
            {client.contact_name && <Detail label="Contact">{client.contact_name}</Detail>}
            {client.email && (
              <Detail label="Email">
                <a href={`mailto:${client.email}`} className="text-gold-700 underline-offset-4 hover:underline">
                  {client.email}
                </a>
              </Detail>
            )}
            {client.phone && (
              <Detail label="Phone">
                <a href={`tel:${client.phone.replace(/\s+/g, "")}`} className="text-gold-700 underline-offset-4 hover:underline">
                  {client.phone}
                </a>
              </Detail>
            )}
            {(client.address || client.country) && <Detail label="Address">{[client.address, client.country].filter(Boolean).join("\n")}</Detail>}
            {client.website && <Detail label="Website">{client.website}</Detail>}
            {client.tax_id && <Detail label="Tax registration no.">{client.tax_id}</Detail>}
            <Detail label="Usually billed in">{client.default_currency}</Detail>
            <Detail label="Client since">{formatDate(client.created_at.slice(0, 10))}</Detail>
            {client.notes && <Detail label="Notes">{client.notes}</Detail>}
          </dl>
        </Card>

        {/* ── Everything done for them ── */}
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
              {TABS.map((t) => (
                <Chip key={t} selected={tab === t} onClick={() => setTab(t)}>
                  {TAB_LABELS[t]}
                  <span className="ml-1.5 tabular-nums text-stone-400">{counts[t]}</span>
                </Chip>
              ))}
            </div>
            <div className="flex shrink-0 gap-2">
              {tab === "projects" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setProject({ client_id: client.id, name: "", description: "", status: "active", start_date: today, due_date: "", value: 0, currency: client.default_currency })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add project
                </Button>
              )}
              {tab === "invoices" && (
                <Link href={newInvoiceHref} className={buttonClass("secondary", "sm")}>
                  <Plus className="h-3.5 w-3.5" />
                  New invoice
                </Link>
              )}
              {tab === "todos" && ready.todos && (
                <Button variant="secondary" size="sm" onClick={() => setTodo(emptyTodo({ client_id: client.id, assignee_id: me }))}>
                  <Plus className="h-3.5 w-3.5" />
                  Add to-do
                </Button>
              )}
              {tab === "money" && ready.ledger && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setEntry(emptyEntry({ type: "income", client_id: client.id, currency: client.default_currency }))}>
                    <Plus className="h-3.5 w-3.5" />
                    Income
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEntry(emptyEntry({ type: "expense", client_id: client.id, currency: client.default_currency }))}>
                    <Plus className="h-3.5 w-3.5" />
                    Expense
                  </Button>
                </>
              )}
            </div>
          </div>

          {tab === "projects" &&
            (projects.length === 0 ? (
              <EmptyState icon={FolderKanban} title="No projects yet" description="Add the work you're doing for this client — deadlines show on the dashboard calendar." />
            ) : (
              <ul className="divide-y divide-stone-200">
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setProject(projectInput(p))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-stone-900">{p.name}</span>
                        <span className="block truncate text-xs text-stone-500">
                          {p.start_date || p.due_date
                            ? `${p.start_date ? formatDate(p.start_date) : "No start date"} → ${p.due_date ? formatDate(p.due_date) : "no deadline"}`
                            : "No dates set"}
                          {p.description && ` · ${p.description.split("\n")[0]}`}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {p.value > 0 && <span className="text-sm font-medium tabular-nums text-stone-900">{formatMoney(p.value, p.currency)}</span>}
                        <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "invoices" &&
            (invoices.length === 0 ? (
              ready.invoices ? (
                <EmptyState icon={ReceiptText} title="No invoices for this client yet" description="Start one from here and their details are filled in for you." />
              ) : (
                <NotReady what="This client's invoices" file="supabase/migrations/20260930130000_invoice_payments.sql" />
              )
            ) : (
              <ul className="divide-y divide-stone-200">
                {invoices.map((inv) => {
                  const counted = inv.status === "sent" || inv.status === "paid";
                  return (
                    <li key={inv.id}>
                      <Link
                        href={`/admin/finance/invoices/${inv.id}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors duration-150 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 sm:grid-cols-[minmax(0,1fr)_160px_auto]"
                      >
                        <span className="min-w-0">
                          <span className="block font-mono text-[13px] font-medium text-stone-900">{inv.number}</span>
                          <span className="block text-xs text-stone-500">
                            Issued {formatDate(inv.issue_date)}
                            {inv.due_date && ` · due ${formatDate(inv.due_date)}`}
                          </span>
                        </span>
                        <span className="hidden flex-col gap-1 sm:flex">
                          {counted && (
                            <>
                              <ProgressBar value={inv.amount_paid} max={inv.total} label={`Paid on invoice ${inv.number}`} />
                              <span className="text-xs tabular-nums text-stone-500">
                                {invoiceBalance(inv) <= 0 ? "Paid in full" : `${formatMoney(invoiceBalance(inv), inv.currency)} left`}
                              </span>
                            </>
                          )}
                        </span>
                        <span className="flex items-center gap-3">
                          <InvoiceStatusBadge invoice={inv} today={today} />
                          <span className="text-sm font-medium tabular-nums text-stone-900">{formatMoney(inv.total, inv.currency)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "todos" &&
            (!ready.todos ? (
              <NotReady what="To-dos for this client" file="supabase/migrations/20260930120000_todos.sql" />
            ) : todos.length === 0 ? (
              <EmptyState icon={ListTodo} title="No to-dos for this client" description="Add one and assign it to someone on the team." />
            ) : (
              <ul className="divide-y divide-stone-200">
                {sortedTodos.map((item) => (
                  <TodoListItem
                    key={item.id}
                    todo={item}
                    today={today}
                    assignee={item.assignee_id ? names.get(item.assignee_id) : undefined}
                    context={item.project_id ? projectNames.get(item.project_id) : undefined}
                    pending={pendingTodo === item.id}
                    onToggle={() => toggleTodo(item)}
                    onOpen={() => setTodo(todoToInput(item))}
                  />
                ))}
              </ul>
            ))}

          {tab === "money" &&
            (!ready.ledger ? (
              <NotReady what="Costs and income recorded against this client" file="supabase/migrations/20260930140000_finance_entries.sql" />
            ) : entries.length === 0 ? (
              <EmptyState icon={Wallet} title="Nothing recorded against this client" description="Log what a project cost you here. Invoice payments are tracked on the Invoices tab." />
            ) : (
              <ul className="divide-y divide-stone-200">
                {entries.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setEntry(entryToInput(e))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-stone-900">{e.description}</span>
                        <span className="block truncate text-xs text-stone-500">
                          {formatDate(e.entry_date)} · {e.category}
                          {e.project_id && projectNames.get(e.project_id) && ` · ${projectNames.get(e.project_id)}`}
                        </span>
                      </span>
                      <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums", e.type === "income" ? "text-stone-900" : "text-stone-600")}>
                        {e.type === "income" ? <ArrowDownLeft className="h-3.5 w-3.5 text-gold-600" /> : <ArrowUpRight className="h-3.5 w-3.5 text-stone-400" />}
                        {e.type === "income" ? "+" : "−"}
                        {formatMoney(e.amount, e.currency)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </Card>
      </div>

      {editingClient && (
        <ClientModal
          initial={client}
          onClose={() => setEditingClient(false)}
          onSaved={() => {
            setEditingClient(false);
            refresh();
          }}
        />
      )}

      {project && (
        <ProjectModal
          key={project.id ?? "new"}
          initial={project}
          clientName={name}
          onClose={() => setProject(null)}
          onSaved={() => {
            setProject(null);
            refresh();
          }}
        />
      )}

      {todo && (
        <TodoModal
          key={todo.id ?? "new"}
          initial={todo}
          team={team}
          clients={clientOptions}
          projects={projectOptions}
          lockClient
          onClose={() => setTodo(null)}
          onSaved={() => {
            setTodo(null);
            refresh();
          }}
        />
      )}

      {entry && (
        <EntryModal
          key={entry.id ?? `new-${entry.type}`}
          initial={entry}
          team={team}
          clients={clientOptions}
          projects={projectOptions}
          lockClient
          onClose={() => setEntry(null)}
          onSaved={() => {
            setEntry(null);
            refresh();
          }}
        />
      )}

      {confirmDelete && (
        <Modal
          title={`Delete ${name}?`}
          description="Their invoices, to-dos and ledger entries are kept but no longer linked to a client. A client with projects can't be deleted — archive it instead."
          onClose={() => setConfirmDelete(false)}
          className="max-w-md"
        >
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep client
            </Button>
            <Button variant="danger" onClick={remove} disabled={busy}>
              {busy ? "Deleting…" : "Delete client"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
