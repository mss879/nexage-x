"use client";

import React, { useState } from "react";
import { Inbox, CheckCircle2, Archive, Calendar, Mail, Check } from "lucide-react";
import { convertInquiryToLead, updateInquiryStatus } from "@/app/admin/actions";
import { Badge, Button, Card, Chip, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-5">
      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Chip key={filter} selected={activeFilter === filter} onClick={() => setActiveFilter(filter)} className="capitalize">
            {filter}
            <span className="ml-1.5 tabular-nums opacity-70">
              {inquiries.filter((inq) => inq.status === filter).length}
            </span>
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredInquiries.map((inq) => (
          <Card
            key={inq.id}
            className={cn("relative overflow-hidden p-5", inq.status === "new" && "border-gold-300")}
          >
            {inq.status === "new" && <div className="absolute left-0 top-0 h-full w-[3px] bg-gold-500" />}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-stone-900">{inq.name}</h3>
                    {inq.company && <Badge>{inq.company}</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                    <a href={`mailto:${inq.email}`} className="flex items-center gap-1.5 hover:text-stone-900">
                      <Mail className="h-3.5 w-3.5" />
                      {inq.email}
                    </a>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {shortDate(inq.created_at)}
                    </span>
                  </div>
                </div>

                {inq.message ? (
                  <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-stone-700">{inq.message}</p>
                ) : (
                  <p className="text-xs italic text-stone-400">No project description provided.</p>
                )}

                {(inq.budget || inq.interests?.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {inq.budget && <Badge tone="soft">Budget: {inq.budget}</Badge>}
                    {inq.interests?.map((interest) => (
                      <Badge key={interest}>{interest}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 border-t border-stone-200 pt-4 lg:border-t-0 lg:pt-0">
                {inq.status === "new" && (
                  <>
                    <Button variant="secondary" onClick={() => handleArchive(inq.id)} title="Archive submission">
                      <Archive className="h-4 w-4" />
                      Archive
                    </Button>
                    <Button onClick={() => handleConvert(inq.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Convert to lead
                    </Button>
                  </>
                )}

                {inq.status === "converted" && (
                  <Badge tone="solid" className="px-3 py-1 text-xs">
                    <Check className="h-3.5 w-3.5" />
                    Lead created
                  </Badge>
                )}

                {inq.status === "archived" && (
                  <Badge tone="muted" className="px-3 py-1 text-xs">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredInquiries.length === 0 && (
          <Card className="border-dashed">
            <EmptyState
              icon={Inbox}
              title="No inquiries here"
              description={`There are no contact form submissions marked “${activeFilter}”.`}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
