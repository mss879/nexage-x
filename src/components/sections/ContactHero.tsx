"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function ContactHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".ct-hero-line",
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
          ".ct-hero-fade",
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
      className="relative w-full overflow-hidden px-6 pt-40 pb-12 md:px-12"
    >
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="grain-texture absolute inset-0 pointer-events-none" />
      <div className="absolute -right-10 top-0 h-[400px] w-[400px] rounded-full bg-[#df8326]/12 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="ct-hero-fade mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
            Available for new projects
          </span>
        </div>
        <h1 className="font-syne text-[3rem] font-bold uppercase leading-[0.92] tracking-tight sm:text-[4.5rem] md:text-[6rem]">
          <span className="block overflow-hidden">
            <span className="ct-hero-line block">Let's build</span>
          </span>
          <span className="block overflow-hidden">
            <span className="ct-hero-line block text-[#df8326]">something great.</span>
          </span>
        </h1>
        <p className="ct-hero-fade mt-8 max-w-2xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
          Tell us where you're headed. We usually reply within one business day.
        </p>
      </div>
    </section>
  );
}
