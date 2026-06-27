"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import MenuBackdrop from "./MenuBackdrop";
import Logo from "@/components/ui/Logo";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

interface NavLink {
  label: string;
  href: string;
  index: string;
  desc: string;
  children?: { label: string; href: string; desc: string }[];
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", index: "01", desc: "The studio — design, software & logistics fused into one stack." },
  { label: "About", href: "/about", index: "02", desc: "Who we are, what we believe, and how we got here." },
  {
    label: "Services",
    href: "/services",
    index: "03",
    desc: "Two practices, one brain: software and logistics.",
    children: [
      { label: "Software Services", href: "/services/software", desc: "Web, apps, AI & integrations" },
      { label: "Logistics Services", href: "/services/logistics", desc: "Fulfilment, freight & ops" },
    ],
  },
  { label: "Blog", href: "/blog", index: "04", desc: "Field notes on commerce, software, automation & logistics." },
  { label: "Contact", href: "/contact", index: "05", desc: "Start a project — we reply within one business day." },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X / Twitter", href: "https://x.com" },
  { label: "GitHub", href: "https://github.com" },
];

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [visible, setVisible] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((l) => l.href === pathname),
  );
  const panel = NAV_LINKS[hovered ?? activeIndex] ?? NAV_LINKS[0];

  // Mount (and keep mounted through the exit animation) when opening.
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  // Build + play a FRESH open/close timeline each time. A plain layout effect is
  // used (not useGSAP) so there is no auto-revert fighting the playhead, and the
  // from-state is applied before paint to avoid an opening flash.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !visible) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const f = reduce ? 0.001 : 1;

    tlRef.current?.kill();
    const lines = root.querySelectorAll(".menu-line-inner");
    const rises = root.querySelectorAll(".menu-rise");

    if (open) {
      const tl = gsap.timeline();
      tl.fromTo(
        backdropRef.current,
        { autoAlpha: 0, scale: 1.08 },
        { autoAlpha: 1, scale: 1, duration: 1.1 * f, ease: "power2.out" },
        0,
      );
      tl.fromTo(
        lines,
        { yPercent: 118, rotate: 3 },
        { yPercent: 0, rotate: 0, duration: 0.95 * f, stagger: 0.07, ease: "power4.out" },
        0.12,
      );
      tl.fromTo(
        rises,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 * f, stagger: 0.05, ease: "power3.out" },
        0.35,
      );
      tlRef.current = tl;
    } else {
      const tl = gsap.timeline({ onComplete: () => setVisible(false) });
      tl.to(lines, { yPercent: -118, duration: 0.5 * f, stagger: 0.04, ease: "power3.in" }, 0);
      tl.to(rises, { autoAlpha: 0, duration: 0.3 * f }, 0);
      tl.to(backdropRef.current, { autoAlpha: 0, duration: 0.5 * f }, 0.1);
      tlRef.current = tl;
    }
  }, [open, visible]);

  // Reset sub-panel + hover whenever menu closes.
  useEffect(() => {
    if (!open) {
      setServicesOpen(false);
      setHovered(null);
    }
  }, [open]);

  // Scroll lock + Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      aria-hidden={!open}
      className="fixed inset-0 z-[100]"
      style={{ visibility: visible ? "visible" : "hidden", pointerEvents: open ? "auto" : "none" }}
    >
      {/* WebGL plasma backdrop */}
      <div ref={backdropRef} className="absolute inset-0 bg-[#050508]">
        {visible && <MenuBackdrop />}
        <div className="absolute inset-0 cyber-grid opacity-[0.04] pointer-events-none" />
        <div className="grain-texture absolute inset-0 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#df8326]/10 to-transparent pointer-events-none" />
      </div>

      {/* Top chrome */}
      <div className="menu-rise absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <Logo className="h-9 w-[120px]" />
        </Link>

        <button
          onClick={onClose}
          aria-label="Close menu"
          className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.05] px-6 py-3 backdrop-blur-md transition-all duration-300 hover:border-[#df8326] hover:bg-[#df8326]/10 cursor-pointer"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-200 transition-colors group-hover:text-white">
            Close
          </span>
          <span className="relative h-4 w-4">
            <span className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white transition-all duration-500 group-hover:bg-[#df8326] group-hover:rotate-[225deg]" />
            <span className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white transition-all duration-500 group-hover:bg-[#df8326] group-hover:rotate-[135deg]" />
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pt-16">
          {/* Navigation */}
          <nav className="lg:col-span-7 flex flex-col">
            {NAV_LINKS.map((link, i) => {
              const active = pathname === link.href;
              const hasChildren = !!link.children;
              return (
                <div key={link.label} className="border-b border-white/[0.08]">
                  <div
                    className="flex items-center justify-between"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group relative flex flex-1 items-center gap-5 py-3 md:py-4"
                    >
                      <span className="menu-rise font-mono text-[11px] md:text-xs text-[#df8326]/70 w-7 shrink-0">
                        {link.index}
                      </span>
                      <span className="relative block overflow-hidden py-1">
                        <span
                          className={`menu-line-inner block font-syne font-bold uppercase leading-[0.95] tracking-tight text-[2.4rem] sm:text-[3.2rem] md:text-[4.4rem] transition-[color,transform] duration-300 group-hover:translate-x-3 ${
                            active ? "text-[#df8326]" : "text-white group-hover:text-[#df8326]"
                          }`}
                        >
                          {link.label}
                        </span>
                      </span>
                      <ArrowUpRight className="h-7 w-7 shrink-0 text-[#df8326] opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>

                    {hasChildren && (
                      <button
                        onClick={() => setServicesOpen((v) => !v)}
                        aria-label="Toggle service categories"
                        aria-expanded={servicesOpen}
                        className="menu-rise ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-all duration-300 hover:border-[#df8326] hover:bg-[#df8326]/10 hover:text-[#df8326] cursor-pointer"
                      >
                        <Plus
                          className={`h-5 w-5 transition-transform duration-500 ${servicesOpen ? "rotate-[225deg]" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && (
                    <div
                      className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ gridTemplateRows: servicesOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-2 pb-5 pl-12 pt-1">
                          {link.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 backdrop-blur-sm transition-all duration-300 hover:border-[#df8326]/50 hover:bg-[#df8326]/[0.07]"
                            >
                              <span className="flex flex-col">
                                <span className="font-syne text-lg md:text-xl font-semibold text-zinc-100 transition-colors group-hover:text-[#df8326]">
                                  {child.label}
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                                  {child.desc}
                                </span>
                              </span>
                              <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all duration-300 group-hover:text-[#df8326] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Dynamic context panel */}
          <div className="menu-rise hidden lg:col-span-5 lg:flex">
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#df8326]/15 blur-[80px]" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={panel.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex flex-col gap-5"
                >
                  <span className="font-mohave text-[7rem] font-bold leading-none tracking-tighter text-[#df8326]/20">
                    {panel.index}
                  </span>
                  <span className="font-syne text-3xl font-bold uppercase tracking-tight text-white">
                    {panel.label}
                  </span>
                  <p className="max-w-xs font-sans text-sm leading-relaxed text-zinc-400">
                    {panel.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#df8326]">
                    Explore <ArrowUpRight className="h-4 w-4" />
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom meta bar */}
        <div className="menu-rise mt-10 flex flex-col gap-6 border-t border-white/[0.08] pt-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-rock-salt text-base text-[#df8326]">Get in touch</span>
            <a
              href="mailto:contact@yari.com"
              className="font-mohave text-2xl font-semibold uppercase tracking-tighter text-white transition-colors hover:text-[#df8326]"
            >
              contact@yari.com
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-block py-0.5 font-mohave text-lg font-semibold uppercase tracking-tighter text-zinc-200 transition-colors hover:text-[#df8326]"
                >
                  {s.label}
                  <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#df8326] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 backdrop-blur-sm md:flex">
            <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              Available — 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
