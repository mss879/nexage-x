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

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    // metaTitle already includes the brand suffix — opt out of the layout
    // title template so it isn't appended twice.
    title: { absolute: post.metaTitle },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.metaTitle,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.description,
    },
  };
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
