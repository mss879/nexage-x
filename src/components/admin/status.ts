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

export const INVOICE_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "outline",
  sent: "soft",
  paid: "solid",
  void: "muted",
};

export const TODO_STATUS_TONE: Record<string, BadgeTone> = {
  todo: "outline",
  in_progress: "soft",
  done: "muted",
};

/** Only "high" asks for attention; normal and low stay quiet. */
export const TODO_PRIORITY_TONE: Record<string, BadgeTone> = {
  low: "muted",
  normal: "outline",
  high: "solid",
};

export const CLIENT_STATUS_TONE: Record<string, BadgeTone> = {
  active: "soft",
  archived: "muted",
};

export const PROJECT_STATUS_TONE: Record<string, BadgeTone> = {
  planned: "outline",
  active: "soft",
  on_hold: "outline",
  completed: "solid",
  cancelled: "muted",
};

export const TEAM_ROLE_TONE: Record<string, BadgeTone> = {
  super_admin: "solid",
  admin: "soft",
};
