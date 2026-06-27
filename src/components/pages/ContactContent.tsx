"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Mail, MapPin, Clock, Plus, MessageCircle, Phone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(useGSAP);

const INTERESTS = [
  "Software",
  "E-commerce",
  "Automation",
  "Odoo / Zoho",
  "Logistics",
  "Branding",
];

const BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

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

export default function ContactContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitted(true);
  };

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
          },
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
          },
        );
      });
      return () => mm.revert();
    },
    { scope: heroRef },
  );

  const inputClass =
    "w-full rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-3.5 font-sans text-sm text-white placeholder-zinc-600 transition-all duration-300 focus:border-[#df8326] focus:outline-none focus:ring-1 focus:ring-[#df8326]/50";

  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
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

      {/* ── Form + details ───────────────────────────────── */}
      <section className="relative w-full px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Form */}
          <Reveal y={40} className="lg:col-span-7">
            <div className="rounded-3xl border border-white/[0.08] bg-[#0a0a0d] p-7 md:p-10">
              {submitted ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#df8326]/40 bg-[#df8326]/10 text-[#df8326]">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-syne text-2xl font-bold uppercase tracking-tight">
                    Message received
                  </h3>
                  <p className="max-w-sm font-sans text-sm leading-relaxed text-zinc-400">
                    Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. We'll be in touch within
                    one business day. Watch your inbox.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", company: "", budget: "", message: "" });
                      setInterests([]);
                    }}
                    className="mt-2 rounded-full border border-white/15 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-[#df8326] hover:text-white cursor-pointer"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        Name *
                      </label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Jane Doe"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="jane@brand.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Company
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Your brand"
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      What do you need?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((i) => {
                        const on = interests.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleInterest(i)}
                            className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer ${
                              on
                                ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326]"
                                : "border-white/[0.1] text-zinc-400 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Budget
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {BUDGETS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, budget: b })}
                          className={`rounded-xl border px-3 py-2.5 font-mono text-[11px] tracking-wide transition-all duration-300 cursor-pointer ${
                            form.budget === b
                              ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326]"
                              : "border-white/[0.1] text-zinc-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Project details
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what you're building..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(197,112,25,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    Send message
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Details */}
          <Reveal y={40} delay={0.1} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-5">
              {[
                { icon: Mail, label: "Email", value: "contact@yari.com", href: "mailto:contact@yari.com" },
                { icon: MapPin, label: "Operations", value: "Global Logistics & Operations Node" },
                { icon: Clock, label: "Response time", value: "Within 1 business day" },
              ].map((item) => {
                const Icon = item.icon;
                const inner = (
                  <div className="flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 transition-colors duration-300 hover:border-[#df8326]/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#df8326]">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {item.label}
                      </span>
                      <span className="mt-1 font-syne text-lg font-semibold text-white">
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} className="block">
                    {inner}
                  </a>
                ) : (
                  <div key={item.label}>{inner}</div>
                );
              })}

              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#df8326]/[0.1] via-[#0a0a0d] to-[#0a0a0d] p-6">
                <span className="font-rock-salt text-base text-[#df8326]">Follow along</span>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {["Instagram", "LinkedIn", "X / Twitter", "GitHub"].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="group relative inline-block py-0.5 font-mohave text-lg font-semibold uppercase tracking-tighter text-zinc-200 transition-colors hover:text-[#df8326]"
                    >
                      {s}
                      <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#df8326] transition-all duration-300 group-hover:w-full" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What happens next ────────────────────────────── */}
      <section className="relative w-full border-t border-white/[0.06] bg-[#050508] px-6 py-24 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">What happens next</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              After you hit send.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] md:grid-cols-3">
            {[
              { n: "01", t: "We review", d: "We read your brief and confirm it's a fit — usually within one business day." },
              { n: "02", t: "We scope a call", d: "A focused 30-minute call to dig into goals, timeline and budget." },
              { n: "03", t: "You get a plan", d: "A clear proposal with scope, milestones and pricing — no obligation." },
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

      {/* ── FAQ ──────────────────────────────────────────── */}
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

      {/* ── Direct channels ──────────────────────────────── */}
      <section className="relative w-full border-t border-white/[0.06] bg-[#050508] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
              Or reach us directly
            </span>
            <h2 className="mt-4 font-syne text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Prefer to skip the form?
            </h2>
          </Reveal>

          <Reveal stagger={0.1} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Mail, t: "Email us", v: "contact@yari.com", href: "mailto:contact@yari.com" },
              { icon: MessageCircle, t: "Live chat", v: "Message the studio", href: "#", accent: true },
              { icon: Phone, t: "Book a call", v: "Schedule 30 minutes", href: "#" },
            ].map((c) => {
              const Icon = c.icon;
              const accent = (c as { accent?: boolean }).accent;
              return (
                <a
                  key={c.t}
                  href={c.href}
                  className={`group relative flex flex-col gap-5 overflow-hidden rounded-2xl border p-7 transition-all duration-500 ${
                    accent
                      ? "border-[#ffd5a8]/40 bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c]"
                      : "border-white/[0.08] bg-[#0a0a0d] hover:border-[#df8326]/30 hover:bg-[#101015]"
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
                  <div>
                    <h3 className={`font-syne text-lg font-bold uppercase tracking-tight ${accent ? "text-black" : "text-white"}`}>
                      {c.t}
                    </h3>
                    <p className={`mt-1 font-sans text-sm ${accent ? "text-black/75" : "text-zinc-400"}`}>{c.v}</p>
                  </div>
                </a>
              );
            })}
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
