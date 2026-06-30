import React from "react";
import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "./KanbanBoard";

// Opt out of static caching for the CRM page to ensure real-time leads display
export const dynamic = "force-dynamic";

export default async function CRMPage() {
  let leads: any[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-syne text-2xl font-bold uppercase tracking-tight md:text-3xl">CRM Pipeline</h1>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Track and manage your business deals and conversion status.
          </p>
        </div>
      </div>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400 font-sans">
          Failed to fetch CRM leads: {fetchError}. Please ensure Supabase connection is established.
        </div>
      ) : (
        <KanbanBoard initialLeads={leads} />
      )}
    </div>
  );
}
