"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Post } from "@/content/blog";

gsap.registerPlugin(useGSAP);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const accentByCategory: Record<Post["category"], string> = {
  Software: "#df8326",
  Automation: "#c084fc",
  Logistics: "#34d399",
  Design: "#22d3ee",
};

export default function ArticleHero({ post }: { post: Post }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const accent = accentByCategory[post.category];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".art-hero-line",
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 92%", once: true },
          }
        );
        gsap.fromTo(
          ".art-hero-fade",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.35,
            ease: "power3.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 92%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <header
      ref={heroRef}
      className="relative w-full overflow-hidden px-6 pt-36 pb-12 md:px-12 md:pt-40"
    >
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="grain-texture absolute inset-0 pointer-events-none" />
      <div
        className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full blur-[150px] pointer-events-none"
        style={{ backgroundColor: `${accent}1f` }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="art-hero-fade mb-8 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500"
        >
          <Link href="/" className="transition-colors hover:text-[#df8326]">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-[#df8326]">
            Journal
          </Link>
          <span>/</span>
          <span style={{ color: accent }}>{post.category}</span>
        </nav>

        <h1 className="font-syne text-[2.1rem] font-bold leading-[1.05] tracking-tight sm:text-[2.8rem] md:text-[3.4rem]">
          <span className="art-hero-line block">{post.title}</span>
        </h1>

        <div className="art-hero-fade mt-7 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          <span>{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span>{post.readTime} read</span>
        </div>

        <div className="art-hero-fade mt-8 flex flex-col gap-5 border-l-2 pl-5" style={{ borderColor: `${accent}66` }}>
          {post.intro.map((p, i) => (
            <p key={i} className="font-sans text-lg leading-[1.7] text-zinc-300 md:text-xl">
              {p}
            </p>
          ))}
        </div>
      </div>
    </header>
  );
}
