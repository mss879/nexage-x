"use client";

import React, { useId, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button, ErrorBanner, Field, Input, Modal, Select, Textarea } from "@/components/admin/ui";
import { CurrencyPicker } from "@/components/admin/money";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, type ProjectInput, type ProjectStatus } from "@/lib/clients";
import { deleteProject, saveProject } from "./actions";

/** A project's value is typed as text so "1500." or an empty box never fights the keyboard. */
type ProjectForm = Omit<ProjectInput, "value"> & { value: string };

export default function ProjectModal({
  initial,
  clientName,
  onClose,
  onSaved,
}: {
  initial: ProjectInput;
  clientName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const uid = useId();
  const [form, setForm] = useState<ProjectForm>({ ...initial, value: initial.value ? String(initial.value) : "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${uid}-${name}`;
  const isEdit = Boolean(initial.id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await saveProject({ ...form, value: Number(form.value) || 0 });
      if (!res.success) setError(res.error);
      else onSaved();
    });
  };

  const remove = () => {
    if (!initial.id) return;
    setError(null);
    startSaving(async () => {
      const res = await deleteProject(initial.id as string);
      if (!res.success) {
        setError(res.error);
        setConfirmDelete(false);
      } else onSaved();
    });
  };

  return (
    <Modal title={isEdit ? "Edit project" : "New project"} description={`For ${clientName}`} onClose={onClose} className="max-w-xl">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Field label="Project name" htmlFor={id("name")}>
          <Input id={id("name")} required maxLength={160} autoFocus={!isEdit} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor={id("status")}>
            <Select id={id("status")} value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
          <span className="hidden sm:block" />
          <Field label="Start date" htmlFor={id("start")}>
            <Input id={id("start")} type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </Field>
          <Field label="Deadline" htmlFor={id("due")}>
            <Input id={id("due")} type="date" min={form.start_date || undefined} value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
          </Field>
          <Field label="Project value" htmlFor={id("value")}>
            <Input
              id={id("value")}
              inputMode="decimal"
              placeholder="0.00"
              className="text-right tabular-nums"
              value={form.value}
              onChange={(e) => set("value", e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
          <Field label="Currency" htmlFor={id("currency")}>
            <CurrencyPicker id={id("currency")} value={form.currency} onChange={(currency) => set("currency", currency)} />
          </Field>
        </div>

        <Field label="Description (optional)" htmlFor={id("description")}>
          <Textarea id={id("description")} rows={3} maxLength={4000} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>

        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600">Delete this project?</span>
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
              {saving ? "Saving…" : isEdit ? "Save" : "Add project"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
