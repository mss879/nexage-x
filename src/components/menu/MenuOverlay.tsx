"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { SITE } from "@/lib/site";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

interface NavLink {
  label: string;
  href: string;
  index: string;
  children?: { label: string; href: string; desc: string }[];
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", index: "01" },
  { label: "About", href: "/about", index: "02" },
  {
    label: "Services",
    href: "/services",
    index: "03",
    children: [
      { label: "Software Services", href: "/services/software", desc: "Web, apps, AI & Odoo/Zoho" },
      { label: "Logistics Services", href: "/services/logistics", desc: "Fulfilment, freight & ops" },
    ],
  },
  { label: "Blog", href: "/blog", index: "04" },
  { label: "Contact", href: "/contact", index: "05" },
];

const SOCIALS = [
  { label: "Instagram", href: SITE.social.instagram },
  { label: "LinkedIn", href: SITE.social.linkedin },
  { label: "X / Twitter", href: SITE.social.x },
  { label: "GitHub", href: SITE.social.github },
];

/* ── Motion variants ──────────────────────────────────────────────── */
const overlayV: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.25, ease: EASE, when: "beforeChildren", staggerChildren: 0.07, delayChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.35, ease: EASE, when: "afterChildren", staggerChildren: 0.035, staggerDirection: -1 },
  },
};

// Orchestrators (no visual change) — just stagger their own children.
const navV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};
const rowV: Variants = { hidden: {}, show: {}, exit: {} };

const maskV: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
  exit: { y: "-115%", transition: { duration: 0.3, ease: EASE } },
};
const riseV: Variants = {
  hidden: { y: 18, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { y: -12, opacity: 0, transition: { duration: 0.25, ease: EASE } },
};

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);

  // Scroll lock + Escape, and reset the sub-panel whenever the menu closes.
  useEffect(() => {
    if (!open) {
      setServicesOpen(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-overlay"
          variants={overlayV}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[100] overflow-y-auto"
          aria-modal="true"
          role="dialog"
        >
          {/* ── Backdrop (pure CSS — no WebGL) ───────────────────── */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[#050505]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(125%_120%_at_88%_8%,rgba(223,131,38,0.18),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(100%_100%_at_0%_100%,rgba(223,131,38,0.07),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 cyber-grid opacity-[0.05]" />
          <div className="grain-texture pointer-events-none absolute inset-0 -z-10" />

          {/* ── Top bar ──────────────────────────────────────────── */}
          <div className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
            <motion.div variants={riseV}>
              <Link href="/" onClick={onClose} aria-label="Home">
                <Logo className="h-9 w-[118px]" />
              </Link>
            </motion.div>

            <motion.button
              variants={riseV}
              onClick={onClose}
              aria-label="Close menu"
              className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 backdrop-blur-md transition-colors duration-300 hover:border-[#df8326] hover:bg-[#df8326]/10 cursor-pointer"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-200 transition-colors group-hover:text-white">
                Close
              </span>
              <span className="relative h-3.5 w-3.5">
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white transition-all duration-500 group-hover:rotate-[225deg] group-hover:bg-[#df8326]" />
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white transition-all duration-500 group-hover:rotate-[135deg] group-hover:bg-[#df8326]" />
              </span>
            </motion.button>
          </div>

          {/* ── Body ─────────────────────────────────────────────── */}
          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 content-center gap-12 px-6 pb-16 pt-4 md:px-12 lg:min-h-[calc(100vh-92px)] lg:grid-cols-12 lg:gap-20 lg:pb-12 lg:pt-0">
            {/* Navigation */}
            <motion.nav variants={navV} className="lg:col-span-7 flex flex-col">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <motion.div key={link.label} variants={rowV} className="border-b border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="group flex flex-1 items-center gap-4 py-3 md:gap-6 md:py-[18px]"
                      >
                        <motion.span
                          variants={riseV}
                          className="w-6 shrink-0 font-mono text-[11px] text-[#df8326]/70 md:w-8"
                        >
                          {link.index}
                        </motion.span>
                        <span className="relative block overflow-hidden py-1">
                          <motion.span
                            variants={maskV}
                            className={`block font-syne text-[2.3rem] font-bold uppercase leading-[0.98] tracking-tight transition-colors duration-300 will-change-transform sm:text-[3rem] md:text-[4rem] ${
                              active ? "text-[#df8326]" : "text-white group-hover:text-[#df8326]"
                            }`}
                          >
                            {link.label}
                          </motion.span>
                        </span>
                        <ArrowUpRight className="h-6 w-6 shrink-0 -translate-x-3 text-[#df8326] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:h-7 md:w-7" />
                      </Link>

                      {link.children && (
                        <motion.button
                          variants={riseV}
                          onClick={() => setServicesOpen((v) => !v)}
                          aria-label="Toggle service categories"
                          aria-expanded={servicesOpen}
                          className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-[#df8326] hover:bg-[#df8326]/10 hover:text-[#df8326] cursor-pointer md:h-10 md:w-10"
                        >
                          <Plus className={`h-5 w-5 transition-transform duration-500 ${servicesOpen ? "rotate-[225deg]" : ""}`} />
                        </motion.button>
                      )}
                    </div>

                    {link.children && (
                      <div
                        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ gridTemplateRows: servicesOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-col gap-2 pb-5 pl-10 pt-1 md:pl-14">
                            {link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 transition-all duration-300 hover:border-[#df8326]/50 hover:bg-[#df8326]/[0.07]"
                              >
                                <span className="flex flex-col">
                                  <span className="font-syne text-base font-semibold text-zinc-100 transition-colors group-hover:text-[#df8326] md:text-lg">
                                    {child.label}
                                  </span>
                                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                                    {child.desc}
                                  </span>
                                </span>
                                <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#df8326]" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Contact / studio panel */}
            <motion.aside variants={riseV} className="lg:col-span-5 lg:self-center">
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 backdrop-blur-xl md:p-9">
                <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#df8326]/15 blur-[80px]" />

                <div className="relative z-10 flex flex-col gap-7">
                  <div>
                    <span className="font-rock-salt text-base text-[#df8326]">Let&apos;s talk</span>
                    <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-zinc-400">
                      Design, software & logistics — fused into one stack for ambitious brands in
                      Dubai and across the GCC.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6">
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-mohave text-xl font-semibold uppercase tracking-tight text-white transition-colors hover:text-[#df8326] md:text-2xl"
                    >
                      {SITE.email}
                    </a>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      {SITE.phones.map((p) => (
                        <a
                          key={p.e164}
                          href={`tel:${p.e164}`}
                          className="font-mono text-xs tracking-wide text-zinc-400 transition-colors hover:text-[#df8326]"
                        >
                          {p.label} {p.number}
                        </a>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(197,112,25,0.3)] transition-transform duration-300 hover:scale-[1.03] active:scale-95"
                  >
                    Start a project
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-6">
                    {SOCIALS.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-block py-0.5 font-mohave text-base font-semibold uppercase tracking-tighter text-zinc-300 transition-colors hover:text-[#df8326]"
                      >
                        {s.label}
                        <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#df8326] transition-all duration-300 group-hover:w-full" />
                      </a>
                    ))}
                  </div>

                  <div className="flex w-fit items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                      Available for new projects — 2026
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
