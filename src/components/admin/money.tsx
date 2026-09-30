/**
 * Money in more than one currency. Amounts in AED and LKR are never added
 * together or converted — each currency gets its own line.
 */
import React from "react";
import { CURRENCIES, PRIMARY_CURRENCIES, formatMoney } from "@/lib/invoices";
import { cn } from "@/lib/utils";

export interface MoneyLine {
  currency: string;
  amount: number;
}

/** One line per currency, e.g. as the value of a StatCard. Shows a dash when there is nothing to show. */
export function MoneyStack({ lines, className }: { lines: MoneyLine[]; className?: string }) {
  if (lines.length === 0) return <span className={cn("text-stone-300", className)}>—</span>;
  return (
    <span className={cn("flex flex-col gap-0.5", className)}>
      {lines.map((line) => (
        <span key={line.currency} className="whitespace-nowrap">
          {formatMoney(line.amount, line.currency)}
        </span>
      ))}
    </span>
  );
}

/**
 * Currency control: AED and LKR are one click apart, everything else sits
 * behind "Other". A plain controlled input — no state of its own.
 */
export function CurrencyPicker({
  value,
  onChange,
  id,
  disabled,
}: {
  value: string;
  onChange: (currency: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  const primary = PRIMARY_CURRENCIES as readonly string[];
  const isOther = !primary.includes(value);
  const others = CURRENCIES.filter((code) => !primary.includes(code));

  return (
    <div id={id} role="group" aria-label="Currency" className="flex h-10 items-stretch gap-1 rounded-lg border border-stone-200 bg-white p-1">
      {primary.map((code) => (
        <button
          key={code}
          type="button"
          disabled={disabled}
          aria-pressed={value === code}
          onClick={() => onChange(code)}
          className={cn(
            "flex-1 rounded-md px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50 cursor-pointer",
            value === code ? "bg-gold-50 text-gold-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          )}
        >
          {code}
        </button>
      ))}
      <select
        aria-label="Other currency"
        disabled={disabled}
        value={isOther ? value : ""}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className={cn(
          "min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50 cursor-pointer",
          isOther ? "bg-gold-50 text-gold-700" : "text-stone-500 hover:bg-stone-100"
        )}
      >
        <option value="">Other</option>
        {isOther && !(CURRENCIES as readonly string[]).includes(value) && <option value={value}>{value}</option>}
        {others.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  );
}
