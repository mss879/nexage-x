/**
 * JSON-LD structured data builders.
 *
 * These produce schema.org objects consumed by search engines for rich
 * results and entity understanding. Rendered into pages via the <JsonLd>
 * component (see components/seo/JsonLd.tsx).
 */
import { SITE, SITE_URL, SOCIAL_URLS, absoluteUrl } from "@/lib/site";
import type { Post, Faq } from "@/content/blog";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Organization — the central entity describing YARI for local + brand SEO. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: absoluteUrl(SITE.logo),
    image: absoluteUrl(SITE.ogImage),
    description: SITE.tagline,
    email: SITE.email,
    telephone: SITE.phones[0].e164,
    areaServed: SITE.areaServed,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    contactPoint: SITE.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.e164,
      contactType: "sales",
      areaServed: p.label === "UAE" ? "AE" : "GB",
      availableLanguage: ["en", "ar"],
    })),
    sameAs: SOCIAL_URLS,
  };
}

/** WebSite — enables sitelinks search box + ties pages to the site entity. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/**
 * ProfessionalService — strengthens local (Dubai) intent for the homepage.
 * Uses phone-only contact per the configured NAP (no street address).
 */
export function professionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE.name,
    image: absoluteUrl(SITE.ogImage),
    url: SITE_URL,
    telephone: SITE.phones[0].e164,
    email: SITE.email,
    priceRange: "$$",
    areaServed: SITE.areaServed,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    parentOrganization: { "@id": ORG_ID },
  };
}

/** Service offered by YARI, tied to the organization and its service area. */
export function serviceSchema(service: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  offers?: string[];
}) {
  const url = absoluteUrl(service.path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.name,
    description: service.description,
    serviceType: service.serviceType,
    url,
    provider: { "@id": ORG_ID },
    areaServed: SITE.areaServed,
    ...(service.offers
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: service.name,
            itemListElement: service.offers.map((offer) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: offer },
            })),
          },
        }
      : {}),
  };
}

/** Home → … breadcrumb from [label, path] pairs (Home is prepended). */
export function pageBreadcrumb(...trail: [name: string, path: string][]) {
  return breadcrumbSchema(
    [["Home", "/"] as [string, string], ...trail].map(([name, path]) => ({
      name,
      url: absoluteUrl(path),
    }))
  );
}

/** BreadcrumbList for a path of { name, url } items. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** FAQPage built from a list of Q&A pairs. */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Article (BlogPosting) schema for a single blog post. */
export function articleSchema(post: Post) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.cover),
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: "en",
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    author: { "@type": "Organization", name: post.author, "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
