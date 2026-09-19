import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientIpFrom } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { VITAL_NAMES } from "@/lib/analytics-events";

/**
 * First-party analytics ingest. Cookieless and anonymous by construction:
 * the IP and user agent are only ever used to derive a visitor hash that is
 * re-salted every day, then discarded — neither is stored.
 *
 * Always answers 204 so the endpoint reveals nothing about what it accepted.
 */

const MAX_BODY_BYTES = 2048;
const NO_CONTENT = () => new Response(null, { status: 204 });

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|scan|fetch|curl|wget|python|axios|node|go-http|java\/|uptime|pingdom|gtmetrix|facebookexternalhit|whatsapp|telegram|discord|slack|embedly|bingpreview|yandex|baidu|duckduck|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|perplexity|ccbot/i;

const EVENT_NAME = /^[a-z][a-z0-9_]{0,59}$/;
const SITE_HOST = new URL(SITE_URL).host.replace(/^www\./, "");

function clip(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function parseDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios|chromium/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function parseOs(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os x|macintosh/i.test(ua)) return "macOS";
  if (/linux|cros/i.test(ua)) return "Linux";
  return "Other";
}

/** Referring host, or null for direct / internal navigation. */
function externalReferrer(referrer: unknown): string | null {
  const raw = clip(referrer, 500);
  if (!raw) return null;
  try {
    const host = new URL(raw).host.replace(/^www\./, "");
    if (!host || host === SITE_HOST || host.startsWith("localhost")) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const headers = request.headers;

    // Respect explicit opt-outs
    if (headers.get("dnt") === "1" || headers.get("sec-gpc") === "1") return NO_CONTENT();

    const ua = headers.get("user-agent") ?? "";
    if (!ua || BOT_PATTERN.test(ua)) return NO_CONTENT();

    const ip = clientIpFrom(headers);
    if (!checkRateLimit(`track:${ip}`, 120, 60 * 1000)) return NO_CONTENT();

    const raw = await request.text();
    if (!raw || raw.length > MAX_BODY_BYTES) return NO_CONTENT();
    const body = JSON.parse(raw) as Record<string, unknown>;

    const kind = body.k;
    if (kind !== "pageview" && kind !== "event" && kind !== "vital") return NO_CONTENT();

    const path = clip(body.p, 300);
    if (!path || !path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return NO_CONTENT();
    }

    let name: string | null = null;
    let value: number | null = null;
    if (kind === "event") {
      name = clip(body.n, 60);
      if (!name || !EVENT_NAME.test(name)) return NO_CONTENT();
    } else if (kind === "vital") {
      name = clip(body.n, 10);
      if (!name || !(VITAL_NAMES as readonly string[]).includes(name)) return NO_CONTENT();
    }
    if (typeof body.v === "number" && Number.isFinite(body.v) && body.v >= 0 && body.v < 600_000) {
      value = Math.round(body.v * 1000) / 1000;
    }
    if (kind === "vital" && value === null) return NO_CONTENT();

    // UTM tags arrive as the landing URL's query string
    const query = new URLSearchParams(clip(body.q, 500) ?? "");

    // Small flat metadata only (e.g. which CTA, which link host)
    const meta: Record<string, string> = {};
    if (body.m && typeof body.m === "object") {
      for (const [key, val] of Object.entries(body.m as Record<string, unknown>).slice(0, 5)) {
        const v = clip(val, 120);
        if (v && /^[a-z_]{1,24}$/.test(key)) meta[key] = v;
      }
    }

    // Daily-rotating, non-reversible visitor id. Nothing identifying is persisted.
    const day = new Date().toISOString().slice(0, 10);
    const salt = process.env.ANALYTICS_SALT ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "yari";
    const visitorHash = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex");

    const country = (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "").toUpperCase();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return NO_CONTENT();

    const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from("analytics_events").insert({
      kind,
      name,
      path,
      referrer_host: kind === "pageview" ? externalReferrer(body.r) : null,
      utm_source: clip(query.get("utm_source"), 80),
      utm_medium: clip(query.get("utm_medium"), 80),
      utm_campaign: clip(query.get("utm_campaign"), 120),
      country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      os: parseOs(ua),
      visitor_hash: visitorHash,
      value,
      meta,
    });
    if (error) console.error("analytics insert failed:", error.message);
  } catch {
    // Malformed payloads are dropped silently
  }
  return NO_CONTENT();
}
