"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { type Post, type Category } from "@/content/blog";

const CATEGORIES = ["All", "Software", "Automation", "Logistics", "Design"] as const;

const accentByCategory: Record<Category, string> = {
  Software: "#df8326",
  Automation: "#c084fc",
  Logistics: "#34d399",
  Design: "#22d3ee",
};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function PostCard({ post }: { post: Post }) {
  const accent = accentByCategory[post.category];
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d] transition-all duration-500 hover:border-white/20 hover:bg-[#101015]">
        {/* visual band */}
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `radial-gradient(120% 120% at 20% 0%, ${accent}33 0%, transparent 55%), linear-gradient(135deg, #101015 0%, #0a0a0d 100%)`,
            }}
          />
          <div className="absolute inset-0 cyber-grid opacity-[0.06]" />
          <span
            className="absolute left-5 top-5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
          >
            {post.category}
          </span>
          {post.pillar && (
            <span className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300">
              Pillar
            </span>
          )}
          <span className="absolute bottom-4 right-5 font-mohave text-5xl font-bold uppercase tracking-tighter text-white/[0.06]">
            YARI
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            <span>{shortDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span>{post.readTime} read</span>
          </div>
          <h3 className="font-syne text-lg font-bold leading-snug text-white transition-colors group-hover:text-[#df8326] md:text-xl">
            {post.title}
          </h3>
          <p className="font-sans text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors group-hover:text-[#df8326]">
            Read article
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogGridWithFilter({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");

  const featured = useMemo(() => posts.find((p) => p.featured) ?? posts[0], [posts]);
  const rest = useMemo(() => posts.filter((p) => p.slug !== featured.slug), [posts, featured]);
  const filtered = useMemo(
    () => (active === "All" ? rest : rest.filter((p) => p.category === active)),
    [active, rest]
  );

  const topics = useMemo(
    () =>
      (["Software", "Automation", "Logistics", "Design"] as const).map((name) => ({
        name,
        color: accentByCategory[name],
        count: posts.filter((p) => p.category === name).length,
      })),
    [posts]
  );

  const topicDesc: Record<Category, string> = {
    Software: "Web, e-commerce & headless",
    Automation: "AI agents, ERP & workflows",
    Logistics: "Fulfilment, freight & COD",
    Design: "Brand systems & UX",
  };

  return (
    <>
      {/* ── Topics ───────────────────────────────────────── */}
      <section className="relative w-full px-6 pb-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
              Browse by topic
            </span>
            <h2 className="mt-3 font-syne text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              What we write about.
            </h2>
          </Reveal>

          <Reveal stagger={0.08} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topics.map((t) => (
              <button
                key={t.name}
                onClick={() => setActive(t.name)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 text-left transition-all duration-500 hover:border-white/20 hover:bg-[#101015] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mohave text-3xl font-bold tracking-tighter" style={{ color: t.color }}>
                    {String(t.count).padStart(2, "0")}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                </div>
                <h3 className="font-syne text-lg font-bold uppercase tracking-tight text-white">{t.name}</h3>
                <p className="font-sans text-xs leading-relaxed text-zinc-500">{topicDesc[t.name]}</p>
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Filter + grid ────────────────────────────────── */}
      <section className="relative w-full px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-all duration-300 cursor-pointer ${
                  active === cat
                    ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326]"
                    : "border-white/[0.1] text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Reveal key={active} as="div" stagger={0.08} y={36} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </Reveal>

          {filtered.length === 0 && (
            <p className="py-16 text-center font-mono text-sm uppercase tracking-[0.16em] text-zinc-500">
              No articles in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
