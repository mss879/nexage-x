import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { POSTS } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  // Hand-maintained "last meaningfully changed" dates. Deliberately NOT
  // new Date(): stamping every route with the build time on each deploy teaches
  // Google that this sitemap's lastmod is noise, and it then ignores the
  // accurate per-post dates too. Bump a date when that page's content changes.
  const SITE_UPDATED = new Date("2026-09-19");
  const PRIVACY_UPDATED = new Date("2026-09-19");
  const TERMS_UPDATED = new Date("2026-09-16");
  const latestPost = new Date(
    Math.max(...POSTS.map((post) => new Date(post.updated ?? post.date).getTime()))
  );

  // Static, indexable routes with hand-tuned priorities.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services/software"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services/logistics"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: SITE_UPDATED, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/blog"), lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/privacy-policy"), lastModified: PRIVACY_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms-and-conditions"), lastModified: TERMS_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  // One entry per blog article, lastmod driven by the post's own date.
  const postRoutes: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: post.pillar ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
