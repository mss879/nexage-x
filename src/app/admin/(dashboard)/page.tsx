import React from "react";
import Link from "next/link";
import { Inbox, KanbanSquare, DollarSign, Award, MessageSquare, AlertCircle, ArrowUpRight, Check, FolderSync } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

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

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email?: string;
  company?: string;
  budget?: string;
  message?: string;
  interests?: string[];
  stage: "Lead" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
  value: number;
  notes?: string;
}

const stageColors: Record<Lead["stage"], { text: string; bg: string; border: string }> = {
  Lead: { text: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
  Contacted: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Qualified: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  Proposal: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  Won: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Lost: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

const statusColors: Record<Inquiry["status"], { text: string; bg: string; border: string }> = {
  new: { text: "text-[#df8326]", bg: "bg-[#df8326]/10", border: "border-[#df8326]/20" },
  converted: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  archived: { text: "text-zinc-500", bg: "bg-white/[0.02]", border: "border-white/5" },
};

export default async function AdminDashboardPage() {
  let inquiries: Inquiry[] = [];
  let leads: Lead[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    
    // Fetch inquiries and leads in parallel
    const [inquiriesRes, leadsRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("updated_at", { ascending: false }),
    ]);

    if (inquiriesRes.error) throw inquiriesRes.error;
    if (leadsRes.error) throw leadsRes.error;

    inquiries = inquiriesRes.data || [];
    leads = leadsRes.data || [];
  } catch (err: any) {
    console.error("Dashboard data fetch error:", err);
    fetchError = err.message || "Failed to load database records.";
  }

  // 1. Calculate Summary Metrics
  const totalInquiries = inquiries.length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;
  const totalLeads = leads.length;
  
  const totalPipelineValue = leads.reduce((sum, l) => sum + Number(l.value || 0), 0);
  const wonDealsValue = leads
    .filter((l) => l.stage === "Won")
    .reduce((sum, l) => sum + Number(l.value || 0), 0);

  // 2. Process Service Interests Breakdown (Website Data Preview)
  const interestCounts: Record<string, number> = {};
  inquiries.forEach((inq) => {
    if (inq.interests) {
      inq.interests.forEach((interest) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    }
  });

  const sortedInterests = Object.entries(interestCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const recentInquiries = inquiries.slice(0, 4);
  const recentLeads = leads.slice(0, 4);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const shortDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <div className="relative font-sans text-white">
      {/* Background radial glows to match homepage aesthetics */}
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute -left-20 top-10 h-[450px] w-[450px] rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />
      <div className="absolute -right-20 top-[30%] h-[400px] w-[400px] rounded-full bg-[#df8326]/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-2xl font-bold uppercase tracking-tight md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#df8326]">
          Studio Dashboard
        </h1>
        <p className="text-sm text-zinc-400 font-sans mt-1">
          Real-time analytics and summary of live data captured from the YARI storefront.
        </p>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
          Database Connection Warning: {fetchError}
        </div>
      )}

      {/* ── Summary Cards Grid ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 mb-8">
        {/* Card 1: New Submissions */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-5 hover:border-[#df8326]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(223,131,38,0.08)] group">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-[#df8326]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">New Inquiries</span>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-2xl font-bold font-syne text-[#df8326]">{newInquiriesCount}</h2>
            <span className="text-[10px] text-zinc-500">/ {totalInquiries} total</span>
          </div>
          <div className="absolute right-4 bottom-4 text-zinc-800/40 group-hover:text-[#df8326]/10 transition-colors duration-300">
            <Inbox className="h-7 w-7" />
          </div>
        </div>

        {/* Card 2: Total CRM Leads */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.06)] group">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-purple-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Deals in CRM</span>
          <h2 className="mt-2 text-2xl font-bold font-syne text-purple-400">{totalLeads}</h2>
          <div className="absolute right-4 bottom-4 text-zinc-800/40 group-hover:text-purple-500/10 transition-colors duration-300">
            <KanbanSquare className="h-7 w-7" />
          </div>
        </div>

        {/* Card 3: Pipeline Value */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-5 col-span-2 md:col-span-1 hover:border-[#df8326]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(223,131,38,0.08)] group">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-[#df8326]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Pipeline Value</span>
          <h2 className="mt-2 text-2xl font-bold font-syne text-[#df8326]">{formatCurrency(totalPipelineValue)}</h2>
          <div className="absolute right-4 bottom-4 text-zinc-800/40 group-hover:text-[#df8326]/10 transition-colors duration-300">
            <DollarSign className="h-7 w-7" />
          </div>
        </div>

        {/* Card 4: Won Value */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-5 col-span-2 md:col-span-1 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.06)] group">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-emerald-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Revenue Won</span>
          <h2 className="mt-2 text-2xl font-bold font-syne text-emerald-400">{formatCurrency(wonDealsValue)}</h2>
          <div className="absolute right-4 bottom-4 text-zinc-800/40 group-hover:text-emerald-500/10 transition-colors duration-300">
            <Award className="h-7 w-7" />
          </div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-5 col-span-2 lg:col-span-1 hover:border-[#df8326]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(223,131,38,0.08)] group">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-zinc-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Conversion Rate</span>
          <h2 className="mt-2 text-2xl font-bold font-syne text-zinc-300">
            {totalInquiries > 0
              ? `${Math.round((inquiries.filter(i => i.status === "converted").length / totalInquiries) * 100)}%`
              : "0%"}
          </h2>
          <div className="absolute right-4 bottom-4 text-zinc-800/40 group-hover:text-zinc-500/10 transition-colors duration-300">
            <FolderSync className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Layout ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Recent Inquiries Submissions (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-syne text-md font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-[#df8326]" />
              Recent Web Submissions
            </h3>
            <Link
              href="/admin/inquiries"
              className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-[#df8326] flex items-center gap-1 transition-colors"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentInquiries.map((inq) => {
              const theme = statusColors[inq.status];
              const isNew = inq.status === "new";
              return (
                <div
                  key={inq.id}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:bg-[#0f0f15] ${
                    isNew
                      ? "border-[#df8326]/30 hover:border-[#df8326]/60 hover:shadow-[0_0_20px_rgba(223,131,38,0.06)]"
                      : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  {isNew && (
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-[#df8326]" />
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-sans text-sm font-bold text-white group-hover:text-[#df8326] transition-colors">
                          {inq.name}
                        </h4>
                        {inq.company && (
                          <span className="rounded bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-zinc-400">
                            {inq.company}
                          </span>
                        )}
                        <span className="font-mono text-[9px] text-zinc-600">
                          {shortDate(inq.created_at)}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-zinc-400 line-clamp-2 max-w-2xl leading-relaxed">
                        {inq.message || <span className="text-zinc-600 italic">No project description message.</span>}
                      </p>
                    </div>

                    <span className={`shrink-0 rounded-md border ${theme.border} ${theme.bg} ${theme.text} px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider`}>
                      {inq.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {recentInquiries.length === 0 && (
              <div className="rounded-2xl border border-white/[0.06] bg-[#0c0c10] py-12 text-center font-mono text-xs text-zinc-500">
                No inquiries submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: CRM Deals & Analytics (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* CRM Leads Summary */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne text-md font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <KanbanSquare className="h-4.5 w-4.5 text-[#df8326]" />
                Recent CRM Deals
              </h3>
              <Link
                href="/admin/crm"
                className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-[#df8326] flex items-center gap-1 transition-colors"
              >
                Board <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentLeads.map((lead) => {
                const badge = stageColors[lead.stage];
                return (
                  <div
                    key={lead.id}
                    className="group relative rounded-xl border border-white/[0.06] bg-[#0a0a0d] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-[#0f0f15]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate">
                        <h4 className="font-sans text-xs font-bold text-white group-hover:text-[#df8326] transition-colors truncate">
                          {lead.name}
                        </h4>
                        <p className="font-sans text-[10px] text-zinc-500 truncate">
                          {lead.company || "Individual"}
                        </p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span className="font-mono text-xs font-semibold text-[#df8326]">
                          {formatCurrency(lead.value)}
                        </span>
                        <span className={`rounded border ${badge.border} ${badge.bg} ${badge.text} px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider`}>
                          {lead.stage}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {recentLeads.length === 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0d] py-8 text-center font-mono text-[10px] text-zinc-600">
                  No deals in CRM yet.
                </div>
              )}
            </div>
          </div>

          {/* Service Interests Breakdown (Website Analytics) */}
          <div className="flex flex-col gap-4">
            <h3 className="font-syne text-md font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <FolderSync className="h-4.5 w-4.5 text-[#df8326]" />
              Inquiry Interest Metrics
            </h3>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0d] p-5 flex flex-col gap-4">
              {sortedInterests.map((interest) => (
                <div key={interest.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-semibold text-zinc-300">{interest.name}</span>
                    <span className="font-mono text-zinc-500">
                      {interest.count} ({interest.percentage}%)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#df8326] to-[#C57019] rounded-full transition-all duration-500"
                      style={{ width: `${interest.percentage}%` }}
                    />
                  </div>
                </div>
              ))}

              {sortedInterests.length === 0 && (
                <div className="text-center font-mono text-[10px] text-zinc-600 py-6">
                  No interest metrics available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
