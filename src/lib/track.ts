/**
 * Client-side analytics helper — posts to the first-party /api/track endpoint.
 * No cookies, no third parties. Safe to call anywhere on the client; it is a
 * no-op on the server, inside /admin and when the visitor has opted out.
 */
type TrackKind = "pageview" | "event" | "vital";

interface TrackPayload {
  k: TrackKind;
  n?: string;
  p: string;
  r?: string;
  q?: string;
  v?: number;
  m?: Record<string, string>;
}

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

function send(payload: TrackPayload) {
  if (typeof window === "undefined") return;
  if (payload.p.startsWith("/admin") || optedOut()) return;

  const body = JSON.stringify(payload);
  // sendBeacon survives page unloads (needed for tel:/mailto:/outbound clicks and web vitals)
  if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) return;
  fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

export function trackPageview(path: string) {
  send({
    k: "pageview",
    p: path,
    r: document.referrer || undefined,
    q: window.location.search || undefined,
  });
}

/** Record an interaction. `name` must be snake_case — see lib/analytics-events.ts. */
export function track(name: string, meta?: Record<string, string>) {
  send({ k: "event", n: name, p: window.location.pathname, m: meta });
}

export function trackVital(name: string, value: number) {
  send({ k: "vital", n: name, p: window.location.pathname, v: value });
}
