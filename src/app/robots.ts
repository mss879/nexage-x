import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin backend + API routes. /_next/ must stay crawlable — Google
        // needs the JS/CSS in there to render the pages.
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
