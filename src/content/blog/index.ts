import type { Post } from "./types";
import { post as ecommerceDubai } from "./ecommerce-website-development-dubai";
import { post as fulfilmentDubai } from "./ecommerce-fulfilment-logistics-dubai";
import { post as shopifyVsCustom } from "./shopify-vs-custom-ecommerce-uae";
import { post as odooZoho } from "./connect-online-store-odoo-zoho-uae";
import { post as cod } from "./cash-on-delivery-dubai-ecommerce";

export type { Post, Category, Section, Block, Faq } from "./types";

/** All articles, newest first. */
export const POSTS: Post[] = [
  ecommerceDubai,
  fulfilmentDubai,
  shopifyVsCustom,
  odooZoho,
  cod,
].sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPostSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post): Post[] {
  return post.related
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is Post => Boolean(p));
}

/** Estimated word count for a post (used for reading-time sanity / debugging). */
export function getWordCount(post: Post): number {
  const fromBlocks = post.sections.flatMap((s) => [
    s.heading,
    ...s.blocks.flatMap((b) => {
      switch (b.type) {
        case "p":
        case "h3":
          return [b.text];
        case "ul":
        case "ol":
          return b.items;
        case "quote":
          return [b.text];
        case "callout":
          return [b.title, b.text];
        case "stats":
          return b.items.flatMap((i) => [i.value, i.label]);
      }
    }),
  ]);
  const all = [...post.intro, ...fromBlocks, ...post.faqs.flatMap((f) => [f.q, f.a])];
  return all.join(" ").trim().split(/\s+/).length;
}
