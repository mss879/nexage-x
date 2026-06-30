import type { Metadata } from "next";
import BlogContent from "@/components/pages/BlogContent";
import JsonLd from "@/components/seo/JsonLd";
import { POSTS } from "@/content/blog";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "The YARI Journal — E-commerce in Dubai, Explained",
  description:
    "Practical guides on building, integrating and scaling online stores in Dubai and the GCC — e-commerce development, Shopify, Odoo & Zoho integration, fulfilment and COD.",
  keywords: [
    "ecommerce blog Dubai",
    "ecommerce guides UAE",
    "Shopify Dubai",
    "fulfilment Dubai",
    "Odoo Zoho UAE",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    url: "/blog",
    title: "The YARI Journal — E-commerce in Dubai, Explained | YARI",
    description:
      "Guides on e-commerce, software, automation and logistics for Dubai and GCC brands.",
  },
};

export default function BlogPage() {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteUrl("/blog")}#blog`,
    name: "The YARI Journal",
    description:
      "Practical guides on building, integrating and scaling online stores in Dubai and the GCC.",
    url: absoluteUrl("/blog"),
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.date,
      dateModified: p.updated ?? p.date,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Journal", url: absoluteUrl("/blog") },
  ]);

  return (
    <>
      <JsonLd data={[blogSchema, breadcrumb]} />
      <BlogContent />
    </>
  );
}
