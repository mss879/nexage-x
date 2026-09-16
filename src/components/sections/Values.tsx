"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

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

// Descriptions are hand-fitted: four lines each, every line 224–232px wide at 15px Plus Jakarta Sans Light,
// so justifying them edge to edge (.values-desc) only nudges word spacing. Re-measure if you edit a line.
const VALUES = [
  {
    id: "01",
    title: "Quality",
    icon: "/images/values/quality-diamond.png",
    lines: [
      "We sweat every single pixel, and",
      "every millisecond. Nothing ships",
      "until it feels effortless and quick,",
      "and unmistakably crafted to last.",
    ],
  },
  {
    id: "02",
    title: "Creativity",
    icon: "/images/values/creativity-sparkle.png",
    lines: [
      "We chase the bold idea over the",
      "safe one, with original interfaces,",
      "motion and stories that make any",
      "brand truly impossible to ignore.",
    ],
  },
  {
    id: "03",
    title: "Growth",
    icon: "/images/values/growth-chevrons.png",
    lines: [
      "Beautiful design is only the start.",
      "Everything we ship is engineered",
      "to convert, to scale, and to keep",
      "your business growing for years.",
    ],
  },
  {
    id: "04",
    title: "Partnership",
    icon: "/images/values/partnership-rings.png",
    lines: [
      "We act as a real extension of your",
      "team, open and responsive, fully",
      "invested in your outcomes, even",
      "long after the launch day is over.",
    ],
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
              <h2 className="text-[2.2rem] sm:text-[2.7rem] md:text-[3.25rem] lg:text-[56px] font-michroma font-normal tracking-tight uppercase leading-[1] text-white">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-4 md:px-6 relative z-10">
            {VALUES.map(({ id, title, icon, lines }, idx) => (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="group relative w-full p-[1.5px] bg-[#C57019]/70 hover:bg-[#df8326] transition-colors duration-500"
                style={{ clipPath: CARD_CLIP }}
              >
                <div
                  className="relative w-full h-full min-h-[300px] sm:min-h-[340px] bg-[#0a0a0f] flex flex-col p-7 lg:p-8 xl:p-6 overflow-hidden"
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

                  {/* Giant faded index — sits inside the card padding so it never crosses the edge */}
                  <span className="pointer-events-none absolute right-5 top-5 select-none font-mohave text-[88px] font-bold leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-[#df8326]/[0.16]">
                    {id}
                  </span>

                  <div className="@container relative z-10 flex flex-col h-full">
                    {/* Icon — floating 3D gold render (generated with Higgsfield) */}
                    <span
                      className="float-render mb-7 w-fit transition-transform duration-500 group-hover:scale-110"
                      style={{ "--float-delay": `${-idx * 1.1}s` } as React.CSSProperties}
                    >
                      <Image src={icon} alt="" width={64} height={64} className="h-16 w-16 object-contain select-none" draggable={false} />
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-[26px] font-sans font-bold tracking-tight text-white mb-3">
                      {title}
                    </h3>

                    {/* Description — one span per fitted line, justified edge to edge */}
                    <p className="values-desc font-sans font-light leading-relaxed text-white/65">
                      {lines.map((line) => (
                        <span key={line}>{line} </span>
                      ))}
                    </p>

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
