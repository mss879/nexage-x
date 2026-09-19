/**
 * The invoice document itself — an A4 page, deliberately quiet: ink on white,
 * hairlines, and gold in exactly two places (the mark above "Invoice" and the
 * rule over the total).
 *
 * Rendered twice by the editor: scaled down as the live preview ("screen", a
 * fixed 794px = 210mm page with its own margins) and unscaled for printing
 * ("print", where the page margins come from @page instead). Sizes are in px on
 * purpose: this is a document with a fixed page, not a responsive screen.
 */
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  computeTotals,
  formatAmount,
  formatInvoiceDate,
  formatMoney,
  lineAmount,
  type InvoiceDraft,
} from "@/lib/invoices";

export const SHEET_WIDTH = 794; // 210mm at 96dpi
export const SHEET_HEIGHT = 1123; // 297mm

const quantity = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-stone-500">{children}</p>;
}

function Lines({ values }: { values: (string | false | undefined)[] }) {
  const lines = values.filter(Boolean) as string[];
  if (lines.length === 0) return null;
  return (
    <div className="mt-1 whitespace-pre-line text-[12px] leading-[1.6] text-stone-600">
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

export default function InvoiceSheet({ invoice, mode = "screen" }: { invoice: InvoiceDraft; mode?: "screen" | "print" }) {
  const totals = computeTotals(invoice);
  const { seller, client, currency } = invoice;
  const placeholder = mode === "screen"; // empty-field hints never reach paper
  const billedTo = client.company || client.name;
  const items = invoice.items.filter((item) => item.description || item.unitPrice > 0);
  const paid = invoice.status === "paid";

  return (
    <article
      className={cn(
        "flex flex-col bg-white font-sans text-stone-900 antialiased [print-color-adjust:exact] [-webkit-print-color-adjust:exact]",
        mode === "screen" ? "min-h-[1123px] w-[794px] p-[57px]" : "min-h-[265mm] w-full"
      )}
    >
      {/* Masthead */}
      <header className="flex items-start justify-between gap-8">
        <Image src="/yari-logo-black.png" alt={seller.name || "YARI"} width={113} height={36} loading="eager" className="h-[36px] w-auto" />
        <div className="text-right">
          <div className="mb-3 ml-auto h-[3px] w-8 rounded-full bg-gold-500" />
          <Label>Invoice</Label>
          <p className="mt-1 text-[22px] font-semibold leading-tight tracking-tight tabular-nums">{invoice.number || "—"}</p>
          {(paid || invoice.status === "void") && (
            <p className="mt-2 inline-block rounded-full border border-stone-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
              {paid ? `Paid · ${formatInvoiceDate(invoice.paidAt)}` : "Void"}
            </p>
          )}
        </div>
      </header>

      {/* Parties + dates */}
      <section className="mt-10 grid grid-cols-[1fr_1fr_200px] gap-8 border-t border-stone-200 pt-7">
        <div className="min-w-0">
          <Label>From</Label>
          <p className="mt-2 text-[13px] font-semibold">{seller.name}</p>
          <Lines values={[seller.address, seller.email, seller.phone, seller.taxId && `TRN ${seller.taxId}`]} />
        </div>

        <div className="min-w-0">
          <Label>Billed to</Label>
          {billedTo ? (
            <p className="mt-2 text-[13px] font-semibold">{billedTo}</p>
          ) : (
            placeholder && <p className="mt-2 text-[13px] text-stone-300">Client name</p>
          )}
          <Lines
            values={[
              client.company && client.name,
              client.address,
              client.email,
              client.phone,
              client.taxId && `TRN ${client.taxId}`,
            ]}
          />
        </div>

        <dl className="flex flex-col gap-2 text-[12px]">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Issued</dt>
            <dd className="font-medium tabular-nums">{formatInvoiceDate(invoice.issueDate)}</dd>
          </div>
          {invoice.dueDate && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Due</dt>
              <dd className="font-medium tabular-nums">{formatInvoiceDate(invoice.dueDate)}</dd>
            </div>
          )}
          <div className="mt-2 border-t border-stone-200 pt-3">
            <dt className="text-stone-500">{paid ? "Amount paid" : "Amount due"}</dt>
            <dd className="mt-0.5 text-[17px] font-semibold tracking-tight tabular-nums">{formatMoney(totals.total, currency)}</dd>
          </div>
        </dl>
      </section>

      {/* Line items */}
      <table className="mt-10 w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="text-[10.5px] uppercase tracking-[0.14em] text-stone-500 [&>th]:border-b [&>th]:border-stone-900">
            <th scope="col" className="pb-2.5 text-left font-semibold">Description</th>
            <th scope="col" className="w-[64px] pb-2.5 text-right font-semibold">Qty</th>
            <th scope="col" className="w-[110px] pb-2.5 text-right font-semibold">Rate</th>
            <th scope="col" className="w-[130px] pb-2.5 text-right font-semibold">Amount ({currency})</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && placeholder && (
            <tr className="border-b border-stone-200">
              <td colSpan={4} className="py-3.5 text-stone-300">Line items appear here as you add them</td>
            </tr>
          )}
          {items.map((item, i) => {
            const [title, ...details] = item.description.split("\n");
            return (
              <tr key={i} className="break-inside-avoid border-b border-stone-200 align-top">
                <td className="py-3.5 pr-6">
                  <p className="font-medium text-stone-900">{title}</p>
                  {details.length > 0 && (
                    <p className="mt-0.5 whitespace-pre-line text-[12px] leading-[1.55] text-stone-500">{details.join("\n")}</p>
                  )}
                </td>
                <td className="py-3.5 text-right tabular-nums text-stone-600">{quantity.format(item.quantity)}</td>
                <td className="py-3.5 text-right tabular-nums text-stone-600">{formatAmount(item.unitPrice)}</td>
                <td className="py-3.5 text-right font-medium tabular-nums">{formatAmount(lineAmount(item))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <dl className="ml-auto mt-6 flex w-[290px] break-inside-avoid flex-col gap-2 text-[12.5px]">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Subtotal</dt>
          <dd className="tabular-nums">{formatAmount(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">
              Discount{invoice.discountType === "percent" ? ` (${quantity.format(invoice.discountValue)}%)` : ""}
            </dt>
            <dd className="tabular-nums">−{formatAmount(totals.discount)}</dd>
          </div>
        )}
        {invoice.taxRate > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">
              {invoice.taxLabel} ({quantity.format(invoice.taxRate)}%)
            </dt>
            <dd className="tabular-nums">{formatAmount(totals.tax)}</dd>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t-2 border-gold-500 pt-3">
          <dt className="text-[13px] font-semibold">{paid ? "Total paid" : "Total due"}</dt>
          <dd className="text-[19px] font-semibold tracking-tight tabular-nums">{formatMoney(totals.total, currency)}</dd>
        </div>
      </dl>

      {/* Notes + how to pay */}
      {(invoice.notes || invoice.terms) && (
        <section className="mt-12 grid break-inside-avoid grid-cols-2 gap-10">
          {invoice.terms && (
            <div>
              <Label>Payment details</Label>
              <p className="mt-2 whitespace-pre-line text-[12px] leading-[1.65] text-stone-600">{invoice.terms}</p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <Label>Notes</Label>
              <p className="mt-2 whitespace-pre-line text-[12px] leading-[1.65] text-stone-600">{invoice.notes}</p>
            </div>
          )}
        </section>
      )}

      <footer className="mt-auto break-inside-avoid pt-12">
        <div className="flex items-center justify-between gap-6 border-t border-stone-200 pt-4 text-[11px] text-stone-500">
          <span>Thank you for your business.</span>
          <span>{[seller.email, seller.website].filter(Boolean).join("  ·  ")}</span>
        </div>
      </footer>
    </article>
  );
}
