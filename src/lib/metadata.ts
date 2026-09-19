/**
 * Per-page metadata builder.
 *
 * In Next.js a page-level `openGraph` / `twitter` object REPLACES the parent
 * layout's — it is not merged. A page that only sets `openGraph.title` silently
 * loses og:image, og:type, og:site_name and og:locale, and inherits the
 * homepage's twitter:title. Building every page's metadata through this helper
 * keeps each share card complete and page-specific.
 */
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

interface PageMetadataInput {
  /** Page title WITHOUT the brand suffix — the layout template appends "| YARI". */
  title: string;
  /** Use `title` verbatim as the <title> (it already carries the brand). */
  absoluteTitle?: boolean;
  /** Meta description, aim for 120–160 characters. */
  description: string;
  /** Shorter line for social cards; falls back to `description`. */
  socialDescription?: string;
  /** Root-relative canonical path, e.g. "/services/software". */
  path: string;
  keywords?: string[];
  /** Root-relative or absolute share image; defaults to the generated OG card. */
  image?: { url: string; alt: string; width?: number; height?: number };
  /** Article-only Open Graph fields. */
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
    tags: string[];
  };
}

const DEFAULT_IMAGE = {
  url: SITE.ogImage,
  width: 1200,
  height: 630,
  alt: `${SITE.name} — e-commerce, software & logistics studio in Dubai`,
};

export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  socialDescription,
  path,
  keywords,
  image,
  article,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;
  const cardDescription = socialDescription ?? description;
  const images = [image ?? DEFAULT_IMAGE];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: article ? "article" : "website",
      siteName: SITE.name,
      locale: "en_AE",
      url: path,
      title: fullTitle,
      description: cardDescription,
      images,
      ...(article ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: cardDescription,
      images: images.map((img) => img.url),
    },
  };
}
