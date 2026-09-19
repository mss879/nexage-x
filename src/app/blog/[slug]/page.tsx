import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleContent from "@/components/pages/ArticleContent";
import JsonLd from "@/components/seo/JsonLd";
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/content/blog";
import { absoluteUrl } from "@/lib/site";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

// Only the posts in content/blog exist — unknown slugs 404 at the router
// instead of rendering on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return pageMetadata({
    // metaTitle already includes the brand suffix — use it verbatim so the
    // layout title template isn't appended twice.
    title: post.metaTitle,
    absoluteTitle: true,
    description: post.description,
    keywords: post.keywords,
    path: `/blog/${post.slug}`,
    image: { url: post.cover, alt: post.coverAlt, width: 1600, height: 900 },
    article: {
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.keywords,
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Journal", url: absoluteUrl("/blog") },
    { name: post.title, url: absoluteUrl(`/blog/${post.slug}`) },
  ]);

  return (
    <>
      <JsonLd
        data={[articleSchema(post), breadcrumb, faqSchema(post.faqs)]}
      />
      <ArticleContent post={post} related={related} />
    </>
  );
}
