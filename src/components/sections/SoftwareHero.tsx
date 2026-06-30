"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function SoftwareHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".sw-hero-line",
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          }
        );
        gsap.fromTo(
          ".sw-hero-fade",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[78vh] w-full flex-col justify-center overflow-hidden px-6 pt-36 pb-20 md:px-12"
    >
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="grain-texture absolute inset-0 pointer-events-none" />
      <div className="absolute -left-20 top-20 h-[420px] w-[420px] rounded-full bg-[#06b6d4]/10 blur-[150px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-[360px] w-[360px] rounded-full bg-[#df8326]/12 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="sw-hero-fade mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
            Services / Software
          </span>
        </div>

        <h1 className="font-syne text-[2.6rem] font-bold uppercase leading-[0.92] tracking-tight sm:text-[4rem] md:text-[6rem]">
          <span className="block overflow-hidden">
            <span className="sw-hero-line block">Software that</span>
          </span>
          <span className="block overflow-hidden">
            <span className="sw-hero-line block text-[#df8326]">runs the business.</span>
          </span>
        </h1>

        <p className="sw-hero-fade mt-8 max-w-2xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
          E-commerce websites, apps, AI and integrations for brands in Dubai and the UAE —
          engineered to be fast, beautiful and wired into the tools you already run, from Shopify
          to Odoo and Zoho.
        </p>
      </div>
    </section>
  );
}
