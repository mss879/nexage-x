import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import { POSTS, type Post, type Category } from "@/content/blog";
import BlogHero from "@/components/sections/BlogHero";
import BlogGridWithFilter from "@/components/sections/BlogGridWithFilter";

const accentByCategory: Record<Category, string> = {
  Software: "#df8326",
  Automation: "#c084fc",
  Logistics: "#34d399",
  Design: "#22d3ee",
};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function BlogContent() {
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const featAccent = accentByCategory[featured.category];

  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <BlogHero />

      {/* ── Featured ─────────────────────────────────────── */}
      <section className="relative w-full px-6 pb-16 md:px-12">
        <Reveal y={40} className="mx-auto max-w-7xl">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="relative grid grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0d] lg:grid-cols-2">
              <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 10%, ${featAccent}4d 0%, transparent 55%), linear-gradient(135deg,#15100a 0%,#0a0a0d 100%)`,
                  }}
                />
                <div className="absolute inset-0 cyber-grid opacity-[0.06]" />
                <span className="absolute bottom-6 right-6 font-mohave text-[7rem] font-bold uppercase leading-none tracking-tighter text-white/[0.05]">
                  YARI
                </span>
                <span
                  className="absolute left-6 top-6 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: featAccent, borderColor: `${featAccent}80`, backgroundColor: `${featAccent}1a` }}
                >
                  Featured · {featured.category}
                </span>
              </div>

              <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
                <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  <span>{shortDate(featured.date)}</span>
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
          </Link>
        </Reveal>
      </section>

      {/* ── Topics & Grid with client filters ────────────── */}
      <BlogGridWithFilter posts={POSTS} />

      <Footer />
    </main>
  );
}
