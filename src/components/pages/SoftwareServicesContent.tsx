import React from "react";
import {
  Globe,
  Gauge,
  ShoppingBag,
  Bot,
  Workflow,
  Boxes,
  Database,
  Palette,
  ArrowRight,
  Check,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import ContactCTA from "@/components/ui/ContactCTA";
import SoftwareHero from "@/components/sections/SoftwareHero";

const SERVICES = [
  {
    icon: Globe,
    num: "01",
    title: "Custom Web & Web Apps",
    body: "Bespoke, production-grade applications built around your workflows — fast, secure and scalable.",
    featured: false,
  },
  {
    icon: Gauge,
    num: "02",
    title: "Smart Websites",
    body: "SEO-optimised, lightning-fast marketing sites engineered to convert traffic into pipeline.",
    featured: false,
  },
  {
    icon: ShoppingBag,
    num: "03",
    title: "E-commerce & Shopify",
    body: "High-converting storefronts, custom sections and checkout optimisation built for revenue.",
    featured: false,
  },
  {
    icon: Bot,
    num: "04",
    title: "AI Assistants & Chatbots",
    body: "24/7 AI agents that qualify leads, support customers and handle routine work across channels.",
    featured: false,
  },
  {
    icon: Workflow,
    num: "05",
    title: "Workflow Automation",
    body: "Connect your tools and eliminate manual tasks with reliable, monitored automation pipelines.",
    featured: false,
  },
  {
    icon: Database,
    num: "06",
    title: "Custom Backend Systems",
    body: "Secure databases, APIs and dashboards that run the operational core of your business.",
    featured: false,
  },
  {
    icon: Boxes,
    num: "07",
    title: "Website + Odoo & Zoho Integration",
    body: "Wire your site and storefront directly into Odoo ERP and Zoho — one synchronized source of truth across CRM, inventory, accounting and fulfilment.",
    featured: true,
  },
  {
    icon: Palette,
    num: "08",
    title: "Brand Kits & Identity",
    body: "A consistent visual system across product, web, ads and social — unmistakably yours.",
    featured: false,
  },
];

const SYNC_ITEMS = [
  "Products & catalogue",
  "Customers & contacts",
  "Orders & invoices",
  "Inventory & stock levels",
  "Payments & reconciliation",
  "Chart of accounts & taxes",
];

export default function SoftwareServicesContent() {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <SoftwareHero />

      {/* ── Services grid ────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 pb-24 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.num} y={40} className={s.featured ? "lg:col-span-2" : ""}>
                <div
                  className={`group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border p-7 transition-all duration-500 md:p-8 ${
                    s.featured
                      ? "border-[#df8326]/40 bg-gradient-to-br from-[#df8326]/[0.12] via-[#1a120a] to-[#0a0a0d]"
                      : "border-white/[0.08] bg-[#0a0a0d] hover:border-white/20 hover:bg-[#101015]"
                  }`}
                >
                  {s.featured && (
                    <span className="absolute right-6 top-6 rounded-full border border-[#df8326]/40 bg-[#df8326]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#df8326]">
                      Featured
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#df8326] transition-all duration-500 group-hover:border-[#df8326]/40 group-hover:bg-[#df8326]/10">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </div>
                    <span className="font-mono text-xs text-white/30">{s.num}</span>
                  </div>
                  <h3 className="font-syne text-xl font-bold uppercase tracking-tight md:text-2xl">
                    {s.title}
                  </h3>
                  <p className="max-w-lg font-sans text-sm leading-relaxed text-zinc-400">
                    {s.body}
                  </p>
                  {!s.featured && (
                    <span className="mt-auto h-[2px] w-0 bg-[#df8326] transition-all duration-500 group-hover:w-full" />
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Odoo / Zoho deep dive ────────────────────────── */}
      <section className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
        <div className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-16 max-w-3xl text-center">
            <span className="font-rock-salt text-base text-[#df8326]">Spotlight integration</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              Your website, fused with Odoo & Zoho.
            </h2>
            <p className="mt-6 font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              Most brands run a storefront in one place and their back office in another — then
              waste hours re-keying data between them. We build the middleware that connects your
              site to <span className="text-white">Odoo ERP</span> and tools like{" "}
              <span className="text-white">Zoho CRM & Books</span>, so everything stays in sync,
              automatically.
            </p>
          </Reveal>

          {/* Flow diagram */}
          <Reveal y={40} className="mb-16">
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-center">
              {[
                { label: "Your Website", sub: "Storefront · Forms · Checkout" },
                { label: "YARI Middleware", sub: "Secure two-way API sync", glow: true },
                { label: "Odoo · Zoho", sub: "ERP · CRM · Accounting" },
              ].map((node, i) => (
                <React.Fragment key={node.label}>
                  <div
                    className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border px-6 py-8 text-center transition-colors ${
                      node.glow
                        ? "border-[#df8326]/40 bg-[#df8326]/[0.08] shadow-[0_0_40px_rgba(223,131,38,0.15)]"
                        : "border-white/[0.08] bg-white/[0.02]"
                    }`}
                  >
                    <span className="font-syne text-lg font-bold uppercase tracking-tight text-white">
                      {node.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                      {node.sub}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="flex items-center justify-center text-[#df8326] md:rotate-0">
                      <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h3 className="font-syne text-2xl font-bold uppercase tracking-tight text-white">
                What stays in sync
              </h3>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SYNC_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#df8326]" />
                    <span className="font-sans text-sm text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.05}>
              <h3 className="font-syne text-2xl font-bold uppercase tracking-tight text-white">
                Why it matters
              </h3>
              <div className="mt-6 flex flex-col gap-5">
                {[
                  { t: "No manual re-entry", d: "Orders, customers and stock flow automatically between systems." },
                  { t: "One source of truth", d: "Sales, inventory and accounting always agree — in real time." },
                  { t: "Scales with you", d: "Custom Odoo modules and Zoho workflows tailored to your operation." },
                ].map((r) => (
                  <div key={r.t} className="border-l-2 border-[#df8326]/50 pl-5">
                    <p className="font-syne text-lg font-semibold text-white">{r.t}</p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-zinc-400">{r.d}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How we build ─────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">How we build</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              From brief to launch.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Scope & strategy", d: "We map your goals, users and systems into a clear technical plan." },
              { n: "02", t: "Design & architect", d: "UX, UI and data architecture designed before a line of code is written." },
              { n: "03", t: "Build & integrate", d: "Production-grade engineering wired into Odoo, Zoho, Shopify and your stack." },
              { n: "04", t: "Launch & iterate", d: "We ship, measure and keep optimising long after go-live." },
            ].map((s) => (
              <Reveal key={s.n} y={30}>
                <div className="group flex h-full flex-col gap-4 bg-[#0a0a0d] p-7 transition-colors duration-500 hover:bg-[#101015]">
                  <span className="font-mohave text-4xl font-bold uppercase tracking-tighter text-white/15 transition-colors duration-500 group-hover:text-[#df8326]">
                    {s.n}
                  </span>
                  <h3 className="font-syne text-lg font-bold uppercase tracking-tight">{s.t}</h3>
                  <p className="font-sans text-sm leading-relaxed text-zinc-400">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack marquee ────────────────────────────────── */}
      <div className="border-b border-white/[0.06] bg-[#050508] py-6">
        <Marquee
          speed={26}
          items={["Next.js", "·", "React", "·", "Shopify", "·", "Odoo", "·", "Zoho", "·", "Node", "·", "Postgres", "·", "OpenAI", "·", "Make.com", "·"]}
          itemClassName="px-6 font-mohave text-3xl font-semibold uppercase tracking-tighter text-white/25"
        />
      </div>

      <ContactCTA
        eyebrow="Software services"
        title="Let's wire up your stack."
        body="From a new storefront to a full Odoo & Zoho integration — tell us what you're running and we'll connect it."
      />
      <Footer />
    </main>
  );
}
