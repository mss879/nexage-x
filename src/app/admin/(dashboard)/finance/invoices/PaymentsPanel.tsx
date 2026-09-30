"use client";

import React, { useState, useTransition } from "react";
import { Banknote, Trash2 } from "lucide-react";
import { Button, Card, ErrorBanner, Modal, ProgressBar } from "@/components/admin/ui";
import {
  PAYMENT_METHOD_LABELS,
  formatInvoiceDate,
  formatMoney,
  round2,
  type InvoicePayment,
  type InvoicePaymentState,
  type InvoiceStatus,
} from "@/lib/invoices";
import RecordPaymentModal from "./RecordPaymentModal";
import { deleteInvoicePayment } from "./actions";

/**
 * What has been paid on a saved invoice: a bar for how far along it is, every
 * payment received, and a way to add or remove one. The totals here are the
 * saved ones — the database works them out, this only shows them.
 */
export default function PaymentsPanel({
  invoice,
  status,
  total,
  amountPaid,
  payments,
  dirty,
  onChange,
}: {
  invoice: { id: string; number: string; clientName: string; currency: string };
  status: InvoiceStatus;
  /** The saved total, which is what payments are measured against */
  total: number;
  amountPaid: number;
  payments: InvoicePayment[];
  /** The form has unsaved edits, so the total on screen may not be the saved one */
  dirty: boolean;
  onChange: (state: InvoicePaymentState, payments: InvoicePayment[]) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [removing, setRemoving] = useState<InvoicePayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  const money = (value: number) => formatMoney(value, invoice.currency);
  const balance = round2(Math.max(total - amountPaid, 0));
  const percent = total > 0 ? Math.min(100, Math.round((amountPaid / total) * 100)) : 0;
  const canRecord = status !== "void" && balance > 0 && !dirty;

  const remove = () => {
    if (!removing) return;
    setError(null);
    startDeleting(async () => {
      const res = await deleteInvoicePayment(removing.id);
      setRemoving(null);
      if (!res.success) setError(res.error);
      else onChange(res.state, res.payments);
    });
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Payments</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            {status === "void"
              ? "A void invoice can't take payments."
              : balance <= 0 && total > 0
                ? "Paid in full."
                : dirty
                  ? "Save your changes before recording a payment."
                  : "Record each payment as it arrives."}
          </p>
        </div>
        <Button size="sm" onClick={() => setRecording(true)} disabled={!canRecord}>
          <Banknote className="h-3.5 w-3.5" />
          Record payment
        </Button>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-stone-900">{money(amountPaid)}</span>
          <span className="text-xs tabular-nums text-stone-500">
            {percent}% of {money(total)}
          </span>
        </div>
        <ProgressBar value={amountPaid} max={total} label="Paid" className="mt-2 h-2" />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-stone-500">Paid so far</span>
          <span className={balance > 0 ? "font-medium tabular-nums text-gold-700" : "tabular-nums text-stone-500"}>
            {balance > 0 ? `${money(balance)} left to pay` : "Nothing left to pay"}
          </span>
        </div>
      </div>

      {payments.length > 0 && (
        <ul className="divide-y divide-stone-200 border-t border-stone-200">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium tabular-nums text-stone-900">{money(payment.amount)}</p>
                <p className="truncate text-xs text-stone-500">
                  {formatInvoiceDate(payment.paid_on)} · {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                  {payment.reference && ` · ${payment.reference}`}
                  {payment.note && ` · ${payment.note}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemoving(payment)}
                aria-label={`Remove the payment of ${money(payment.amount)}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {recording && (
        <RecordPaymentModal
          invoice={{ ...invoice, total, amountPaid }}
          onClose={() => setRecording(false)}
          onRecorded={(state, next) => {
            setRecording(false);
            onChange(state, next);
          }}
        />
      )}

      {removing && (
        <Modal
          title="Remove this payment?"
          description={`${money(removing.amount)} received on ${formatInvoiceDate(removing.paid_on)}. The invoice's balance goes back up by that much.`}
          onClose={() => setRemoving(null)}
          className="max-w-md"
        >
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Keep it
            </Button>
            <Button variant="danger" onClick={remove} disabled={deleting}>
              {deleting ? "Removing…" : "Remove payment"}
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
