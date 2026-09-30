import React from "react";
import SetupCard from "@/components/admin/SetupCard";

/** Shown until the invoices migration has been run in Supabase. */
export default function FinanceSetupCard() {
  return (
    <SetupCard title="One step left: create the invoices table" file="supabase/migrations/20260919140000_invoices.sql">
      Invoices are visible to allow-listed admins only.
    </SetupCard>
  );
}
