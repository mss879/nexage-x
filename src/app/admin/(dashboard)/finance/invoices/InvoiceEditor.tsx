"use client";

import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Copy, Plus, Printer, Save, Trash2, UserPlus } from "lucide-react";
import { Button, Card, Chip, ErrorBanner, Field, Input, Modal, Select, Textarea, buttonClass } from "@/components/admin/ui";
import InvoiceSheet, { SHEET_HEIGHT, SHEET_WIDTH } from "@/components/admin/invoice/InvoiceSheet";
import InvoiceStatusBadge from "@/components/admin/invoice/InvoiceStatusBadge";
import { CurrencyPicker } from "@/components/admin/money";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  MAX_INVOICE_ITEMS,
  computeTotals,
  formatMoney,
  lineAmount,
  todayInDubai,
  type DiscountType,
  type InvoiceClient,
  type InvoiceDraft,
  type InvoicePayment,
  type InvoicePaymentState,
  type InvoiceSeller,
  type InvoiceStatus,
} from "@/lib/invoices";
import { cn } from "@/lib/utils";
import { saveClient } from "../../clients/actions";
import PaymentsPanel from "./PaymentsPanel";
import { deleteInvoice, saveInvoice } from "./actions";

/* Numbers are edited as text so "1." or an empty box never fights the keyboard. */
interface FormItem {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface FormState extends Omit<InvoiceDraft, "items" | "discountValue" | "taxRate"> {
  items: FormItem[];
  discountValue: string;
  taxRate: string;
}

const num = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toForm = (draft: InvoiceDraft): FormState => ({
  ...draft,
  items: draft.items.map((item, i) => ({
    key: `initial-${i}`,
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: item.unitPrice ? String(item.unitPrice) : "",
  })),
  discountValue: draft.discountValue ? String(draft.discountValue) : "",
  taxRate: String(draft.taxRate),
});

const toDraft = (form: FormState): InvoiceDraft => ({
  ...form,
  items: form.items.map((item) => ({
    description: item.description,
    quantity: num(item.quantity),
    unitPrice: num(item.unitPrice),
  })),
  discountValue: num(form.discountValue),
  taxRate: Math.min(num(form.taxRate), 100),
});

const subscribeNever = () => () => {};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      </div>
      {children}
    </Card>
  );
}

export default function InvoiceEditor({
  initial,
  isNew,
  clients = [],
  projects = [],
  payments: initialPayments = [],
  amountPaid: initialAmountPaid = 0,
  paymentsReady = false,
  clientsReady = false,
}: {
  initial: InvoiceDraft;
  isNew: boolean;
  /** Saved clients and their projects, for "Billed to". Empty until the clients migration has been run. */
  clients?: ClientOption[];
  projects?: ProjectOption[];
  payments?: InvoicePayment[];
  amountPaid?: number;
  /** Part payments can be recorded (the payments migration has been run) */
  paymentsReady?: boolean;
  /** The clients table exists, so "Billed to" can be saved as a client */
  clientsReady?: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [clientOptions, setClientOptions] = useState(clients);
  const [payments, setPayments] = useState(initialPayments);
  // What the database holds: payments are measured against the saved total, not the one being typed
  const [money, setMoney] = useState(() => ({ amountPaid: initialAmountPaid, total: computeTotals(initial).total }));
  const [savingClient, startSavingClient] = useTransition();
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(toForm(initial)));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [sellerOpen, setSellerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const itemKey = useRef(0);
  const isClient = useSyncExternalStore(subscribeNever, () => true, () => false);

  const draft = useMemo(() => toDraft(form), [form]);
  const totals = useMemo(() => computeTotals(draft), [draft]);
  const dirty = isNew || JSON.stringify(form) !== savedSnapshot;

  /* ── Preview scaling: the A4 sheet is a fixed 794px, scaled to fit its pane ── */
  const paneRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT);

  useEffect(() => {
    const pane = paneRef.current;
    const sheet = sheetRef.current;
    if (!pane || !sheet) return;
    const ro = new ResizeObserver(() => {
      if (pane.clientWidth > 0) setScale(Math.min(1, pane.clientWidth / SHEET_WIDTH));
      if (sheet.offsetHeight > 0) setSheetHeight(sheet.offsetHeight);
    });
    ro.observe(pane);
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  /* ── Don't lose work to a stray tab close ── */
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* ── State helpers ── */
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setClient = (key: keyof InvoiceClient, value: string) => setForm((f) => ({ ...f, client: { ...f.client, [key]: value } }));
  const setSeller = (key: keyof InvoiceSeller, value: string) => setForm((f) => ({ ...f, seller: { ...f.seller, [key]: value } }));
  const setItem = (key: string, patch: Partial<FormItem>) =>
    setForm((f) => ({ ...f, items: f.items.map((item) => (item.key === key ? { ...item, ...patch } : item)) }));
  const addItem = () => {
    itemKey.current += 1;
    const key = `added-${itemKey.current}`;
    setForm((f) => ({ ...f, items: [...f.items, { key, description: "", quantity: "1", unitPrice: "" }] }));
  };
  const removeItem = (key: string) => setForm((f) => ({ ...f, items: f.items.filter((item) => item.key !== key) }));

  const setStatus = (status: InvoiceStatus) =>
    setForm((f) => ({ ...f, status, paidAt: status === "paid" ? f.paidAt || todayInDubai() : "" }));

  /* ── Saved clients ── */
  const linkedClient = clientOptions.find((client) => client.id === form.clientId);
  const clientProjects = projects.filter((project) => project.client_id === form.clientId);
  const hasPayments = money.amountPaid > 0;

  const pickClient = (clientId: string) => {
    const client = clientOptions.find((c) => c.id === clientId);
    setForm((f) =>
      client
        ? {
            ...f,
            clientId,
            projectId: "",
            client: client.billing,
            // Bill them in their usual currency — unless money has already been received in this one
            currency: hasPayments ? f.currency : client.default_currency,
          }
        : { ...f, clientId: "", projectId: "" }
    );
  };

  /** Keep what was typed into "Billed to" as a client, so the next invoice can just pick them. */
  const saveAsClient = () => {
    setError(null);
    startSavingClient(async () => {
      const { client } = form;
      const res = await saveClient({
        company: client.company,
        contact_name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        tax_id: client.taxId,
        default_currency: form.currency,
        status: "active",
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setClientOptions((options) => [
        ...options,
        { id: res.id, name: client.company || client.name, status: "active", default_currency: form.currency, billing: client },
      ]);
      setForm((f) => ({ ...f, clientId: res.id, projectId: "" }));
    });
  };

  /** The database decides status and amount paid (see the payments migration) — show what it decided. */
  const applyServerState = (state: InvoicePaymentState, nextPayments: InvoicePayment[] | null, savedForm?: FormState) => {
    const patch = { status: state.status, paidAt: state.paidAt };
    // After a save the whole form is what's stored; after a payment only these two fields changed
    setSavedSnapshot((snapshot) => JSON.stringify({ ...(savedForm ?? (JSON.parse(snapshot) as FormState)), ...patch }));
    setForm((f) => ({ ...f, ...patch }));
    setMoney({ amountPaid: state.amountPaid, total: state.total });
    if (nextPayments) setPayments(nextPayments);
  };

  /* ── Actions ── */
  const handleSave = () => {
    setError(null);
    startSaving(async () => {
      const res = await saveInvoice(draft);
      if (!res.success) {
        setError(res.error);
        return;
      }
      applyServerState(res.state, res.payments, form);
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      if (isNew) router.replace(`/admin/finance/invoices/${res.id}`);
      else router.refresh();
    });
  };

  const handlePrint = () => {
    // The browser names the saved PDF after the page title
    const previous = document.title;
    document.title = `Invoice ${form.number || "draft"}${draft.client.company || draft.client.name ? ` — ${draft.client.company || draft.client.name}` : ""}`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const handleDelete = () => {
    if (!form.id) return;
    startDeleting(async () => {
      const res = await deleteInvoice(form.id as string);
      if (!res.success) {
        setError(res.error);
        setConfirmDelete(false);
        return;
      }
      router.push("/admin/finance/invoices");
    });
  };

  const id = (name: string) => `${uid}-${name}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-stone-900">
              {isNew ? "Create invoice" : `Invoice ${form.number}`}
            </h1>
            <InvoiceStatusBadge
              invoice={{ status: form.status, due_date: form.dueDate || null, total: money.total, amount_paid: money.amountPaid }}
              today={todayInDubai()}
            />
          </div>
          <p className="mt-1 text-xs text-stone-500" aria-live="polite">
            {isNew
              ? "Fill in the form — the invoice on the right updates as you type."
              : dirty
                ? "Unsaved changes"
                : savedAt
                  ? `Saved at ${savedAt}`
                  : "All changes saved"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew && form.id && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete invoice">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Link href={`/admin/finance/invoices/new?from=${form.id}`} className={buttonClass("secondary", "sm")}>
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Link>
            </>
          )}
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / save PDF
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Small screens: one pane at a time */}
      <div className="flex gap-2 lg:hidden" role="group" aria-label="Show">
        <Chip selected={view === "edit"} onClick={() => setView("edit")}>Edit</Chip>
        <Chip selected={view === "preview"} onClick={() => setView("preview")}>Preview</Chip>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        {/* ── Left: the form ── */}
        <div className={cn("flex-col gap-4", view === "edit" ? "flex" : "hidden lg:flex")}>
          {!isNew && form.id && paymentsReady && (
            <PaymentsPanel
              invoice={{ id: form.id, number: form.number, clientName: form.client.company || form.client.name, currency: form.currency }}
              status={form.status}
              total={money.total}
              amountPaid={money.amountPaid}
              payments={payments}
              dirty={dirty}
              onChange={applyServerState}
            />
          )}

          <Section title="Invoice details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invoice number" htmlFor={id("number")}>
                <Input id={id("number")} value={form.number} maxLength={40} onChange={(e) => set("number", e.target.value)} />
              </Field>
              <Field label="Status" htmlFor={id("status")}>
                <Select id={id("status")} value={form.status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
                  {INVOICE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {INVOICE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Issue date" htmlFor={id("issue")}>
                <Input id={id("issue")} type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
              </Field>
              <Field label="Due date" htmlFor={id("due")}>
                <Input id={id("due")} type="date" value={form.dueDate} min={form.issueDate} onChange={(e) => set("dueDate", e.target.value)} />
              </Field>
              <Field label="Currency" htmlFor={id("currency")} className="col-span-2">
                <CurrencyPicker id={id("currency")} value={form.currency} onChange={(currency) => set("currency", currency)} disabled={hasPayments} />
                <p className="text-xs text-stone-500">
                  {hasPayments
                    ? `Payments have been received in ${form.currency}, so the currency is fixed.`
                    : "Switching currency relabels the amounts — it doesn't convert them."}
                </p>
              </Field>
              {form.status === "paid" && (
                <Field label="Paid on" htmlFor={id("paid")} className="col-span-2">
                  <Input id={id("paid")} type="date" value={form.paidAt} onChange={(e) => set("paidAt", e.target.value)} />
                  {paymentsReady && totals.total > money.amountPaid && (
                    <p className="text-xs text-stone-500">
                      Saving records the {formatMoney(totals.total - money.amountPaid, form.currency)} still owed as a payment on this date.
                    </p>
                  )}
                </Field>
              )}
            </div>
          </Section>

          <Section title="Billed to" hint={clientOptions.length > 0 ? "Pick a saved client to fill this in, or type the details." : undefined}>
            <div className="grid grid-cols-2 gap-3">
              {clientOptions.length > 0 && (
                <Field label="Client" htmlFor={id("c-saved")} className={clientProjects.length > 0 ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                  <Select id={id("c-saved")} value={linkedClient ? form.clientId : ""} onChange={(e) => pickClient(e.target.value)}>
                    <option value="">Not a saved client</option>
                    {clientOptions
                      .filter((client) => client.status === "active" || client.id === form.clientId)
                      .map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {clientProjects.length > 0 && (
                <Field label="Project (optional)" htmlFor={id("c-project")} className="col-span-2 sm:col-span-1">
                  <Select id={id("c-project")} value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                    <option value="">No project</option>
                    {clientProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Company" htmlFor={id("c-company")} className="col-span-2">
                <Input id={id("c-company")} value={form.client.company} maxLength={120} onChange={(e) => setClient("company", e.target.value)} />
              </Field>
              <Field label="Contact name" htmlFor={id("c-name")} className="col-span-2">
                <Input id={id("c-name")} value={form.client.name} maxLength={120} onChange={(e) => setClient("name", e.target.value)} />
              </Field>
              <Field label="Email" htmlFor={id("c-email")}>
                <Input id={id("c-email")} type="email" value={form.client.email} maxLength={254} onChange={(e) => setClient("email", e.target.value)} />
              </Field>
              <Field label="Phone" htmlFor={id("c-phone")}>
                <Input id={id("c-phone")} type="tel" value={form.client.phone} maxLength={40} onChange={(e) => setClient("phone", e.target.value)} />
              </Field>
              <Field label="Address" htmlFor={id("c-address")} className="col-span-2">
                <Textarea id={id("c-address")} rows={2} value={form.client.address} maxLength={400} onChange={(e) => setClient("address", e.target.value)} />
              </Field>
              <Field label="Tax registration no. (optional)" htmlFor={id("c-tax")} className="col-span-2">
                <Input id={id("c-tax")} value={form.client.taxId} maxLength={40} onChange={(e) => setClient("taxId", e.target.value)} />
              </Field>
            </div>
            {clientsReady && !linkedClient && (form.client.company || form.client.name) && (
              <Button variant="secondary" size="sm" onClick={saveAsClient} disabled={savingClient} className="self-start">
                <UserPlus className="h-3.5 w-3.5" />
                {savingClient ? "Saving…" : "Save to clients"}
              </Button>
            )}
          </Section>

          <Section title="Items" hint="First line is the item title — add detail on the lines below it.">
            <ul className="flex flex-col gap-3">
              {form.items.map((item, index) => (
                <li key={item.key} className="flex flex-col gap-2.5 rounded-lg border border-stone-200 bg-stone-50/60 p-3">
                  <Textarea
                    aria-label={`Item ${index + 1} description`}
                    rows={2}
                    placeholder="Shopify storefront — design and build"
                    value={item.description}
                    maxLength={600}
                    onChange={(e) => setItem(item.key, { description: e.target.value })}
                  />
                  <div className="flex items-end gap-2.5">
                    <Field label="Qty" htmlFor={id(`q-${item.key}`)} className="w-20">
                      <Input
                        id={id(`q-${item.key}`)}
                        inputMode="decimal"
                        className="text-right tabular-nums"
                        value={item.quantity}
                        onChange={(e) => setItem(item.key, { quantity: e.target.value.replace(/[^\d.]/g, "") })}
                      />
                    </Field>
                    <Field label={`Rate (${form.currency})`} htmlFor={id(`p-${item.key}`)} className="flex-1">
                      <Input
                        id={id(`p-${item.key}`)}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="text-right tabular-nums"
                        value={item.unitPrice}
                        onChange={(e) => setItem(item.key, { unitPrice: e.target.value.replace(/[^\d.]/g, "") })}
                      />
                    </Field>
                    <div className="flex h-10 min-w-24 flex-1 items-center justify-end text-sm font-medium tabular-nums text-stone-900">
                      {formatMoney(lineAmount({ description: "", quantity: num(item.quantity), unitPrice: num(item.unitPrice) }), form.currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      disabled={form.items.length === 1}
                      aria-label={`Remove item ${index + 1}`}
                      className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" onClick={addItem} disabled={form.items.length >= MAX_INVOICE_ITEMS} className="self-start">
              <Plus className="h-3.5 w-3.5" />
              Add item
            </Button>
          </Section>

          <Section title="Discount and tax">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount" htmlFor={id("discount")}>
                <div className="flex gap-2">
                  <Input
                    id={id("discount")}
                    inputMode="decimal"
                    placeholder="0"
                    className="text-right tabular-nums"
                    value={form.discountValue}
                    onChange={(e) => set("discountValue", e.target.value.replace(/[^\d.]/g, ""))}
                  />
                  <Select
                    aria-label="Discount type"
                    className="w-24 shrink-0"
                    value={form.discountType}
                    onChange={(e) => set("discountType", e.target.value as DiscountType)}
                  >
                    <option value="percent">%</option>
                    <option value="amount">{form.currency}</option>
                  </Select>
                </div>
              </Field>
              <Field label="Tax" htmlFor={id("tax")}>
                <div className="flex gap-2">
                  <Input
                    aria-label="Tax name"
                    className="w-20 shrink-0"
                    value={form.taxLabel}
                    maxLength={20}
                    onChange={(e) => set("taxLabel", e.target.value)}
                  />
                  <div className="relative flex-1">
                    <Input
                      id={id("tax")}
                      inputMode="decimal"
                      className="pr-7 text-right tabular-nums"
                      value={form.taxRate}
                      onChange={(e) => set("taxRate", e.target.value.replace(/[^\d.]/g, ""))}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">%</span>
                  </div>
                </div>
              </Field>
            </div>
            <dl className="flex flex-col gap-1.5 border-t border-stone-200 pt-4 text-sm">
              <div className="flex justify-between text-stone-600">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(totals.subtotal, form.currency)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-stone-600">
                  <dt>Discount</dt>
                  <dd className="tabular-nums">−{formatMoney(totals.discount, form.currency)}</dd>
                </div>
              )}
              {draft.taxRate > 0 && (
                <div className="flex justify-between text-stone-600">
                  <dt>{form.taxLabel || "Tax"}</dt>
                  <dd className="tabular-nums">{formatMoney(totals.tax, form.currency)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 font-semibold text-stone-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(totals.total, form.currency)}</dd>
              </div>
            </dl>
          </Section>

          <Section title="Payment details and notes" hint="Payment details carry over to your next invoice.">
            <Field label="Payment details" htmlFor={id("terms")}>
              <Textarea
                id={id("terms")}
                rows={4}
                placeholder={"Bank, account name, IBAN, SWIFT\nPayment due within 14 days"}
                value={form.terms}
                maxLength={2000}
                onChange={(e) => set("terms", e.target.value)}
              />
            </Field>
            <Field label="Notes" htmlFor={id("notes")}>
              <Textarea id={id("notes")} rows={3} value={form.notes} maxLength={2000} onChange={(e) => set("notes", e.target.value)} />
            </Field>
          </Section>

          <Card>
            <button
              type="button"
              onClick={() => setSellerOpen((open) => !open)}
              aria-expanded={sellerOpen}
              className="flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-stone-900">Your business</span>
                <span className="mt-0.5 block truncate text-xs text-stone-500">
                  {[form.seller.name, form.seller.address.split("\n")[0]].filter(Boolean).join(" · ") || "Add your business details"}
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone-400 transition-transform duration-150", sellerOpen && "rotate-180")} />
            </button>
            {sellerOpen && (
              <div className="grid grid-cols-2 gap-3 border-t border-stone-200 p-5">
                <p className="col-span-2 text-xs text-stone-500">
                  Shown in the &ldquo;From&rdquo; block. Whatever you save here is reused on every new invoice.
                </p>
                <Field label="Business name" htmlFor={id("s-name")} className="col-span-2">
                  <Input id={id("s-name")} value={form.seller.name} maxLength={120} onChange={(e) => setSeller("name", e.target.value)} />
                </Field>
                <Field label="Address" htmlFor={id("s-address")} className="col-span-2">
                  <Textarea id={id("s-address")} rows={2} value={form.seller.address} maxLength={400} onChange={(e) => setSeller("address", e.target.value)} />
                </Field>
                <Field label="Email" htmlFor={id("s-email")}>
                  <Input id={id("s-email")} type="email" value={form.seller.email} maxLength={254} onChange={(e) => setSeller("email", e.target.value)} />
                </Field>
                <Field label="Phone" htmlFor={id("s-phone")}>
                  <Input id={id("s-phone")} type="tel" value={form.seller.phone} maxLength={40} onChange={(e) => setSeller("phone", e.target.value)} />
                </Field>
                <Field label="Website" htmlFor={id("s-web")}>
                  <Input id={id("s-web")} value={form.seller.website} maxLength={120} onChange={(e) => setSeller("website", e.target.value)} />
                </Field>
                <Field label="Tax registration no." htmlFor={id("s-tax")}>
                  <Input id={id("s-tax")} value={form.seller.taxId} maxLength={40} onChange={(e) => setSeller("taxId", e.target.value)} />
                </Field>
              </div>
            )}
          </Card>
        </div>

        {/* ── Right: live preview ── */}
        <div className={cn("lg:sticky lg:top-8", view === "preview" ? "block" : "hidden lg:block")}>
          <div className="rounded-xl border border-stone-200 bg-stone-100 p-3 sm:p-5 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div ref={paneRef} aria-label="Invoice preview" role="region">
              <div className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-stone-200" style={{ height: sheetHeight * scale }}>
                <div ref={sheetRef} style={{ width: SHEET_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                  <InvoiceSheet invoice={draft} amountPaid={money.amountPaid} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print copy: lives directly under <body> so print CSS can hide everything else (globals.css) */}
      {isClient &&
        createPortal(
          <div id="invoice-print-root" className="hidden">
            <style>{"@page { size: A4; margin: 15mm; }"}</style>
            <InvoiceSheet invoice={draft} mode="print" amountPaid={money.amountPaid} />
          </div>,
          document.body
        )}

      {confirmDelete && (
        <Modal title="Delete this invoice?" description={`Invoice ${form.number} will be removed for good.`} onClose={() => setConfirmDelete(false)} className="max-w-md">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete invoice"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
