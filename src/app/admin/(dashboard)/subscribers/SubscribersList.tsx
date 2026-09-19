"use client";

import React, { useState } from "react";
import { Mail, Search, Download, Trash2, CheckCircle2, UserX, Copy, Check } from "lucide-react";
import { deleteSubscriber, updateSubscriberStatus } from "@/app/admin/actions";
import { Badge, Button, Card, Chip, EmptyState, Input, StatCard } from "@/components/admin/ui";
import { SUBSCRIBER_STATUS_TONE } from "@/components/admin/status";

interface Subscriber {
  id: string;
  created_at: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
}

export default function SubscribersList({
  initialSubscribers,
}: {
  initialSubscribers: Subscriber[];
}) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filtered subscribers
  const filtered = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;

  const handleToggleStatus = async (id: string, currentStatus: "active" | "unsubscribed") => {
    const newStatus = currentStatus === "active" ? "unsubscribed" : "active";
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );

    const res = await updateSubscriberStatus(id, newStatus);
    if (!res.success) {
      alert(res.error || "Failed to update subscriber status.");
      setSubscribers(initialSubscribers);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the email list?`)) return;

    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    const res = await deleteSubscriber(id);
    if (!res.success) {
      alert(res.error || "Failed to delete subscriber.");
      setSubscribers(initialSubscribers);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("No subscribers available to export.");
      return;
    }

    const headers = ["Email", "Status", "Source", "Date Subscribed"];
    const rows = filtered.map((s) => [
      s.email,
      s.status,
      s.source || "footer",
      new Date(s.created_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yari_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total subscribers" value={totalCount} icon={Mail} />
        <StatCard label="Active" value={activeCount} icon={CheckCircle2} emphasis />
        <StatCard label="Unsubscribed" value={unsubscribedCount} icon={UserX} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            aria-label="Search subscribers by email"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "active", "unsubscribed"] as const).map((status) => (
            <Chip
              key={status}
              selected={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Chip>
          ))}
          <Button variant="secondary" size="sm" onClick={handleExportCSV} className="ml-1">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No subscribers found"
            description={search ? "Try a different search or filter." : "Newsletter signups from the footer will appear here."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-500">
                  <th scope="col" className="px-5 py-3 font-medium">Email</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Source</th>
                  <th scope="col" className="px-5 py-3 font-medium">Subscribed</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900">{sub.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(sub.email)}
                          aria-label={`Copy ${sub.email}`}
                          className="flex h-6 w-6 items-center justify-center rounded text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                        >
                          {copiedEmail === sub.email ? (
                            <Check className="h-3.5 w-3.5 text-gold-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={SUBSCRIBER_STATUS_TONE[sub.status]} className="capitalize">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-stone-600">{sub.source || "footer"}</td>
                    <td className="px-5 py-3 tabular-nums text-stone-600">{formatDate(sub.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(sub.id, sub.status)}>
                          {sub.status === "active" ? "Unsubscribe" : "Reactivate"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(sub.id, sub.email)}
                          aria-label={`Delete ${sub.email}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
