import React from "react";
import { Badge } from "@/components/admin/ui";
import { INVOICE_STATUS_TONE } from "@/components/admin/status";
import { INVOICE_STATUS_LABELS, isOverdue, isPartPaid, type InvoiceSummaryRow } from "@/lib/invoices";

/**
 * Overdue is the one state that must not be missed — it gets ink, not a second
 * colour. "Part paid" isn't a status of its own: it is a sent invoice with some
 * of its total received.
 */
export default function InvoiceStatusBadge({
  invoice,
  today,
}: {
  invoice: Pick<InvoiceSummaryRow, "status" | "due_date" | "total" | "amount_paid">;
  today: string;
}) {
  if (isOverdue(invoice, today)) return <Badge className="border-stone-900 bg-stone-900 text-white">Overdue</Badge>;
  if (isPartPaid(invoice)) return <Badge tone="soft">Part paid</Badge>;
  return <Badge tone={INVOICE_STATUS_TONE[invoice.status]}>{INVOICE_STATUS_LABELS[invoice.status]}</Badge>;
}
