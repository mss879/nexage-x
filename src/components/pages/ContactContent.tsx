import React from "react";
import { Mail, MapPin, Clock, MessageCircle, Phone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import ContactHero from "@/components/sections/ContactHero";
import ContactForm from "@/components/sections/ContactForm";
import ContactFAQs from "@/components/sections/ContactFAQs";

export default function ContactContent() {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <ContactHero />

      {/* ── Form + details ───────────────────────────────── */}
      <section className="relative w-full px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Form Client Component */}
          <ContactForm />

          {/* Details (Static Server Content) */}
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

      {/* ── FAQ Accordion (Client Component) ──────────────── */}
      <ContactFAQs />

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
