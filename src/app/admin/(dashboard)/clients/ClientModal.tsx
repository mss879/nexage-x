"use client";

import React, { useId, useState, useTransition } from "react";
import { Button, ErrorBanner, Field, Input, Modal, Textarea } from "@/components/admin/ui";
import { CurrencyPicker } from "@/components/admin/money";
import type { ClientInput } from "@/lib/clients";
import { saveClient } from "./actions";

/** Create or edit a client. onSaved receives the client's id. */
export default function ClientModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: ClientInput;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const uid = useId();
  const [form, setForm] = useState<ClientInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof ClientInput>(key: K, value: ClientInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const id = (name: string) => `${uid}-${name}`;
  const isEdit = Boolean(initial.id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await saveClient(form);
      if (!res.success) setError(res.error);
      else onSaved(res.id);
    });
  };

  return (
    <Modal
      title={isEdit ? "Edit client" : "New client"}
      description="These details fill the “Billed to” block when you pick this client on an invoice."
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor={id("company")}>
            <Input id={id("company")} maxLength={120} autoFocus={!isEdit} value={form.company} onChange={(e) => set("company", e.target.value)} />
          </Field>
          <Field label="Contact name" htmlFor={id("contact")}>
            <Input id={id("contact")} maxLength={120} value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
          </Field>
          <Field label="Email" htmlFor={id("email")}>
            <Input id={id("email")} type="email" maxLength={254} value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor={id("phone")}>
            <Input id={id("phone")} type="tel" maxLength={40} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor={id("address")} className="sm:col-span-2">
            <Textarea id={id("address")} rows={2} maxLength={400} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Country" htmlFor={id("country")}>
            <Input id={id("country")} maxLength={60} placeholder="United Arab Emirates" value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Website" htmlFor={id("website")}>
            <Input id={id("website")} maxLength={200} value={form.website} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Tax registration no. (optional)" htmlFor={id("tax")}>
            <Input id={id("tax")} maxLength={40} value={form.tax_id} onChange={(e) => set("tax_id", e.target.value)} />
          </Field>
          <Field label="Usually billed in" htmlFor={id("currency")}>
            <CurrencyPicker id={id("currency")} value={form.default_currency} onChange={(currency) => set("default_currency", currency)} />
          </Field>
          <Field label="Notes (optional)" htmlFor={id("notes")} className="sm:col-span-2">
            <Textarea id={id("notes")} rows={3} maxLength={4000} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save" : "Add client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
