"use client";

import React, { useId, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button, Chip, ErrorBanner, Field, Input, Modal, Select, Textarea } from "@/components/admin/ui";
import { CurrencyPicker } from "@/components/admin/money";
import type { ClientOption, ProjectOption } from "@/lib/clients";
import { ENTRY_CATEGORIES, ENTRY_TYPES, ENTRY_TYPE_LABELS, type EntryType, type FinanceEntryInput } from "@/lib/finance";
import type { TeamOption } from "@/lib/team";
import { deleteFinanceEntry, saveFinanceEntry } from "./actions";

/** The amount is typed as text so "120." or an empty box never fights the keyboard. */
type EntryForm = Omit<FinanceEntryInput, "amount"> & { amount: string };

/** "Someone who isn't on the team" in the paid-by list */
const SOMEONE_ELSE = "other";

/**
 * Add or edit one expense or income entry. Used on the ledger page and on a
 * client's page (where the client is fixed).
 */
export default function EntryModal({
  initial,
  team,
  clients,
  projects,
  lockClient = false,
  onClose,
  onSaved,
}: {
  initial: FinanceEntryInput;
  team: TeamOption[];
  clients: ClientOption[];
  projects: ProjectOption[];
  lockClient?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const uid = useId();
  const [form, setForm] = useState<EntryForm>({ ...initial, amount: initial.amount ? String(initial.amount) : "" });
  const [payer, setPayer] = useState(initial.paid_by_id || (initial.paid_by_name ? SOMEONE_ELSE : ""));
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof EntryForm>(key: K, value: EntryForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${uid}-${name}`;
  const isEdit = Boolean(initial.id);
  const isExpense = form.type === "expense";

  const categories = ENTRY_CATEGORIES[form.type];
  const clientProjects = projects.filter((project) => !form.client_id || project.client_id === form.client_id);

  const setType = (type: EntryType) =>
    setForm((f) => ({ ...f, type, category: ENTRY_CATEGORIES[type].includes(f.category) ? f.category : ENTRY_CATEGORIES[type][0] }));

  const pickClient = (clientId: string) =>
    setForm((f) => ({
      ...f,
      client_id: clientId,
      project_id: projects.some((p) => p.id === f.project_id && p.client_id === clientId) ? f.project_id : "",
    }));

  const pickProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    setForm((f) => ({ ...f, project_id: projectId, client_id: project ? project.client_id : f.client_id }));
  };

  const pickPayer = (value: string) => {
    setPayer(value);
    setForm((f) => ({ ...f, paid_by_id: value === SOMEONE_ELSE ? "" : value, paid_by_name: value === SOMEONE_ELSE ? f.paid_by_name : "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await saveFinanceEntry({ ...form, amount: Number(form.amount) || 0 });
      if (!res.success) setError(res.error);
      else onSaved();
    });
  };

  const remove = () => {
    if (!initial.id) return;
    setError(null);
    startSaving(async () => {
      const res = await deleteFinanceEntry(initial.id as string);
      if (!res.success) {
        setError(res.error);
        setConfirmDelete(false);
      } else onSaved();
    });
  };

  return (
    <Modal
      title={isEdit ? `Edit ${ENTRY_TYPE_LABELS[form.type].toLowerCase()}` : isExpense ? "Add an expense" : "Add income"}
      description={isExpense ? "Money the company spent." : "Money that came in without an invoice. Invoice payments are counted automatically."}
      onClose={onClose}
      className="max-w-xl"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <div className="flex gap-2" role="group" aria-label="Type">
          {ENTRY_TYPES.map((type) => (
            <Chip key={type} selected={form.type === type} onClick={() => setType(type)}>
              {type === "expense" ? "Money out · expense" : "Money in · income"}
            </Chip>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount" htmlFor={id("amount")}>
            <Input
              id={id("amount")}
              inputMode="decimal"
              required
              autoFocus={!isEdit}
              placeholder="0.00"
              className="text-right tabular-nums"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
          <Field label="Currency" htmlFor={id("currency")}>
            <CurrencyPicker id={id("currency")} value={form.currency} onChange={(currency) => set("currency", currency)} />
          </Field>
        </div>

        <Field label={isExpense ? "What was it for" : "Where did it come from"} htmlFor={id("description")}>
          <Input id={id("description")} required maxLength={300} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date" htmlFor={id("date")}>
            <Input id={id("date")} type="date" required value={form.entry_date} onChange={(e) => set("entry_date", e.target.value)} />
          </Field>
          <Field label="Category" htmlFor={id("category")}>
            <Select id={id("category")} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {!categories.includes(form.category) && <option value={form.category}>{form.category}</option>}
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {clients.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client (optional)" htmlFor={id("client")}>
              <Select id={id("client")} value={form.client_id} disabled={lockClient} onChange={(e) => pickClient(e.target.value)}>
                <option value="">No client</option>
                {clients
                  .filter((client) => client.status === "active" || client.id === form.client_id)
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Project (optional)" htmlFor={id("project")}>
              <Select id={id("project")} value={form.project_id} disabled={clientProjects.length === 0} onChange={(e) => pickProject(e.target.value)}>
                <option value="">{clientProjects.length === 0 ? "No projects" : "No project"}</option>
                {clientProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        {isExpense && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Paid by (optional)" htmlFor={id("payer")}>
              <Select id={id("payer")} value={payer} onChange={(e) => pickPayer(e.target.value)}>
                <option value="">The company</option>
                {team
                  .filter((member) => member.active || member.id === form.paid_by_id)
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                <option value={SOMEONE_ELSE}>Someone else…</option>
              </Select>
            </Field>
            {payer === SOMEONE_ELSE && (
              <Field label="Their name" htmlFor={id("payer-name")}>
                <Input id={id("payer-name")} maxLength={80} value={form.paid_by_name} onChange={(e) => set("paid_by_name", e.target.value)} />
              </Field>
            )}
          </div>
        )}

        <Field label="Notes (optional)" htmlFor={id("notes")}>
          <Textarea id={id("notes")} rows={2} maxLength={2000} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>

        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600">Delete this entry?</span>
                <Button variant="danger" size="sm" onClick={remove} disabled={saving}>
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Keep
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save" : isExpense ? "Add expense" : "Add income"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
