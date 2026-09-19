"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { track, trackPageview, trackVital } from "@/lib/track";
import { VITAL_NAMES } from "@/lib/analytics-events";

// Stable reference — a new function identity would re-report every metric
const reportVital = (metric: { name: string; value: number }) => {
  if ((VITAL_NAMES as readonly string[]).includes(metric.name)) trackVital(metric.name, metric.value);
};

/**
 * First-party analytics: a pageview per route change, delegated click
 * tracking for phone / email / outbound links and `data-track` elements,
 * and real-user Core Web Vitals. Mounted once in the root layout.
 */
export default function Tracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useReportWebVitals(reportVital);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageview(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, [data-track]");
      if (!el) return;

      const tagged = el.getAttribute("data-track");
      if (tagged) {
        track("cta_click", { cta: tagged });
        return;
      }

      const href = el.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("phone_click");
      else if (href.startsWith("mailto:")) track("email_click");
      else if (/^https?:\/\//.test(href)) {
        try {
          const host = new URL(href).host;
          if (host !== window.location.host) track("outbound_click", { host });
        } catch {
          /* ignore malformed hrefs */
        }
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
