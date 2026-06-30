import React from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, Truck, Layers, Gauge, Plug, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import ContactCTA from "@/components/ui/ContactCTA";
import ServicesHero from "@/components/sections/ServicesHero";

const CATEGORIES = [
  {
    href: "/services/software",
    icon: Code2,
    index: "01",
    title: "Software Services",
    blurb:
      "High-performance websites, custom web apps, AI agents, e-commerce and deep integrations — including wiring your site straight into Odoo & Zoho.",
    tags: ["Web & Apps", "AI Automation", "Odoo / Zoho", "Backends"],
    accent: true,
  },
  {
    href: "/services/logistics",
    icon: Truck,
    index: "02",
    title: "Logistics Services",
    blurb:
      "Fulfilment, warehousing, freight, COD and returns — operated as one connected system and synced live with your digital stack.",
    tags: ["Fulfilment", "Freight", "Warehousing", "Last Mile"],
  },
];

const PROCESS = [
  { step: "01", title: "Discover", body: "We audit your goals, systems and bottlenecks to find the highest-leverage moves." },
  { step: "02", title: "Design", body: "Identity, UX and architecture mapped into a clear, premium blueprint." },
  { step: "03", title: "Build", body: "Engineering storefronts, apps and integrations with production-grade quality." },
  { step: "04", title: "Automate", body: "Workflows, AI and ERP sync remove the manual work from your operation." },
  { step: "05", title: "Scale", body: "We measure, optimise and extend — across software and logistics alike." },
];

export default function ServicesContent() {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <ServicesHero />

      {/* ── Category split ───────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 pb-8 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const accent = (c as { accent?: boolean }).accent;
            return (
              <Reveal key={c.href} y={50}>
                <Link
                  href={c.href}
                  className={`group relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-3xl border p-8 transition-all duration-500 md:p-10 ${
                    accent
                      ? "border-[#ffd5a8]/40 bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c]"
                      : "border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent hover:border-[#df8326]/40"
                  }`}
                >
                  {!accent && (
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#df8326]/0 blur-[100px] transition-all duration-700 group-hover:bg-[#df8326]/15" />
                  )}
                  {accent && (
                    <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/15 blur-[90px]" />
                  )}

                  <div className="relative z-10 flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-500 ${
                        accent
                          ? "border-black/20 bg-black/10 text-black"
                          : "border-white/[0.08] bg-white/[0.03] text-[#df8326] group-hover:border-[#df8326]/40 group-hover:bg-[#df8326]/10"
                      }`}
                    >
                      <Icon className="h-7 w-7" strokeWidth={1.6} />
                    </div>
                    <span className={`font-mono text-xs ${accent ? "text-black/50" : "text-[#df8326]/70"}`}>
                      {c.index}
                    </span>
                  </div>

                  <div className="relative z-10 mt-8">
                    <h2
                      className={`font-syne text-3xl font-bold uppercase tracking-tight md:text-4xl ${accent ? "text-black" : "text-white"}`}
                    >
                      {c.title}
                    </h2>
                    <p
                      className={`mt-4 max-w-md font-sans text-sm leading-relaxed md:text-base ${accent ? "text-black/75" : "text-zinc-400"}`}
                    >
                      {c.blurb}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                            accent
                              ? "border-black/20 bg-black/5 text-black/70"
                              : "border-white/[0.08] bg-white/[0.02] text-zinc-400"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <span
                      className={`mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                        accent ? "text-black" : "text-white group-hover:text-[#df8326]"
                      }`}
                    >
                      Explore
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">How we work</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              A clear path from idea to scale.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-5">
            {PROCESS.map((p) => (
              <Reveal key={p.step} y={30}>
                <div className="group flex h-full flex-col gap-4 bg-[#0a0a0d] p-7 transition-colors duration-500 hover:bg-[#101015]">
                  <span className="font-mohave text-4xl font-bold uppercase tracking-tighter text-white/15 transition-colors duration-500 group-hover:text-[#df8326]">
                    {p.step}
                  </span>
                  <h3 className="font-syne text-lg font-bold uppercase tracking-tight">{p.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-zinc-400">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why YARI ─────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t border-white/[0.06] bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
        <div className="pointer-events-none absolute -left-20 top-1/3 h-[360px] w-[360px] rounded-full bg-[#df8326]/8 blur-[150px]" />
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">Why YARI</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              One team, end to end.
            </h2>
            <p className="mt-5 font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              Most brands juggle a design agency, a dev shop and a 3PL — and lose weeks in the gaps
              between them. We close those gaps by owning the whole stack.
            </p>
          </Reveal>

          <Reveal
            stagger={0.1}
            className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Layers, t: "Full-stack studio", d: "Design, software and logistics under one roof — no hand-offs, no finger-pointing.", accent: true },
              { icon: Gauge, t: "Built for speed", d: "Performance-obsessed builds that load fast and convert harder." },
              { icon: Plug, t: "Deep integrations", d: "Your site wired into Odoo, Zoho, Shopify and the tools you already run." },
              { icon: ShieldCheck, t: "Outcome-driven", d: "We measure success by your revenue and saved hours — not deliverables." },
            ].map((item) => {
              const Icon = item.icon;
              const accent = (item as { accent?: boolean }).accent;
              return (
                <div
                  key={item.t}
                  className={`group relative flex flex-col gap-5 p-8 transition-colors duration-500 ${
                    accent ? "bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c]" : "bg-[#0a0a0d] hover:bg-[#101015]"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500 ${
                      accent
                        ? "border-black/20 bg-black/10 text-black"
                        : "border-white/[0.08] bg-white/[0.03] text-[#df8326] group-hover:border-[#df8326]/40 group-hover:bg-[#df8326]/10"
                    }`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <h3 className={`font-syne text-xl font-bold uppercase tracking-tight ${accent ? "text-black" : "text-white"}`}>
                    {item.t}
                  </h3>
                  <p className={`font-sans text-sm leading-relaxed ${accent ? "text-black/75" : "text-zinc-400"}`}>
                    {item.d}
                  </p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ── Capability marquee ───────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-[#0a0a0d] py-6">
        <Marquee
          speed={30}
          items={["Shopify", "·", "Next.js", "·", "Odoo", "·", "Zoho", "·", "AI Agents", "·", "Freight", "·", "Fulfilment", "·", "Make.com", "·"]}
          itemClassName="px-6 font-mohave text-3xl font-semibold uppercase tracking-tighter text-white/25"
        />
      </div>

      <ContactCTA />
      <Footer />
    </main>
  );
}
