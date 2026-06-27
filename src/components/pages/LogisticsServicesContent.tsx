"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  PackageCheck,
  Warehouse,
  Plane,
  Banknote,
  Undo2,
  Globe2,
  RefreshCw,
  MapPin,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import Counter from "@/components/ui/Counter";
import Marquee from "@/components/ui/Marquee";
import ContactCTA from "@/components/ui/ContactCTA";

gsap.registerPlugin(useGSAP);

const SERVICES = [
  { icon: PackageCheck, num: "01", title: "Fulfilment Management", body: "Pick, pack and dispatch handled end-to-end so every order moves the moment it lands." },
  { icon: Warehouse, num: "02", title: "Warehousing", body: "Secure storage with real-time inventory monitoring and stock-level syncing to your store." },
  { icon: Plane, num: "03", title: "Freight & Shipping", body: "Air, sea and ground freight coordination with the right carrier for every lane." },
  { icon: Banknote, num: "04", title: "COD Management", body: "Cash-on-delivery handling, reconciliation and reporting built for emerging markets." },
  { icon: Undo2, num: "05", title: "Returns & Reverse Logistics", body: "Painless returns, inspection and restocking that protect margin and the customer." },
  { icon: Globe2, num: "06", title: "International Shipping", body: "Cross-border coordination, customs docs and duties handled without the headaches." },
  { icon: RefreshCw, num: "07", title: "Inventory Sync", body: "Live two-way stock sync between warehouse, storefront and ERP — no overselling.", accent: true },
  { icon: MapPin, num: "08", title: "Last-Mile Delivery", body: "Reliable final-leg delivery partners with tracking your customers actually trust." },
];

const STATS = [
  { to: 2.1, suffix: "M+", label: "Orders fulfilled", decimals: 1 },
  { to: 18, suffix: "", label: "Countries shipped" },
  { to: 99.4, suffix: "%", label: "On-time dispatch", decimals: 1 },
  { to: 24, suffix: "h", label: "Avg. handling time" },
];

const FLOW = [
  { step: "01", title: "Receive", body: "Inbound stock checked, logged and shelved." },
  { step: "02", title: "Store", body: "Inventory tracked live and synced to your store." },
  { step: "03", title: "Pick & Pack", body: "Orders fulfilled fast with branded packaging." },
  { step: "04", title: "Ship", body: "Best-fit carrier selected for every destination." },
  { step: "05", title: "Track & Return", body: "Live tracking plus effortless reverse logistics." },
];

export default function LogisticsServicesContent() {
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".lg-hero-line",
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          },
        );
        gsap.fromTo(
          ".lg-hero-fade",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: { trigger: heroRef.current, start: "top 90%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[78vh] w-full flex-col justify-center overflow-hidden px-6 pt-36 pb-20 md:px-12"
      >
        <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
        <div className="grain-texture absolute inset-0 pointer-events-none" />
        <div className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-[#34d399]/8 blur-[150px] pointer-events-none" />
        <div className="absolute -left-20 bottom-0 h-[360px] w-[360px] rounded-full bg-[#df8326]/12 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="lg-hero-fade mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">
              Services / Logistics
            </span>
          </div>

          <h1 className="font-syne text-[2.6rem] font-bold uppercase leading-[0.92] tracking-tight sm:text-[4rem] md:text-[6rem]">
            <span className="block overflow-hidden">
              <span className="lg-hero-line block">From click</span>
            </span>
            <span className="block overflow-hidden">
              <span className="lg-hero-line block">
                to <span className="text-[#df8326]">doorstep.</span>
              </span>
            </span>
          </h1>

          <p className="lg-hero-fade mt-8 max-w-2xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            We operate the physical side of your business — fulfilment, freight and returns — as a
            single connected system, synced live with your storefront and ERP.
          </p>
        </div>
      </section>

      {/* ── Network stats ────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#0a0a0d] px-6 py-16 md:px-12 md:py-20">
        <Reveal stagger={0.12} className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-start">
              <span className="font-mohave text-5xl font-bold uppercase tracking-tighter text-[#df8326] md:text-6xl">
                <Counter to={s.to} suffix={s.suffix} decimals={(s as { decimals?: number }).decimals ?? 0} />
              </span>
              <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── Services grid ────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">Capabilities</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              The full operations stack.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              const accent = (s as { accent?: boolean }).accent;
              return (
                <Reveal key={s.num} y={40}>
                  <div
                    className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
                      accent
                        ? "border-[#ffd5a8]/40 bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c]"
                        : "border-white/[0.08] bg-[#0a0a0d] hover:border-[#df8326]/30 hover:bg-[#101015]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-500 ${
                          accent
                            ? "border-black/20 bg-black/10 text-black"
                            : "border-white/[0.08] bg-white/[0.03] text-[#df8326] group-hover:border-[#df8326]/40 group-hover:bg-[#df8326]/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </div>
                      <span className={`font-mono text-xs ${accent ? "text-black/40" : "text-white/30"}`}>
                        {s.num}
                      </span>
                    </div>
                    <h3
                      className={`font-syne text-lg font-bold uppercase leading-tight tracking-tight ${accent ? "text-black" : "text-white"}`}
                    >
                      {s.title}
                    </h3>
                    <p className={`font-sans text-sm leading-relaxed ${accent ? "text-black/75" : "text-zinc-400"}`}>
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Flow ─────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t border-white/[0.06] bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
              How it flows
            </span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              Five steps, fully tracked.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-5">
            {FLOW.map((f) => (
              <Reveal key={f.step} y={30}>
                <div className="group flex h-full flex-col gap-4 bg-[#050508] p-7 transition-colors duration-500 hover:bg-[#101015]">
                  <span className="font-mohave text-4xl font-bold uppercase tracking-tighter text-white/15 transition-colors duration-500 group-hover:text-[#df8326]">
                    {f.step}
                  </span>
                  <h3 className="font-syne text-lg font-bold uppercase tracking-tight">{f.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-zinc-400">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrated commerce ──────────────────────────── */}
      <section className="relative w-full border-t border-white/[0.06] bg-[#050508] px-6 py-24 md:px-12 md:py-32">
        <div className="pointer-events-none absolute right-0 top-1/4 h-[340px] w-[340px] rounded-full bg-[#df8326]/8 blur-[150px]" />
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">Integrated by default</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              Logistics that talks to your stack.
            </h2>
            <p className="mt-5 font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
              Because we also build the software, your fulfilment is never a black box — it&apos;s
              wired straight into your storefront, ERP and dashboards.
            </p>
          </Reveal>

          <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Real-time visibility", d: "Live order, stock and shipment status synced to your systems." },
              { n: "02", t: "No overselling", d: "Inventory updates flow both ways between warehouse and store." },
              { n: "03", t: "One point of contact", d: "The same team that built your site runs your operations." },
            ].map((v) => (
              <div
                key={v.n}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-7 transition-all duration-500 hover:border-[#df8326]/30 hover:bg-[#101015]"
              >
                <span className="font-mono text-xs text-[#df8326]/70">{v.n}</span>
                <h3 className="font-syne text-xl font-bold uppercase tracking-tight text-white">{v.t}</h3>
                <p className="font-sans text-sm leading-relaxed text-zinc-400">{v.d}</p>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#df8326] transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-[#050508] py-6">
        <Marquee
          speed={30}
          reverse
          items={["Fulfilment", "·", "Freight", "·", "Warehousing", "·", "COD", "·", "Returns", "·", "Customs", "·", "Last Mile", "·", "Tracking", "·"]}
          itemClassName="px-6 font-mohave text-3xl font-semibold uppercase tracking-tighter text-white/25"
        />
      </div>

      <ContactCTA
        eyebrow="Logistics services"
        title="Ship like a brand twice your size."
        body="Hand us the operations and watch fulfilment stop being your bottleneck."
      />
      <Footer />
    </main>
  );
}
