import React from "react";
import { createClient } from "@/lib/supabase/server";
import InquiriesList from "./InquiriesList";
import { ErrorBanner, PageHeader } from "@/components/admin/ui";

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
    <div className="flex flex-col gap-6">
      <PageHeader title="Inquiries" description="Review and process contact form submissions from the website." />

      {fetchError ? (
        <ErrorBanner>
          Couldn&rsquo;t load inquiries: {fetchError}
        </ErrorBanner>
      ) : (
        <InquiriesList initialInquiries={inquiries} />
      )}
    </div>
  );
}
