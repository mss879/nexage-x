import type { BadgeTone } from "@/components/admin/ui";

/**
 * Status → badge tone. The admin has one accent, so progress through a
 * pipeline is shown by weight (outline → gold tint → solid gold) and closed
 * states are muted — never by a different hue per stage.
 */
export const LEAD_STAGE_TONE: Record<string, BadgeTone> = {
  Lead: "outline",
  Contacted: "outline",
  Qualified: "soft",
  Proposal: "soft",
  Won: "solid",
  Lost: "muted",
};

export const INQUIRY_STATUS_TONE: Record<string, BadgeTone> = {
  new: "soft",
  converted: "solid",
  archived: "muted",
};

export const SUBSCRIBER_STATUS_TONE: Record<string, BadgeTone> = {
  active: "soft",
  unsubscribed: "muted",
};
