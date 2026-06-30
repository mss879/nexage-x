import React from "react";
import { Compass, Cpu, Workflow, Truck, Eye, Target } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import Counter from "@/components/ui/Counter";
import Marquee from "@/components/ui/Marquee";
import ContactCTA from "@/components/ui/ContactCTA";
import AboutHero from "@/components/sections/AboutHero";

const PILLARS = [
  {
    icon: Compass,
    title: "Design",
    body: "Identity, art direction and conversion-grade interfaces that make brands impossible to ignore.",
  },
  {
    icon: Cpu,
    title: "Engineering",
    body: "Custom web apps, storefronts and backends built for speed, security and scale.",
  },
  {
    icon: Workflow,
    title: "Automation",
    body: "Workflows, AI agents and ERP integrations that remove manual work from the equation.",
    accent: true,
  },
  {
    icon: Truck,
    title: "Logistics",
    body: "Fulfilment, freight and operations wired directly into your digital stack.",
  },
];

const STATS = [
  { to: 120, suffix: "+", label: "Projects shipped" },
  { to: 18, suffix: "", label: "Countries served" },
  { to: 99.9, suffix: "%", label: "Uptime delivered", decimals: 1 },
  { to: 40, suffix: "%", label: "Avg. ops time saved" },
];

export default function AboutContent() {
  return (
    <main className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <AboutHero />

      {/* ── Value marquee ────────────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-[#0a0a0d] py-6">
        <Marquee
          speed={32}
          items={["Design", "·", "Engineering", "·", "Automation", "·", "Logistics", "·", "Commerce", "·", "Strategy", "·"]}
          itemClassName="px-6 font-mohave text-3xl font-semibold uppercase tracking-tighter text-white/25"
        />
      </div>

      {/* ── Manifesto ────────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 py-24 md:px-12 md:py-36">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <span className="font-rock-salt text-base text-[#df8326]">Our belief</span>
              <h2 className="mt-5 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
                Craft is a competitive advantage.
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-10 lg:col-span-7">
            <Reveal>
              <p className="font-sans text-lg leading-relaxed text-zinc-300 md:text-xl">
                Most agencies hand you a deliverable and disappear. We build the engine and stay
                in the driver's seat — connecting your storefront, software and supply chain into
                one living system.
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <blockquote className="border-l-2 border-[#df8326] pl-6 font-syne text-2xl font-semibold leading-snug text-white md:text-3xl">
                "We don't ship pages. We ship operating systems for growth."
              </blockquote>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
                Every project is measured against one question: did it make the business faster,
                leaner and more valuable? If the answer is no, it isn't done. That standard is why
                brands keep us close — and keep coming back.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#0a0a0d] px-6 py-20 md:px-12 md:py-28">
        <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-[#df8326]/8 blur-[130px] pointer-events-none" />
        <Reveal
          stagger={0.12}
          className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-start">
              <span className="font-mohave text-6xl font-bold uppercase tracking-tighter text-[#df8326] md:text-7xl">
                <Counter to={s.to} suffix={s.suffix} decimals={(s as { decimals?: number }).decimals ?? 0} />
              </span>
              <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── Pillars ──────────────────────────────────────── */}
      <section className="relative w-full bg-[#050508] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
              What we master
            </span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              Four disciplines, one team.
            </h2>
          </Reveal>

          <Reveal stagger={0.1} className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              const accent = (p as { accent?: boolean }).accent;
              return (
                <div
                  key={p.title}
                  className={`group relative flex flex-col gap-5 p-8 transition-colors duration-500 ${
                    accent
                      ? "bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c]"
                      : "bg-[#0a0a0d] hover:bg-[#101015]"
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
                  <h3
                    className={`font-syne text-2xl font-bold uppercase tracking-tight ${accent ? "text-black" : "text-white"}`}
                  >
                    {p.title}
                  </h3>
                  <p className={`font-sans text-sm leading-relaxed ${accent ? "text-black/70" : "text-zinc-400"}`}>
                    {p.body}
                  </p>
                  {accent ? (
                    <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
                      Core practice
                    </span>
                  ) : (
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#df8326] transition-all duration-500 group-hover:w-full" />
                  )}
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ── Vision & Mission ─────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#0a0a0d] px-6 py-24 md:px-12 md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[#df8326]/8 blur-[150px]" />
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 max-w-2xl">
            <span className="font-rock-salt text-base text-[#df8326]">Where we&apos;re going</span>
            <h2 className="mt-4 font-syne text-4xl font-bold uppercase leading-[1.02] tracking-tight sm:text-5xl">
              Vision &amp; Mission.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Vision — orange card */}
            <Reveal y={40}>
              <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-[#ffd5a8]/40 bg-gradient-to-br from-[#e8954a] via-[#df8326] to-[#b7610c] p-8 md:p-10">
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/15 blur-[80px]" />
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/20 bg-black/10 text-black">
                  <Eye className="h-7 w-7" strokeWidth={1.6} />
                </div>
                <div className="relative z-10">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/60">
                    Our Vision
                  </span>
                  <h3 className="mt-3 font-syne text-2xl font-bold uppercase leading-snug tracking-tight text-black md:text-3xl">
                    To become the operating system behind the world&apos;s most ambitious brands.
                  </h3>
                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-black/75 md:text-base">
                    A future where a brand&apos;s design, software and logistics move as one — fast,
                    intelligent and unmistakably premium from first pixel to last mile.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Mission — dark card */}
            <Reveal y={40} delay={0.08}>
              <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#050508] p-8 md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#df8326]/10 blur-[90px]" />
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-[#df8326]">
                  <Target className="h-7 w-7" strokeWidth={1.6} />
                </div>
                <div className="relative z-10">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#df8326]">
                    Our Mission
                  </span>
                  <h3 className="mt-3 font-syne text-2xl font-bold uppercase leading-snug tracking-tight text-white md:text-3xl">
                    Give every brand we build an unfair advantage.
                  </h3>
                  <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
                    Beautiful products, intelligent automation and logistics that simply work —
                    designed, engineered and run by one team that treats your growth like our own.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Values strip */}
          <Reveal
            stagger={0.08}
            className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3"
          >
            {[
              { t: "Craft over volume", d: "We take fewer projects and obsess over each one." },
              { t: "Own the outcome", d: "Success is measured by your results, not our deliverables." },
              { t: "Build to last", d: "Systems engineered to scale long after launch day." },
            ].map((v) => (
              <div key={v.t} className="bg-[#0a0a0d] p-7">
                <h4 className="font-syne text-lg font-bold uppercase tracking-tight text-white">{v.t}</h4>
                <p className="mt-2 font-sans text-sm leading-relaxed text-zinc-400">{v.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <ContactCTA
        eyebrow="Work with us"
        title="Your brand deserves an unfair advantage."
        body="Let's design the systems that make your growth inevitable."
      />

      <Footer />
    </main>
  );
}
