import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Quote, Plus } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import ContactCTA from "@/components/ui/ContactCTA";
import type { Post, Block } from "@/content/blog";
import ArticleHero from "@/components/sections/ArticleHero";

const accentByCategory: Record<Post["category"], string> = {
  Software: "#df8326",
  Automation: "#c084fc",
  Logistics: "#34d399",
  Design: "#22d3ee",
};

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="font-sans text-base leading-[1.85] text-zinc-300 md:text-[1.075rem]">
          {block.text}
        </p>
      );
    case "h3":
      return (
        <h3 className="mt-2 font-syne text-xl font-bold tracking-tight text-white md:text-2xl">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#df8326]" strokeWidth={2.4} />
              <span className="font-sans text-base leading-[1.7] text-zinc-300">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#df8326]/40 bg-[#df8326]/10 font-mono text-xs font-semibold text-[#df8326]">
                {i + 1}
              </span>
              <span className="pt-0.5 font-sans text-base leading-[1.7] text-zinc-300">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="relative my-2 rounded-2xl border border-[#df8326]/25 bg-gradient-to-br from-[#1a120a] via-[#0a0a0d] to-[#0a0a0d] p-7 md:p-9">
          <Quote className="mb-4 h-7 w-7 text-[#df8326]" />
          <p className="font-syne text-xl font-semibold leading-snug text-white md:text-2xl">
            {block.text}
          </p>
          {block.cite && (
            <footer className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[#df8326]">
              — {block.cite}
            </footer>
          )}
        </blockquote>
      );
    case "callout":
      return (
        <aside className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 md:p-7">
          <p className="font-syne text-base font-bold uppercase tracking-tight text-[#df8326]">
            {block.title}
          </p>
          <p className="mt-2 font-sans text-base leading-[1.7] text-zinc-300">{block.text}</p>
        </aside>
      );
    case "stats":
      return (
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3">
          {block.items.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 bg-[#0a0a0d] p-6">
              <span className="font-mohave text-4xl font-bold uppercase tracking-tighter text-[#df8326]">
                {s.value}
              </span>
              <span className="font-sans text-sm leading-snug text-zinc-400">{s.label}</span>
            </div>
          ))}
        </div>
      );
  }
}

export default function ArticleContent({
  post,
  related,
}: {
  post: Post;
  related: Post[];
}) {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <article>
        <ArticleHero post={post} />

        {/* ── Body + TOC ─────────────────────────────────── */}
        <div className="relative w-full px-6 pb-20 md:px-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  On this page
                </p>
                <nav className="flex flex-col gap-2.5 border-l border-white/[0.08]">
                  {post.sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="-ml-px border-l-2 border-transparent pl-4 font-sans text-sm leading-snug text-zinc-500 transition-colors hover:border-[#df8326] hover:text-white"
                    >
                      {s.heading}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Sections */}
            <div className="flex max-w-2xl flex-col gap-12">
              {post.sections.map((section) => (
                <Reveal key={section.id} as="section" y={24}>
                  <section id={section.id} className="scroll-mt-28">
                    <h2 className="mb-6 font-syne text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
                      {section.heading}
                    </h2>
                    <div className="flex flex-col gap-5">
                      {section.blocks.map((block, i) => (
                        <BlockRenderer key={i} block={block} />
                      ))}
                    </div>
                  </section>
                </Reveal>
              ))}

              {/* Keywords / tags */}
              <div className="flex flex-wrap gap-2 border-t border-white/[0.08] pt-8">
                {post.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────── */}
        {post.faqs.length > 0 && (
          <section className="relative w-full border-t border-white/[0.06] bg-[#0a0a0d] px-6 py-20 md:px-12 md:py-24">
            <div className="mx-auto max-w-3xl">
              <Reveal className="mb-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
                  FAQ
                </span>
                <h2 className="mt-3 font-syne text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  Frequently asked
                </h2>
              </Reveal>
              <div className="flex flex-col gap-3">
                {post.faqs.map((faq) => (
                  <Reveal key={faq.q} y={18}>
                    <details className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050508] [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5">
                        <span className="font-syne text-lg font-semibold text-white">{faq.q}</span>
                        <Plus className="h-5 w-5 shrink-0 text-[#df8326] transition-transform duration-300 group-open:rotate-45" />
                      </summary>
                      <p className="px-6 pb-6 font-sans text-base leading-[1.7] text-zinc-400">
                        {faq.a}
                      </p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Related ─────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="relative w-full border-t border-white/[0.06] bg-[#050508] px-6 py-20 md:px-12 md:py-24">
            <div className="mx-auto max-w-6xl">
              <Reveal className="mb-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
                  Keep reading
                </span>
                <h2 className="mt-3 font-syne text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  Related guides
                </h2>
              </Reveal>
              <Reveal stagger={0.08} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => {
                  const ra = accentByCategory[r.category];
                  return (
                    <Link
                      key={r.slug}
                      href={`/blog/${r.slug}`}
                      className="group flex h-full flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 transition-all duration-500 hover:border-white/20 hover:bg-[#101015]"
                    >
                      <span
                        className="w-fit rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                        style={{ color: ra, borderColor: `${ra}55`, backgroundColor: `${ra}14` }}
                      >
                        {r.category}
                      </span>
                      <h3 className="font-syne text-lg font-bold leading-snug text-white transition-colors group-hover:text-[#df8326]">
                        {r.title}
                      </h3>
                      <p className="font-sans text-sm leading-relaxed text-zinc-400">{r.excerpt}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors group-hover:text-[#df8326]">
                        Read
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Link>
                  );
                })}
              </Reveal>
            </div>
          </section>
        )}
      </article>

      <ContactCTA
        eyebrow="Work with YARI"
        title="Planning a store for Dubai?"
        body="From a high-converting storefront to Odoo & Zoho integration and end-to-end fulfilment — tell us what you're building and we'll map it."
      />
      <Footer />
    </main>
  );
}
