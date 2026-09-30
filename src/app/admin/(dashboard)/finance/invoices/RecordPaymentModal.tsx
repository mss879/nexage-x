"use client";

import React, { useId, useState, useTransition } from "react";
import { Button, ErrorBanner, Field, Input, Modal, ProgressBar, Select } from "@/components/admin/ui";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  formatMoney,
  round2,
  todayInDubai,
  type InvoicePayment,
  type InvoicePaymentState,
  type PaymentMethod,
} from "@/lib/invoices";
import { recordInvoicePayment } from "./actions";

/**
 * "This customer paid this much." Shows what the payment does to the balance
 * before it is saved. Used from the invoice list and from inside an invoice.
 */
export default function RecordPaymentModal({
  invoice,
  onClose,
  onRecorded,
}: {
  invoice: { id: string; number: string; clientName: string; currency: string; total: number; amountPaid: number };
  onClose: () => void;
  onRecorded: (state: InvoicePaymentState, payments: InvoicePayment[]) => void;
}) {
  const uid = useId();
  const balance = round2(Math.max(invoice.total - invoice.amountPaid, 0));
  const [amount, setAmount] = useState(String(balance));
  const [paidOn, setPaidOn] = useState(todayInDubai);
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const money = (value: number) => formatMoney(value, invoice.currency);
  const entered = Number(amount);
  const valid = Number.isFinite(entered) && entered > 0 && entered <= balance;
  const paidAfter = round2(invoice.amountPaid + (valid ? entered : 0));
  const balanceAfter = round2(invoice.total - paidAfter);
  const id = (name: string) => `${uid}-${name}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startSaving(async () => {
      const res = await recordInvoicePayment({ invoiceId: invoice.id, amount: entered, paidOn, method, reference, note });
      if (!res.success) setError(res.error);
      else onRecorded(res.state, res.payments);
    });
  };

  return (
    <Modal
      title="Record a payment"
      description={`Invoice ${invoice.number}${invoice.clientName ? ` · ${invoice.clientName}` : ""}`}
      onClose={onClose}
      className="max-w-lg"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {/* Where the invoice will stand once this payment is saved */}
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-stone-600">
              Paid <span className="font-semibold tabular-nums text-stone-900">{money(paidAfter)}</span> of {money(invoice.total)}
            </span>
            <span className="text-xs tabular-nums text-stone-500">{invoice.total > 0 ? Math.round((paidAfter / invoice.total) * 100) : 0}%</span>
          </div>
          <ProgressBar value={paidAfter} max={invoice.total} label="Paid after this payment" className="mt-2 h-2 bg-stone-200" />
          <p className="mt-2 text-xs text-stone-500">
            {balanceAfter <= 0 ? "This pays the invoice in full." : `${money(balanceAfter)} will still be owed.`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={`Amount received (${invoice.currency})`} htmlFor={id("amount")}>
            <Input
              id={id("amount")}
              inputMode="decimal"
              required
              autoFocus
              className="text-right tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            />
          </Field>
          <Field label="Received on" htmlFor={id("date")}>
            <Input id={id("date")} type="date" required value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          </Field>
          <Field label="How it was paid" htmlFor={id("method")}>
            <Select id={id("method")} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Reference (optional)" htmlFor={id("reference")}>
            <Input id={id("reference")} maxLength={80} placeholder="Transfer or cheque no." value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <Field label="Note (optional)" htmlFor={id("note")} className="sm:col-span-2">
            <Input id={id("note")} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>

        {entered > balance && <p className="text-xs text-red-600">That&rsquo;s more than the {money(balance)} still owed.</p>}

        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAmount(String(balance))} disabled={Number(amount) === balance}>
            Full balance · {money(balance)}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? "Saving…" : "Record payment"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
