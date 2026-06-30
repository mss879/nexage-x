import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { POSTS } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static, indexable routes with hand-tuned priorities.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services/software"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services/logistics"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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
