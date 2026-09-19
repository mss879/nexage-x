/**
 * Knowledge base for the YARI AI assistant — generated from the website's own
 * content modules, never hand-copied. Whatever the pages say, the agent says:
 *
 *   lib/site.ts             → contact details, service area
 *   content/services.ts     → every service on /, /services/software, /services/logistics
 *   content/contact-faqs.ts → contact page FAQs
 *   content/blog/*          → all Journal articles (index + FAQs always; the
 *                             sections most relevant to the question in full)
 *
 * Add a page's copy to one of those modules and the agent learns it on the
 * next request — there is nothing to retrain.
 */
import { SITE, SOCIAL_PROFILES, absoluteUrl } from "@/lib/site";
import { POSTS, type Block, type Post, type Section } from "@/content/blog";
import { CONTACT_FAQS } from "@/content/contact-faqs";
import {
  HOME_AUTOMATION_SERVICES,
  HOME_ECOMMERCE_SERVICES,
  LOGISTICS_FLOW,
  LOGISTICS_SERVICES,
  ODOO_ZOHO_SYNC_ITEMS,
  SOFTWARE_SERVICES,
  type HomeService,
} from "@/content/services";

/** Contact form options (sections/ContactForm.tsx) — used when qualifying a lead. */
const BUDGET_BANDS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

const homeService = (s: HomeService) =>
  `- ${s.title}: ${s.description}${s.includes ? ` Includes: ${s.includes}` : ""} Deliverable: ${s.deliverable}`;

function blockText(block: Block): string {
  switch (block.type) {
    case "p":
    case "h3":
      return block.text;
    case "ul":
    case "ol":
      return block.items.map((item) => `- ${item}`).join("\n");
    case "quote":
      return `"${block.text}"`;
    case "callout":
      return `${block.title}: ${block.text}`;
    case "stats":
      return block.items.map((item) => `${item.value} — ${item.label}`).join("; ");
  }
}

const sectionText = (section: Section) => section.blocks.map(blockText).join("\n");

/** Everything that is always in the prompt. Built once per server instance. */
const STATIC_KNOWLEDGE = [
  `COMPANY
- ${SITE.name} (${SITE.legalName}) — ${SITE.tagline}
- Based in ${SITE.locality}, UAE. Serves: ${SITE.areaServed.join(", ")}.
- Four disciplines under one roof: Design (identity, art direction, conversion-grade interfaces), Engineering (custom web apps, storefronts, backends), Automation (workflows, AI agents, ERP integrations) and Logistics (fulfilment, freight, operations wired into the digital stack).
- Principles: craft over volume (fewer projects, more care), own the outcome (measured by client results), build to last (systems that scale after launch).`,

  `CONTACT
- Email: ${SITE.email}
${SITE.phones.map((p) => `- ${p.label} phone: ${p.number}`).join("\n")}
- Contact page (project form): ${absoluteUrl("/contact")}
- Social: ${Object.entries(SOCIAL_PROFILES).map(([network, url]) => `${network} ${url}`).join(", ")}
- Replies are usually within one business day. There is no public street address — do not give one.
- After someone submits the form: we review the brief, scope a focused 30-minute call, then send a proposal with scope, milestones and pricing, with no obligation.
- Budget bands on the form: ${BUDGET_BANDS.join(", ")}.`,

  `PAGES
- Home ${absoluteUrl("/")} · About ${absoluteUrl("/about")} · Services ${absoluteUrl("/services")}
- Software services ${absoluteUrl("/services/software")} · Logistics services ${absoluteUrl("/services/logistics")}
- Journal (blog) ${absoluteUrl("/blog")} · Contact ${absoluteUrl("/contact")}
- Privacy ${absoluteUrl("/privacy-policy")} · Terms ${absoluteUrl("/terms-and-conditions")}`,

  `SERVICES — E-COMMERCE GROWTH
${HOME_ECOMMERCE_SERVICES.map(homeService).join("\n")}`,

  `SERVICES — BUSINESS AUTOMATION
${HOME_AUTOMATION_SERVICES.map(homeService).join("\n")}`,

  `SERVICES — SOFTWARE (${absoluteUrl("/services/software")})
${SOFTWARE_SERVICES.map((s) => `- ${s.title}: ${s.body}`).join("\n")}
- A website ↔ Odoo / Zoho integration keeps these in sync: ${ODOO_ZOHO_SYNC_ITEMS.join(", ")}.`,

  `SERVICES — LOGISTICS (${absoluteUrl("/services/logistics")})
${LOGISTICS_SERVICES.map((s) => `- ${s.title}: ${s.body}`).join("\n")}
- Fulfilment flow: ${LOGISTICS_FLOW.map((f) => `${f.title} (${f.body})`).join(" → ")}`,

  `FREQUENTLY ASKED
${CONTACT_FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`,

  `JOURNAL ARTICLES (recommend the relevant one, with its link)
${POSTS.map(
  (post) => `## ${post.title}
URL: ${absoluteUrl(`/blog/${post.slug}`)}
Summary: ${post.description}
Covers: ${post.sections.map((s) => s.heading).join("; ")}
${post.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`
).join("\n\n")}`,
].join("\n\n");

/* ── Per-question retrieval over the full article text ─────────────────── */

const STOPWORDS = new Set(
  "the and for are but not you your with this that have has had from they will would can could should about what when where which who how why does did was were been being into than then them there here our out also just more most some any all get got use using need want like make much many very one two".split(" ")
);

const tokenize = (text: string): string[] =>
  text.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((w) => !STOPWORDS.has(w)) ?? [];

interface IndexedSection {
  post: Post;
  section: Section;
  heading: Set<string>;
  body: Set<string>;
  topic: Set<string>;
  text: string;
}

const SECTION_INDEX: IndexedSection[] = POSTS.flatMap((post) =>
  post.sections.map((section) => {
    const text = sectionText(section);
    return {
      post,
      section,
      text,
      heading: new Set(tokenize(section.heading)),
      body: new Set(tokenize(text)),
      topic: new Set(tokenize(`${post.title} ${post.keywords.join(" ")}`)),
    };
  })
);

const MAX_RETRIEVED_CHARS = 6000;

/** The article sections that best match the visitor's question, in full. */
function retrieve(query: string): string {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return "";

  const ranked = SECTION_INDEX.map((entry) => {
    let score = 0;
    for (const term of terms) {
      if (entry.heading.has(term)) score += 3;
      if (entry.topic.has(term)) score += 2;
      if (entry.body.has(term)) score += 1;
    }
    return { entry, score };
  })
    .filter((r) => r.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  let used = 0;
  const parts: string[] = [];
  for (const { entry } of ranked) {
    const chunk = `### ${entry.post.title} — ${entry.section.heading}\n(${absoluteUrl(`/blog/${entry.post.slug}`)}#${entry.section.id})\n${entry.text}`;
    if (used + chunk.length > MAX_RETRIEVED_CHARS) break;
    parts.push(chunk);
    used += chunk.length;
  }
  return parts.join("\n\n");
}

/**
 * Website knowledge for one turn: the always-on facts plus the article
 * passages relevant to what was just asked.
 */
export function buildKnowledge(latestUserMessage: string): string {
  const passages = retrieve(latestUserMessage);
  return passages
    ? `${STATIC_KNOWLEDGE}\n\nRELEVANT ARTICLE PASSAGES (full text)\n${passages}`
    : STATIC_KNOWLEDGE;
}
