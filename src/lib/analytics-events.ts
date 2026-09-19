/**
 * Names shared by the client tracker, the /api/track ingest route and the
 * admin dashboard. Keep in sync with v_conversions in
 * supabase/migrations/20260919120000_analytics.sql.
 */
export const EVENT_LABELS: Record<string, string> = {
  contact_submit: "Contact form submitted",
  newsletter_subscribe: "Newsletter signup",
  chat_lead: "Lead captured by AI chat",
  phone_click: "Phone number clicked",
  email_click: "Email address clicked",
  chat_open: "AI chat opened",
  chat_message: "AI chat message sent",
  cta_click: "Call-to-action clicked",
  outbound_click: "Outbound link clicked",
};

export const VITAL_NAMES = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;
export type VitalName = (typeof VITAL_NAMES)[number];

/** Google's Core Web Vitals thresholds: [good ≤, poor >]. CLS is unitless, the rest are ms. */
export const VITAL_THRESHOLDS: Record<VitalName, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

export const VITAL_DESCRIPTIONS: Record<VitalName, string> = {
  LCP: "Largest Contentful Paint — when the main content appears",
  INP: "Interaction to Next Paint — how fast the page reacts to input",
  CLS: "Cumulative Layout Shift — how much the layout jumps around",
  FCP: "First Contentful Paint — when anything first appears",
  TTFB: "Time to First Byte — server response time",
};
