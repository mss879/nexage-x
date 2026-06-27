"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { useMenu } from "@/components/menu/MenuProvider";
import Logo from "@/components/ui/Logo";

const SERVICE_LINKS = [
  { label: "All Services", href: "/services", desc: "Overview of both practices" },
  { label: "Software Services", href: "/services/software", desc: "Web, apps, AI & Odoo/Zoho" },
  { label: "Logistics Services", href: "/services/logistics", desc: "Fulfilment, freight & ops" },
];

const NAV = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", dropdown: true },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const { open } = useMenu();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/services" ? pathname.startsWith("/services") : pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2.5 bg-[#0a0a0d]/75 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center transition-opacity duration-300 hover:opacity-80">
          <Logo className="h-9 w-[124px]" />
        </Link>

        {/* Desktop nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 backdrop-blur-xl md:flex">
          {NAV.map((item) =>
            item.dropdown ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                    isActive(item.href) ? "text-[#df8326]" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </Link>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3"
                    >
                      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0d]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                        {SERVICE_LINKS.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-white/[0.05]"
                          >
                            <span className="flex flex-col">
                              <span className="font-syne text-sm font-semibold text-white transition-colors group-hover:text-[#df8326]">
                                {s.label}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                                {s.desc}
                              </span>
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-all duration-300 group-hover:text-[#df8326] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                  isActive(item.href) ? "text-[#df8326]" : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="mailto:contact@yari.com"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#C57019]/60 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#df8326] hover:bg-[#df8326]/10"
          >
            Connect
          </a>
          <button
            onClick={open}
            className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(197,112,25,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
            aria-label="Open menu"
          >
            Menu
            <span className="flex flex-col gap-[3px]">
              <span className="block h-[1.5px] w-4 bg-white transition-all duration-300 group-hover:w-3" />
              <span className="block h-[1.5px] w-4 bg-white" />
              <span className="block h-[1.5px] w-4 bg-white transition-all duration-300 group-hover:w-2.5" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
