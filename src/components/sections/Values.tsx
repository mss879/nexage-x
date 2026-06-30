"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gem, Palette, Rocket, Handshake } from "lucide-react";

/* ------------------------------------------------------------------ *
 * OUR VALUES
 * Reworked to share the YARI homepage design language (matching the
 * Benefits / Methodology sections): dark canvas, brand clip-path cards,
 * mono badge, extrabold uppercase header, structural guide lines and
 * framer-motion reveals. No WebGL — consistent with every other section.
 * ------------------------------------------------------------------ */

// Brand card clip-path (12px diagonal cuts top-left/top-right/bottom-left; 48px bottom-right)
const CARD_CLIP =
  "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 48px), calc(100% - 48px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)";

const VALUES = [
  {
    id: "01",
    title: "Quality",
    Icon: Gem,
    desc: "We sweat every pixel and every millisecond. Nothing ships until it feels effortless, fast, and unmistakably crafted.",
  },
  {
    id: "02",
    title: "Creativity",
    Icon: Palette,
    desc: "We chase the bold idea over the safe one — original interfaces, motion, and stories that make brands impossible to ignore.",
  },
  {
    id: "03",
    title: "Growth",
    Icon: Rocket,
    desc: "Beautiful is only the start. Everything we build is engineered to convert, scale, and compound real momentum for your business.",
  },
  {
    id: "04",
    title: "Partnership",
    Icon: Handshake,
    desc: "We work as an extension of your team — transparent, responsive, and invested in the outcome long after launch day.",
  },
];

export default function Values() {
  return (
    <section
      id="values"
      className="relative w-full overflow-hidden bg-[#050508] text-white py-24 md:py-32 px-4 md:px-12 lg:px-24 border-b border-white/[0.04] box-border"
    >
      {/* Subtle cyber mesh grid */}
      <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />
      {/* Soft brand glow top-right */}
      <div className="pointer-events-none absolute -right-20 top-0 h-[360px] w-[360px] rounded-full bg-[#df8326]/8 blur-[150px] z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative w-full">
          {/* Structural vertical guide lines */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/[0.05] pointer-events-none z-0" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.05] pointer-events-none z-0 hidden lg:block" />
          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/[0.05] pointer-events-none z-0" />

          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end w-full pb-10 md:pb-14 px-4 md:px-6 relative z-10">
            <div className="lg:col-span-7 flex flex-col items-start gap-4 lg:gap-5">
              {/* Badge */}
              <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-white/50">
                <span className="w-2.5 h-2.5 rounded-full bg-[#df8326] animate-pulse" />
                <span>05 // OUR VALUES</span>
              </div>

              {/* Title */}
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-sans font-extrabold tracking-tighter uppercase leading-[0.85] text-white">
                PRINCIPLES THAT
                <br />
                <span className="text-white/30">POWER EVERY</span>{" "}
                <span className="bg-gradient-to-r from-[#df8326] to-[#C57019] bg-clip-text text-transparent">
                  BUILD.
                </span>
              </h2>
            </div>

            {/* Right description */}
            <div className="lg:col-span-5 flex items-end lg:justify-end">
              <p className="text-white/60 text-base md:text-lg font-sans font-light leading-relaxed max-w-sm">
                These aren&apos;t poster slogans. They&apos;re the standards we hold ourselves to on{" "}
                <span className="text-white font-semibold">every screen, every sprint, and every shipment.</span>
              </p>
            </div>
          </div>

          {/* Connector strip */}
          <div className="hidden md:flex items-center gap-3 mb-12 px-4 md:px-6 relative z-10">
            <span className="h-[1px] flex-1 bg-white/[0.08]" />
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-[#df8326]/50 stroke-none shrink-0">
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-6 relative z-10">
            {VALUES.map(({ id, title, Icon, desc }, idx) => (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="group relative w-full p-[1px] bg-white/5 hover:bg-[#df8326]/30 transition-colors duration-500"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="relative w-full h-full min-h-[300px] sm:min-h-[340px] bg-[#0a0a0f] flex flex-col p-7 lg:p-8 overflow-hidden"
                  style={{ clipPath: CARD_CLIP }}
                >
                  {/* Pixel grid texture */}
                  <div
                    className="absolute inset-0 z-0 opacity-[0.18] group-hover:opacity-[0.3] transition-opacity duration-500 pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                      backgroundSize: "6px 6px",
                    }}
                  />

                  {/* Giant faded index */}
                  <span className="pointer-events-none absolute -right-1 -top-4 select-none font-sans text-[110px] font-extrabold leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-white/[0.06]">
                    {id}
                  </span>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Number bracket */}
                    <div className="flex items-center gap-1.5 font-mono text-xs tracking-widest font-semibold mb-6">
                      <span className="text-[#df8326]/50">[</span>
                      <span className="text-white">{id}</span>
                      <span className="text-[#df8326]/50">]</span>
                    </div>

                    {/* Icon chip */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#df8326]/40 bg-[#df8326]/10 text-[#df8326] transition-all duration-500 group-hover:scale-110 mb-5">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-[26px] font-sans font-bold tracking-tight text-white mb-3">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-[15px] font-sans font-light leading-relaxed text-white/65">
                      {desc}
                    </p>

                    {/* Bottom accent rule */}
                    <div className="mt-auto pt-6 h-[3px] w-12 rounded-full bg-gradient-to-r from-[#df8326] to-transparent transition-all duration-500 group-hover:w-24" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
