import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import KanbanBoard from "./KanbanBoard";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";

// Opt out of static caching for the CRM page to ensure real-time leads display
export const dynamic = "force-dynamic";

export default async function CRMPage() {
  let leads: any[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      leads = data || [];
    }
  } catch (err: any) {
    fetchError = err.message || "An unexpected error occurred.";
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="CRM pipeline" description="Track deals from first contact to won." />

      {fetchError ? (
        <ErrorBanner>
          Couldn&rsquo;t load CRM leads: {fetchError}
        </ErrorBanner>
      ) : (
        <KanbanBoard initialLeads={leads} />
      )}
    </div>
  );
}
