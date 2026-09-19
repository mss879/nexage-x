"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { createLead, updateLead, deleteLead } from "@/app/admin/actions";
import {
  Badge,
  Button,
  Chip,
  ErrorBanner,
  Field,
  Input,
  Modal,
  Select,
  StatCard,
  Textarea,
} from "@/components/admin/ui";
import { LEAD_STAGE_TONE } from "@/components/admin/status";
import { cn } from "@/lib/utils";

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

  // Same fields in the add and edit modals
  const formFields = (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contact name *" htmlFor="lead-name">
          <Input
            id="lead-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
        </Field>
        <Field label="Email address" htmlFor="lead-email">
          <Input
            id="lead-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="name@company.com"
          />
        </Field>
        <Field label="Company" htmlFor="lead-company">
          <Input
            id="lead-company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Company name"
          />
        </Field>
        <Field label="Opportunity value ($)" htmlFor="lead-value">
          <Input
            id="lead-value"
            type="number"
            min={0}
            value={form.value || ""}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            placeholder="25000"
          />
        </Field>
        <Field label="Budget range" htmlFor="lead-budget">
          <Select id="lead-budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
            <option value="">No budget specified</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pipeline stage" htmlFor="lead-stage">
          <Select
            id="lead-stage"
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
          >
            {STAGES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Interests">
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS_OPTIONS.map((o) => (
            <Chip key={o} selected={selectedInterests.includes(o)} onClick={() => toggleInterest(o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Notes" htmlFor="lead-notes">
        <Textarea
          id="lead-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Client needs, meeting notes…"
          className="resize-none"
        />
      </Field>
    </>
  );

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total deals" value={leads.length} />
        <StatCard label="Pipeline value" value={formatCurrency(totalPipelineValue)} emphasis />
        <div className="flex items-end justify-start sm:justify-end">
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const { count, value } = stageTotals[stage];

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex min-h-[560px] w-72 shrink-0 flex-col rounded-xl border border-stone-200 bg-stone-100/70 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Badge tone={LEAD_STAGE_TONE[stage]}>{stage}</Badge>
                  <span className="text-xs tabular-nums text-stone-500">{count}</span>
                </div>
                <span className="text-xs font-medium tabular-nums text-stone-500">{formatCurrency(value)}</span>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => openEditModal(lead)}
                    className={cn(
                      "flex cursor-grab flex-col gap-3 rounded-lg border border-stone-200 bg-white p-3.5 shadow-sm transition-colors duration-150 hover:border-gold-400 active:cursor-grabbing",
                      draggedLeadId === lead.id && "opacity-60"
                    )}
                  >
                    <div>
                      <h4 className="text-sm font-semibold leading-snug text-stone-900">{lead.name}</h4>
                      {lead.company && <p className="mt-0.5 text-xs text-stone-500">{lead.company}</p>}
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-2.5">
                      <span className="text-sm font-semibold tabular-nums text-gold-700">
                        {formatCurrency(lead.value)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] tabular-nums text-stone-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>

                    {lead.interests && lead.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lead.interests.slice(0, 2).map((i) => (
                          <Badge key={i} tone="muted">
                            {i}
                          </Badge>
                        ))}
                        {lead.interests.length > 2 && <Badge tone="muted">+{lead.interests.length - 2}</Badge>}
                      </div>
                    )}
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-stone-300 py-10 text-center text-xs text-stone-400">
                    Drop a deal here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add modal ─────────────────────────────────────── */}
      {isAddModalOpen && (
        <Modal title="Add lead" description="Create a deal in the pipeline." onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            {formFields}
            {actionError && <ErrorBanner>{actionError}</ErrorBanner>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create lead</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit modal ────────────────────────────────────── */}
      {isEditModalOpen && selectedLead && (
        <Modal title="Edit lead" description={`ID ${selectedLead.id.slice(0, 8)}`} onClose={closeEditModal}>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            {formFields}

            {selectedLead.message && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <span className="text-xs font-medium text-stone-500">Original inquiry message</span>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone-700">{selectedLead.message}</p>
              </div>
            )}

            {actionError && <ErrorBanner>{actionError}</ErrorBanner>}

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button variant="danger" onClick={() => handleDelete(selectedLead.id)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={closeEditModal}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
