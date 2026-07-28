import React from "react";
import { createClient } from "@/lib/supabase/server";
import SubscribersList from "./SubscribersList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Email List & Subscribers — YARI Admin",
};

export default async function SubscribersPage() {
  let subscribers: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    subscribers = data || [];
  } catch (err) {
    console.error("Error loading subscribers:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mohave text-3xl font-bold uppercase tracking-tight text-white">
          Email List
        </h1>
        <p className="mt-1 font-sans text-sm text-zinc-400">
          Manage newsletter subscribers, track signups, and export subscriber lists.
        </p>
      </div>

      <SubscribersList initialSubscribers={subscribers} />
    </div>
  );
}
