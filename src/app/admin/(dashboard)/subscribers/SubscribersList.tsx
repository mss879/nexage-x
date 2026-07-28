"use client";

import React, { useState } from "react";
import { Mail, Search, Download, Trash2, CheckCircle2, UserX, Copy, Check } from "lucide-react";
import { deleteSubscriber, updateSubscriberStatus } from "@/app/admin/actions";

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
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Total Subscribers
            </span>
            <Mail className="h-5 w-5 text-[#df8326]" />
          </div>
          <p className="mt-3 font-mohave text-3xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              Active Subscribers
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-mohave text-3xl font-bold text-white">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Unsubscribed
            </span>
            <UserX className="h-5 w-5 text-zinc-500" />
          </div>
          <p className="mt-3 font-mohave text-3xl font-bold text-white">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Export CSV */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email subscribers..."
            className="w-full rounded-xl border border-white/[0.08] bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#df8326] focus:outline-none focus:ring-1 focus:ring-[#df8326]"
          />
        </div>

        {/* Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
            {(["all", "active", "unsubscribed"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  statusFilter === st
                    ? "bg-[#df8326] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:border-[#df8326] hover:bg-[#df8326]/10 hover:text-[#df8326]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="mt-3 font-syne text-lg font-semibold text-white">No subscribers found</h3>
            <p className="mt-1 font-sans text-sm text-zinc-500">
              {search
                ? `No email match found for "${search}".`
                : "No newsletter subscribers have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Subscriber Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Date Subscribed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{sub.email}</span>
                        <button
                          onClick={() => handleCopyEmail(sub.email)}
                          title="Copy Email"
                          className="text-zinc-500 hover:text-[#df8326] transition-colors"
                        >
                          {copiedEmail === sub.email ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                          sub.status === "active"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border border-zinc-700 bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            sub.status === "active" ? "bg-emerald-400" : "bg-zinc-500"
                          }`}
                        />
                        {sub.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 uppercase">
                      {sub.source || "footer"}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                      {formatDate(sub.created_at)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(sub.id, sub.status)}
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase text-zinc-300 hover:border-[#df8326] hover:text-[#df8326] transition-colors"
                        >
                          {sub.status === "active" ? "Unsubscribe" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          title="Delete Subscriber"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
