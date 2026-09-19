import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

// Next.js adds <meta name="robots" content="noindex"> to 404 responses on its
// own; setting it here too overrides the layout's "index, follow" so the page
// doesn't ship two contradicting robots tags.
export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for doesn't exist or has moved.",
  robots: { index: false, follow: false },
};

const LINKS = [
  { label: "Services", href: "/services", desc: "Software and logistics, one stack" },
  { label: "Journal", href: "/blog", desc: "E-commerce in Dubai, explained" },
  { label: "About", href: "/about", desc: "Who we are and how we work" },
  { label: "Contact", href: "/contact", desc: "Start a project with us" },
];

export default function NotFound() {
  return (
    <main id="main-content" className="relative min-h-screen w-full bg-[#050508] text-white">
      <SiteHeader />

      <section className="relative w-full overflow-hidden px-6 pt-40 pb-24 md:px-12 md:pb-32">
        <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
        <div className="absolute right-0 top-10 h-[360px] w-[360px] rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">Error 404</span>
          </div>

          <h1 className="font-michroma text-[1.8rem] font-normal uppercase leading-[1.1] tracking-tight sm:text-[3.2rem] md:text-[4rem]">
            <span className="block">Page</span>
            <span className="block bg-gradient-to-r from-[#df8326] to-[#C57019] bg-clip-text text-transparent">
              not found
            </span>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-zinc-400 md:text-lg">
            The page you were looking for doesn&rsquo;t exist or has moved. Here&rsquo;s where to go next.
          </p>

          <Link
            href="/"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_10px_30px_rgba(197,112,25,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            Back to home
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <nav aria-label="Popular pages" className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-[#0a0a0d] p-6 transition-colors duration-300 hover:border-[#df8326]/30 hover:bg-[#101015]"
              >
                <span className="flex items-center justify-between font-syne text-lg font-bold uppercase tracking-tight text-white">
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-[#df8326] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="font-sans text-sm text-zinc-400">{link.desc}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <Footer />
    </main>
  );
}
