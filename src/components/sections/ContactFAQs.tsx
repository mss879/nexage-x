"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const FAQS = [
  {
    q: "How fast can we start?",
    a: "Most engagements kick off within one to two weeks of our first call. Urgent work can often start sooner — just tell us your deadline.",
  },
  {
    q: "Do you handle both software and logistics?",
    a: "Yes — that's the point of YARI. We can build your storefront and app, automate the back office with Odoo/Zoho, and run fulfilment and freight as one connected operation.",
  },
  {
    q: "Can you integrate with our existing tools?",
    a: "Almost always. We specialise in connecting websites to ERPs and CRMs like Odoo and Zoho, plus Shopify, payment gateways, and custom APIs.",
  },
  {
    q: "What does a typical project cost?",
    a: "It depends on scope, but the budget options in the form give us a useful starting point. We'll always scope transparently before any commitment.",
  },
];

export default function ContactFAQs() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="relative w-full border-t border-white/[0.06] bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-12 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
            FAQ
          </span>
          <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
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
