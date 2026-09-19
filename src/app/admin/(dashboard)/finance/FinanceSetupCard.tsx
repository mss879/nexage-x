import React from "react";
import { Card } from "@/components/admin/ui";

/** Shown until the invoices migration has been run in Supabase. */
export default function FinanceSetupCard() {
  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-stone-900">One step left: create the invoices table</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        In the Supabase dashboard → SQL Editor, paste the whole of{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">
          supabase/migrations/20260919140000_invoices.sql
        </code>{" "}
        and run it. Invoices are visible to allow-listed admins only.
      </p>
    </Card>
  );
}
