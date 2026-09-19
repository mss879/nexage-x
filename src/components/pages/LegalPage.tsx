import React from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type LegalPageProps = {
  /** First line of the hero title. */
  title: string;
  /** Second, gold line of the hero title. */
  accent: string;
  /** Human-readable "last updated" date. */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/**
 * Shared layout for the legal pages (Privacy Policy, Terms & Conditions): hero, a sticky
 * "On this page" index on desktop and numbered long-form sections styled by `.legal-prose`.
 */
export default function LegalPage({ title, accent, updated, intro, sections }: LegalPageProps) {
  return (
    <main id="main-content" className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden px-6 pt-40 pb-12 md:px-12">
        <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
        <div className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">Legal</span>
          </div>
          <h1 className="font-michroma text-[1.8rem] font-normal uppercase leading-[1.1] tracking-tight sm:text-[3.2rem] md:text-[4rem] lg:text-[4.4rem]">
            <span className="block">{title}</span>
            <span className="block bg-gradient-to-r from-[#df8326] to-[#C57019] bg-clip-text text-transparent">
              {accent}
            </span>
          </h1>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Last updated · {updated}
          </p>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">{intro}</p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────── */}
      <section className="relative w-full px-6 pb-24 md:px-12 md:pb-32">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 border-t border-white/[0.08] pt-12 lg:grid-cols-12">
          {/* On this page */}
          <nav aria-label="On this page" className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">On this page</p>
              <ol className="flex flex-col gap-2.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-baseline gap-3 font-sans text-sm text-zinc-400 transition-colors duration-300 hover:text-white"
                    >
                      <span className="font-mono text-[11px] text-[#df8326]/70 group-hover:text-[#df8326]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* Sections */}
          <article className="legal-prose lg:col-span-8 max-w-3xl">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 border-t border-white/[0.08] py-10 first:border-t-0 first:pt-0"
              >
                <h2 className="mb-5 flex items-baseline gap-4 font-syne text-xl font-bold tracking-tight text-white md:text-2xl">
                  <span className="font-mono text-sm font-normal text-[#df8326]">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                {s.content}
              </section>
            ))}
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
