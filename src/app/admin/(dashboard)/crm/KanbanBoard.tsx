"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Edit3, DollarSign, Calendar, RefreshCw, X, Tag } from "lucide-react";
import { createLead, updateLead, deleteLead } from "@/app/admin/actions";

const STAGES = ["Lead", "Contacted", "Qualified", "Proposal", "Won", "Lost"] as const;
type Stage = (typeof STAGES)[number];

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email?: string;
  company?: string;
  budget?: string;
  message?: string;
  interests?: string[];
  stage: Stage;
  value: number;
  notes?: string;
}

const INTERESTS_OPTIONS = ["Software", "E-commerce", "Automation", "Odoo / Zoho", "Logistics", "Branding"];
const BUDGET_OPTIONS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

export default function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isPending, startTransition] = useTransition();


  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    stage: "Lead" as Stage,
    value: 0,
    notes: "",
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  // Drag and Drop
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const id = draggedLeadId || e.dataTransfer.getData("text/plain");
    if (!id) return;

    const leadToMove = leads.find((l) => l.id === id);
    if (!leadToMove || leadToMove.stage === targetStage) return;

    // Optimistic update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage: targetStage } : l))
    );

    // Call server
    const res = await updateLead(id, { stage: targetStage });
    if (!res.success) {
      // Revert if error
      setLeads(previousLeads);
      alert(res.error || "Failed to update lead stage.");
    }
  };


  // Manual Add submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setActionError(null);
    const res = await createLead({
      ...form,
      interests: selectedInterests,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      resetForm();
      window.location.reload();
    } else {
      setActionError(res.error || "Failed to create lead.");
    }
  };

  // Edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setActionError(null);
    const res = await updateLead(selectedLead.id, {
      ...form,
      interests: selectedInterests,
    });

    if (res.success) {
      setIsEditModalOpen(false);
      setSelectedLead(null);
      resetForm();
      window.location.reload();
    } else {
      setActionError(res.error || "Failed to update lead.");
    }
  };

  // Delete lead
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action is irreversible.")) return;

    const res = await deleteLead(id);
    if (res.success) {
      setIsEditModalOpen(false);
      setSelectedLead(null);
      resetForm();
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete lead.");
    }
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setForm({
      name: lead.name,
      email: lead.email || "",
      company: lead.company || "",
      budget: lead.budget || "",
      stage: lead.stage,
      value: lead.value,
      notes: lead.notes || "",
    });
    setSelectedInterests(lead.interests || []);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      company: "",
      budget: "",
      stage: "Lead",
      value: 0,
      notes: "",
    });
    setSelectedInterests([]);
    setActionError(null);
  };

  const toggleInterest = (i: string) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  // Calculate stats
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const stageTotals = STAGES.reduce((acc, stage) => {
    const list = leads.filter((l) => l.stage === stage);
    acc[stage] = {
      count: list.length,
      value: list.reduce((sum, curr) => sum + curr.value, 0),
    };
    return acc;
  }, {} as Record<Stage, { count: number; value: number }>);

  const totalPipelineValue = leads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Overview stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0d] p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Deals</span>
          <h2 className="mt-1 text-2xl font-bold font-syne">{leads.length} Active</h2>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0d] p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Pipeline Value</span>
          <h2 className="mt-1 text-2xl font-bold font-syne text-[#df8326]">{formatCurrency(totalPipelineValue)}</h2>
        </div>
        <div className="flex items-center justify-start gap-3 sm:justify-end">

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#df8326] to-[#C57019] px-5 py-3 font-mono text-xs uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const { count, value } = stageTotals[stage];

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/[0.05] bg-[#0a0a0d]/50 p-4 min-h-[580px]"
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-syne text-sm font-bold uppercase tracking-tight text-white">{stage}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] font-mono text-[10px] text-zinc-400">
                    {count}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-semibold text-zinc-500">
                  {value > 0 ? formatCurrency(value) : "$0"}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex flex-1 flex-col gap-3">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => openEditModal(lead)}
                    className="group relative flex flex-col gap-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c10] p-4.5 transition-all duration-300 hover:border-[#df8326]/40 hover:bg-[#121218] hover:shadow-lg cursor-grab active:cursor-grabbing"
                  >
                    {/* Title & Company */}
                    <div>
                      <h4 className="font-sans text-sm font-bold text-white group-hover:text-[#df8326] transition-colors leading-snug">
                        {lead.name}
                      </h4>
                      {lead.company && (
                        <p className="mt-0.5 font-sans text-xs text-zinc-400 font-medium">
                          {lead.company}
                        </p>
                      )}
                    </div>

                    {/* Meta info: Value & Date */}
                    <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                      <div className="flex items-center gap-1 text-[#df8326] font-mono text-[11px] font-semibold">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{lead.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(lead.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </div>

                    {/* Interests tags preview */}
                    {lead.interests && lead.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lead.interests.slice(0, 2).map((i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/[0.03] px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-zinc-400"
                          >
                            {i}
                          </span>
                        ))}
                        {lead.interests.length > 2 && (
                          <span className="rounded-md bg-white/[0.03] px-1.5 py-0.5 font-mono text-[8px] text-zinc-400">
                            +{lead.interests.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/[0.03] py-10 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    Empty Column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Modal ────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0a0a0d] p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold uppercase tracking-tight">Create CRM Lead</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-zinc-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 font-sans text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Contact Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="E.g. Sarah Connor"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sarah@cyberdyne.io"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Company Name</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Cyberdyne Systems"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Opportunity Value ($)</label>
                  <input
                    type="number"
                    value={form.value || ""}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    placeholder="25000"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Budget Range</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c10] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  >
                    <option value="">No budget specified</option>
                    {BUDGET_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Pipeline Stage</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c10] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests multi-select */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS_OPTIONS.map((o) => {
                    const active = selectedInterests.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => toggleInterest(o)}
                        className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                          active
                            ? "border-[#df8326] bg-[#df8326]/15 text-[#df8326]"
                            : "border-white/[0.08] bg-white/[0.01] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Notes & Description</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Details about client needs, meeting details..."
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-white focus:border-[#df8326] focus:outline-none resize-none"
                />
              </div>

              {actionError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {actionError}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-b from-[#df8326] to-[#C57019] py-3 font-mono text-xs uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01]"
              >
                Create Lead
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────── */}
      {isEditModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0a0a0d] p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-syne text-xl font-bold uppercase tracking-tight">Modify Lead</span>
                <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[8px] text-zinc-500">
                  ID: {selectedLead.id.slice(0, 8)}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLead(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-zinc-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 font-sans text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Contact Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Company Name</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Opportunity Value ($)</label>
                  <input
                    type="number"
                    value={form.value || ""}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Budget Range</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c10] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  >
                    <option value="">No budget specified</option>
                    {BUDGET_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Pipeline Stage</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0c0c10] px-4 py-2.5 text-white focus:border-[#df8326] focus:outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests multi-select */}
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS_OPTIONS.map((o) => {
                    const active = selectedInterests.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() => toggleInterest(o)}
                        className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer ${
                          active
                            ? "border-[#df8326] bg-[#df8326]/15 text-[#df8326]"
                            : "border-white/[0.08] bg-white/[0.01] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Notes & Description</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-white focus:border-[#df8326] focus:outline-none resize-none"
                />
              </div>

              {selectedLead.message && (
                <div className="flex flex-col gap-1 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
                  <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500">Original Inquiry Message</span>
                  <p className="font-sans text-[11px] leading-relaxed text-zinc-400 italic">
                    "{selectedLead.message}"
                  </p>
                </div>
              )}

              {actionError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                  {actionError}
                </div>
              )}

              <div className="mt-2 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedLead.id)}
                  className="col-span-1 flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 py-3 font-mono text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                <button
                  type="submit"
                  className="col-span-2 rounded-xl bg-gradient-to-b from-[#df8326] to-[#C57019] py-3 font-mono text-xs uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.01]"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
