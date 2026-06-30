"use client";

import React, { useState, useTransition } from "react";
import { Inbox, CheckCircle2, Archive, Calendar, Mail, MapPin, Tag, Plus, Check } from "lucide-react";
import { convertInquiryToLead, updateInquiryStatus } from "@/app/admin/actions";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message?: string;
  interests: string[];
  status: "new" | "converted" | "archived";
}

const STATUS_FILTERS = ["new", "converted", "archived"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function InquiriesList({
  initialInquiries,
}: {
  initialInquiries: Inquiry[];
}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("new");
  const [isPending, startTransition] = useTransition();

  const filteredInquiries = inquiries.filter((inq) => inq.status === activeFilter);

  const handleArchive = async (id: string) => {
    // Optimistic update
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: "archived" } : inq)));
    const res = await updateInquiryStatus(id, "archived");
    if (!res.success) {
      alert(res.error || "Failed to archive inquiry.");
      setInquiries(initialInquiries);
    }
  };

  const handleConvert = async (id: string) => {
    // Optimistic update
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: "converted" } : inq)));
    const res = await convertInquiryToLead(id);
    if (res.success) {
      alert("Successfully converted to lead and added to CRM Kanban pipeline!");
    } else {
      alert(res.error || "Failed to convert inquiry.");
      setInquiries(initialInquiries);
    }
  };

  const shortDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex flex-col gap-6 font-sans">
      {/* Background Orbs to match Homepage design */}
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute -right-20 top-0 h-[360px] w-[360px] rounded-full bg-[#df8326]/10 blur-[130px] pointer-events-none" />

      {/* Filter Tabs - Styled exactly like the Homepage/Blog category selectors */}
      <div className="flex border-b border-white/[0.06] pb-4">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 cursor-pointer ${
                activeFilter === filter
                  ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326] shadow-[0_0_15px_rgba(223,131,38,0.1)]"
                  : "border-white/[0.08] text-zinc-400 hover:border-[#df8326]/30 hover:text-white"
              }`}
            >
              {filter} ({inquiries.filter((inq) => inq.status === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* List Container */}
      <div className="grid grid-cols-1 gap-6">
        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:bg-[#121217] ${
              inq.status === "new"
                ? "border-[#df8326]/35 hover:border-[#df8326]/60 hover:shadow-[0_0_25px_rgba(223,131,38,0.06)]"
                : "border-white/[0.08] hover:border-white/[0.15]"
            }`}
          >
            {inq.status === "new" && (
              <div className="absolute top-0 left-0 w-[2px] h-full bg-[#df8326]" />
            )}
            {/* Ambient inner glow for the cards, inspired by Homepage glassmorphism */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.01] to-transparent" />
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#df8326]/3 blur-[50px] pointer-events-none group-hover:bg-[#df8326]/6 transition-all duration-500" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Inquiry Details */}
              <div className="flex flex-1 flex-col gap-4">
                {/* Header info */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-syne text-lg font-bold text-white transition-colors group-hover:text-[#df8326]">
                      {inq.name}
                    </h3>
                    {inq.company && (
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                        {inq.company}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {inq.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {shortDate(inq.created_at)}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                {inq.message ? (
                  <p className="max-w-3xl font-sans text-sm leading-relaxed text-zinc-300">
                    "{inq.message}"
                  </p>
                ) : (
                  <p className="font-sans text-xs text-zinc-600 italic">No project description message provided.</p>
                )}

                {/* Interests Tags & Budget */}
                <div className="flex flex-wrap items-center gap-4">
                  {inq.budget && (
                    <div className="flex items-center gap-1.5 rounded-xl border border-[#df8326]/20 bg-[#df8326]/5 px-3.5 py-1.5 font-mono text-[10px] text-[#df8326]">
                      <span>Budget: {inq.budget}</span>
                    </div>
                  )}

                  {inq.interests && inq.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {inq.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Side */}
              <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.04] pt-4 lg:border-t-0 lg:pt-0">
                {inq.status === "new" && (
                  <>
                    <button
                      onClick={() => handleArchive(inq.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
                      title="Archive Submission"
                    >
                      <Archive className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleConvert(inq.id)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#df8326] to-[#C57019] px-5 py-3 font-mono text-xs uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Convert to CRM Lead
                    </button>
                  </>
                )}

                {inq.status === "converted" && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#34d399]/20 bg-[#34d399]/5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-[#34d399]">
                    <Check className="h-4 w-4" />
                    Lead Created
                  </div>
                )}

                {inq.status === "archived" && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-500">
                    Archived
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredInquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] border-dashed bg-[#0a0a0d] py-20 text-center">
            <Inbox className="h-10 w-10 text-zinc-600 mb-4" />
            <h4 className="font-syne text-lg font-bold uppercase tracking-tight text-white">No inquiries found</h4>
            <p className="mt-1 font-sans text-xs text-zinc-500 max-w-sm">
              There are currently no contact form submissions categorized as "{activeFilter}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
