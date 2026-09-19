"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { CONTACT_FAQS as FAQS } from "@/content/contact-faqs";

export default function ContactFAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="relative w-full border-t border-white/[0.06] bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
            FAQ
          </span>
          <h2 className="mt-4 font-michroma text-[1.8rem] font-normal uppercase leading-[1.15] tracking-tight sm:text-[2.4rem]">
            Questions, answered.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={faq.q} y={20}>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050508]">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                    aria-expanded={open}
                  >
                    <span className="font-syne text-lg font-semibold text-white">{faq.q}</span>
                    <Plus
                      className={`h-5 w-5 shrink-0 text-[#df8326] transition-transform duration-500 ${
                        open ? "rotate-[225deg]" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 font-sans text-sm leading-relaxed text-zinc-400">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
