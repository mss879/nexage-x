"use client";

import React, { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(useGSAP);

type Category = "Software" | "Automation" | "Logistics" | "Design";

interface Post {
  title: string;
  category: Category;
  date: string;
  readTime: string;
  excerpt: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    title: "Connecting your website to Odoo & Zoho without the chaos",
    category: "Software",
    date: "Jun 2026",
    readTime: "8 min",
    excerpt:
      "A practical guide to two-way sync between your storefront and back office — products, orders, inventory and invoices, all kept honest in real time.",
    featured: true,
  },
  {
    title: "The automation audit: where most brands are leaking hours",
    category: "Automation",
    date: "Jun 2026",
    readTime: "6 min",
    excerpt: "We map the five workflows almost every operator should automate first.",
  },
  {
    title: "Headless commerce in 2026: when it's worth it (and when it isn't)",
    category: "Software",
    date: "May 2026",
    readTime: "7 min",
    excerpt: "Performance, flexibility and cost — an honest framework for going headless.",
  },
  {
    title: "Fulfilment that scales: designing your first 3PL handoff",
    category: "Logistics",
    date: "May 2026",
    readTime: "5 min",
    excerpt: "How to move from packing in your garage to a connected fulfilment operation.",
  },
  {
    title: "AI agents that actually convert: lessons from 30 deployments",
    category: "Automation",
    date: "Apr 2026",
    readTime: "9 min",
    excerpt: "What separates a helpful sales assistant from an expensive chatbot.",
  },
  {
    title: "Designing a brand system that survives growth",
    category: "Design",
    date: "Apr 2026",
    readTime: "6 min",
    excerpt: "Tokens, type and motion — building identity that scales across every surface.",
  },
  {
    title: "COD, returns and trust in emerging markets",
    category: "Logistics",
    date: "Mar 2026",
    readTime: "7 min",
    excerpt: "Operational patterns for cash-on-delivery economies that protect your margin.",
  },
];

const CATEGORIES = ["All", "Software", "Automation", "Logistics", "Design"] as const;

const accentByCategory: Record<Category, string> = {
  Software: "#df8326",
  Automation: "#c084fc",
  Logistics: "#34d399",
  Design: "#22d3ee",
};

function PostCard({ post }: { post: Post }) {
  const accent = accentByCategory[post.category];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d] transition-all duration-500 hover:border-white/20 hover:bg-[#101015]">
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
        <span className="absolute bottom-4 right-5 font-mohave text-5xl font-bold uppercase tracking-tighter text-white/[0.06]">
          YARI
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          <span>{post.date}</span>
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
  );
}

export default function BlogContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const featured = POSTS.find((p) => p.featured)!;
  const rest = useMemo(() => POSTS.filter((p) => !p.featured), []);
  const filtered = useMemo(
    () => (active === "All" ? rest : rest.filter((p) => p.category === active)),
    [active, rest],
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".blog-hero-line",
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          },
        );
        gsap.fromTo(
          ".blog-hero-fade",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden px-6 pt-40 pb-12 md:px-12"
      >
        <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
        <div className="grain-texture absolute inset-0 pointer-events-none" />
        <div className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="blog-hero-fade mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
              The Journal
            </span>
          </div>
          <h1 className="font-syne text-[3rem] font-bold uppercase leading-[0.92] tracking-tight sm:text-[4.5rem] md:text-[6rem]">
            <span className="block overflow-hidden">
              <span className="blog-hero-line block">Field notes</span>
            </span>
            <span className="block overflow-hidden">
              <span className="blog-hero-line block text-[#df8326]">on building.</span>
            </span>
          </h1>
          <p className="blog-hero-fade mt-8 max-w-2xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            Practical writing on commerce, software, automation and logistics — straight from the
            studio floor.
          </p>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────── */}
      <section className="relative w-full px-6 pb-16 md:px-12">
        <Reveal y={40} className="mx-auto max-w-7xl">
          <article className="group relative grid grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0d] lg:grid-cols-2">
            <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 120% at 30% 10%, rgba(223,131,38,0.30) 0%, transparent 55%), linear-gradient(135deg,#15100a 0%,#0a0a0d 100%)",
                }}
              />
              <div className="absolute inset-0 cyber-grid opacity-[0.06]" />
              <span className="absolute bottom-6 right-6 font-mohave text-[7rem] font-bold uppercase leading-none tracking-tighter text-white/[0.05]">
                YARI
              </span>
              <span className="absolute left-6 top-6 rounded-full border border-[#df8326]/50 bg-[#df8326]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#df8326]">
                Featured · {featured.category}
              </span>
            </div>

            <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                <span>{featured.date}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{featured.readTime} read</span>
              </div>
              <h2 className="font-syne text-3xl font-bold leading-tight text-white transition-colors group-hover:text-[#df8326] md:text-4xl">
                {featured.title}
              </h2>
              <p className="max-w-lg font-sans text-base leading-relaxed text-zinc-400">
                {featured.excerpt}
              </p>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(197,112,25,0.3)] transition-transform duration-300 group-hover:scale-[1.03]">
                Read the guide
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </article>
        </Reveal>
      </section>

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
            {[
              { name: "Software" as const, count: "08", color: "#df8326", desc: "Web, apps & headless commerce" },
              { name: "Automation" as const, count: "06", color: "#c084fc", desc: "AI agents & workflows" },
              { name: "Logistics" as const, count: "05", color: "#34d399", desc: "Fulfilment, freight & ops" },
              { name: "Design" as const, count: "04", color: "#22d3ee", desc: "Brand systems & UX" },
            ].map((t) => (
              <button
                key={t.name}
                onClick={() => setActive(t.name)}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 text-left transition-all duration-500 hover:border-white/20 hover:bg-[#101015] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mohave text-3xl font-bold tracking-tighter" style={{ color: t.color }}>
                    {t.count}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                </div>
                <h3 className="font-syne text-lg font-bold uppercase tracking-tight text-white">{t.name}</h3>
                <p className="font-sans text-xs leading-relaxed text-zinc-500">{t.desc}</p>
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
              <PostCard key={post.title} post={post} />
            ))}
          </Reveal>

          {filtered.length === 0 && (
            <p className="py-16 text-center font-mono text-sm uppercase tracking-[0.16em] text-zinc-500">
              No articles in this category yet — check back soon.
            </p>
          )}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-[#df8326]/30 bg-gradient-to-br from-[#1a120a] via-[#0a0a0d] to-[#0a0a0d] p-8 md:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#df8326]/15 blur-[90px]" />
              <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="font-rock-salt text-base text-[#df8326]">Stay ahead</span>
                  <h2 className="mt-3 font-syne text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-4xl">
                    Field notes, in your inbox.
                  </h2>
                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-zinc-400">
                    One useful email a month on commerce, software and logistics. No spam —
                    unsubscribe anytime.
                  </p>
                </div>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brand.com"
                    className="w-full rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-3.5 font-sans text-sm text-white placeholder-zinc-600 transition-all duration-300 focus:border-[#df8326] focus:outline-none focus:ring-1 focus:ring-[#df8326]/50"
                  />
                  <button
                    type="submit"
                    disabled={subscribed}
                    className="shrink-0 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-7 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_rgba(197,112,25,0.3)] transition-all duration-300 hover:scale-[1.03] active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {subscribed ? "Subscribed!" : "Subscribe"}
                  </button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
