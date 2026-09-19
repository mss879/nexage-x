import type { Faq } from "@/content/blog";

/**
 * Contact page FAQs — one source for both the visible accordion
 * (sections/ContactFAQs.tsx) and the FAQPage JSON-LD (app/contact/page.tsx),
 * so the structured data can never drift from what visitors read.
 */
export const CONTACT_FAQS: Faq[] = [
  {
    q: "How fast can we start?",
    a: "Most engagements kick off within one to two weeks of our first call. Urgent work can often start sooner — just tell us your deadline.",
  },
  {
    q: "Do you handle both software and logistics?",
    a: "Yes — that's the point of YARI. We can build your storefront and app, automate the back office with Odoo/Zoho, and run fulfilment and freight as one connected operation.",
  },
  {
    q: "Can you integrate with our existing tools?",
    a: "Almost always. We specialise in connecting websites to ERPs and CRMs like Odoo and Zoho, plus Shopify, payment gateways, and custom APIs.",
  },
  {
    q: "What does a typical project cost?",
    a: "It depends on scope, but the budget options in the form give us a useful starting point. We'll always scope transparently before any commitment.",
  },
];
