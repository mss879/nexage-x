"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type ContactCTAProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
};

/** Shared closing call-to-action band that sits above the footer on inner pages. */
export default function ContactCTA({
  eyebrow = "Start a conversation",
  title = "Let's build something that scales.",
  body = "Tell us where you're headed. We'll map the design, software and logistics to get you there.",
}: ContactCTAProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#050508] px-6 py-24 md:px-12 md:py-36">
      <div className="absolute inset-0 cyber-grid opacity-[0.025] pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#df8326]/10 blur-[140px] pointer-events-none" />

      <Reveal className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="font-rock-salt text-base text-[#df8326]">{eyebrow}</span>
        <h2 className="mt-5 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h2>
        <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
          {body}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(197,112,25,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            Start a project
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href="mailto:contact@yari.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-zinc-200 transition-all duration-300 hover:border-[#df8326] hover:text-white"
          >
            contact@yari.com
          </a>
        </div>
      </Reveal>
    </section>
  );
}
