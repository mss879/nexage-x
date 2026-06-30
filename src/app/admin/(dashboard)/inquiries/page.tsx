import React from "react";
import { createClient } from "@/lib/supabase/server";
import InquiriesList from "./InquiriesList";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  let inquiries: any[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      inquiries = data || [];
    }
  } catch (err: any) {
    fetchError = err.message || "An unexpected error occurred.";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-syne text-2xl font-bold uppercase tracking-tight md:text-3xl">Inquiries Manager</h1>
        <p className="text-sm text-zinc-400 font-sans mt-1">
          Review and process contact form submissions from your public website.
        </p>
      </div>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400 font-sans">
          Failed to load inquiries: {fetchError}. Please check Supabase configuration.
        </div>
      ) : (
        <InquiriesList initialInquiries={inquiries} />
      )}
    </div>
  );
}
