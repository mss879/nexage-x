"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".about-hero-line",
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
          ".about-hero-fade",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            delay: 0.45,
            ease: "power3.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          }
        );
        gsap.to(".about-orb", {
          yPercent: -22,
          ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
        });
      });
      return () => mm.revert();
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden px-6 pt-32 pb-20 md:px-12"
    >
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="grain-texture absolute inset-0 pointer-events-none" />
      <div className="about-orb absolute -right-20 top-1/4 h-[460px] w-[460px] rounded-full bg-[#df8326]/12 blur-[150px] pointer-events-none" />
      <div className="about-orb absolute -left-32 bottom-10 h-[360px] w-[360px] rounded-full bg-[#8b5cf6]/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="about-hero-fade mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
            About YARI
          </span>
        </div>

        <h1 className="font-syne text-[3rem] font-bold uppercase leading-[0.92] tracking-tight sm:text-[4.5rem] md:text-[6.5rem]">
          <span className="block overflow-hidden">
            <span className="about-hero-line block">We engineer</span>
          </span>
          <span className="block overflow-hidden">
            <span className="about-hero-line block text-[#df8326]">momentum</span>
          </span>
          <span className="block overflow-hidden">
            <span className="about-hero-line block">for ambitious brands.</span>
          </span>
        </h1>

        <div className="about-hero-fade mt-10 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            YARI is a digital automation, e-commerce and logistics studio. We unite design,
            software and operations into one stack — so visionary brands can launch faster,
            run leaner and scale further.
          </p>
          <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            From a first pixel to the last mile, we own the systems that make growth feel
            effortless — and look unmistakably premium doing it.
          </p>
        </div>
      </div>

      <div className="about-hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          Scroll
        </span>
        <span className="h-10 w-[1px] bg-gradient-to-b from-[#df8326] to-transparent" />
      </div>
    </section>
  );
}
