/**
 * Content model for YARI Journal articles.
 *
 * Articles are authored as structured data (not raw HTML/MDX) so the same
 * source renders the reading view, the table of contents, the JSON-LD
 * Article/FAQ schema and the sitemap — all kept in sync automatically.
 */

export type Category = "Software" | "Automation" | "Logistics" | "Design";

/** A renderable block inside an article section. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title: string; text: string }
  | { type: "stats"; items: { value: string; label: string }[] };

/** A top-level section. `heading` becomes an <h2> and a TOC anchor. */
export interface Section {
  /** Stable id used for the in-page anchor + table of contents. */
  id: string;
  heading: string;
  blocks: Block[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface Post {
  slug: string;
  /** Visible article title (H1). */
  title: string;
  /** <title> tag — usually keyword-led and a touch longer than the H1. */
  metaTitle: string;
  /** Meta description (~150–160 chars). */
  description: string;
  category: Category;
  /** Whether this is a long-form pillar page (vs a supporting post). */
  pillar?: boolean;
  /** Whether to feature this on the blog index hero. */
  featured?: boolean;
  /** ISO date (YYYY-MM-DD) — drives <time>, sitemap lastmod and JSON-LD. */
  date: string;
  /** ISO date of last meaningful update. Defaults to `date`. */
  updated?: string;
  readTime: string;
  author: string;
  /** Target SEO keywords for this article. */
  keywords: string[];
  /** Short card/summary excerpt. */
  excerpt: string;
  /** Opening paragraphs shown above the table of contents. */
  intro: string[];
  sections: Section[];
  faqs: Faq[];
  /** Slugs of related posts for internal linking (topic cluster). */
  related: string[];
}
