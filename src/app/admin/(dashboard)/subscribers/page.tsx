import React from "react";
import { requireAdmin } from "@/lib/admin-auth";
import SubscribersList from "./SubscribersList";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email List & Subscribers — YARI Admin",
};

export default async function SubscribersPage() {
  let subscribers: any[] = [];
  try {
    const supabase = await requireAdmin();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    subscribers = data || [];
  } catch (err) {
    console.error("Error loading subscribers:", err);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Email list" description="Newsletter subscribers — search, export and manage." />

      <SubscribersList initialSubscribers={subscribers} />
    </div>
  );
}
