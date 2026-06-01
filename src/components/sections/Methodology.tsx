"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Premium cubic-bezier transition ease matching Framer's luxurious physics
const CUBIC_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface MethodCardProps {
  number: string;
  title: string;
  description: string;
  deliverables: string;
  imageUrl: string;
  theme: "light" | "transparent" | "orange" | "dark";
  index: number;
}

function MethodCard({
  number,
  title,
  description,
  deliverables,
  imageUrl,
  theme,
  index,
}: MethodCardProps) {
  // Brand card clip-path formula (12px small diagonal cuts on top-left, top-right, bottom-left; 48px large diagonal cut on bottom-right)
  const cardClipPath = "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 48px), calc(100% - 48px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)";

  const numberColorClass = "text-white";
  const bracketColorClass = "text-[#df8326]/50"; // Gorgeous coppery-orange brackets
  const deliverablesColorClass = "text-[#FFDACC]"; // Lighter peach brand tint for bottom copy

  return (
    <div
      className="w-full min-h-[420px] lg:min-h-[415px] lg:h-[440px] rounded-none p-[1px] relative overflow-hidden select-none group transition-all duration-500 bg-white/5 hover:bg-[#df8326]/30 shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_35px_rgba(223,131,38,0.08)]"
      style={{
        transformOrigin: "center bottom",
        clipPath: cardClipPath,
      }}
    >
      <div
        className="w-full h-full bg-[#0A0A0C] rounded-none p-8 lg:p-7 flex flex-col relative overflow-hidden"
        style={{
          clipPath: cardClipPath,
        }}
      >
        {/* Background Subtle Watermark Image masked dynamically with branding duotone overlays */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.12] overflow-hidden"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            clipPath: cardClipPath,
          }}
        >
          <img 
            src={imageUrl} 
            alt={title}
            decoding="auto"
            loading="lazy"
            className="w-full h-full object-cover object-center filter grayscale contrast-[1.15] brightness-[0.95]"
          />
          {/* Brand duotone gradient wash to adapt any image to NEXAGE-X® brand colors */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-[#df8326]/12 via-transparent to-[#C57019]/8 mix-blend-color pointer-events-none z-[1]" 
          />
        </div>

        {/* Classy Pixelated Grid Overlay Texture sat in the background */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.22] group-hover:opacity-[0.35] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "6px 6px",
            clipPath: cardClipPath,
          }}
        />

        {/* Card Content Layer */}
        <div className="relative z-10 flex flex-col h-full flex-grow">
          {/* Top Section: [ 0X ] Number bracket */}
          <div className="flex items-center gap-1.5 font-mono text-xs tracking-widest font-semibold mb-6 lg:mb-5">
            <span className={bracketColorClass}>[</span>
            <span className={numberColorClass}>{number}</span>
            <span className={bracketColorClass}>]</span>
          </div>

          {/* Simple Static Title (Text size increased as requested) */}
          <h3 className="text-3xl lg:text-[34px] font-sans font-bold tracking-tight mb-5 lg:mb-4 text-white">
            {title}
          </h3>

          {/* Card Description (Text size slightly larger as requested for perfect readability) */}
          <p className="text-[15px] lg:text-[15.5px] font-sans font-light leading-relaxed mb-6 text-white/80">
            {description}
          </p>

          {/* Bottom Deliverables indicators */}
          <p className={`mt-auto text-[13px] lg:text-[13.5px] font-mono font-medium leading-relaxed tracking-wide ${deliverablesColorClass}`}>
            {deliverables}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Methodology() {
  const cards = [
    {
      number: "01",
      title: "Discover",
      description: "We dive deep into your brand ecosystem — auditing your current tech stack, conversion funnels, and growth opportunities.",
      deliverables: "→ Tech Stack Audit, UX Research, Competitor Analysis, Growth Roadmap",
      imageUrl: "/images/discover_abstract.png",
      theme: "light" as const,
    },
    {
      number: "02",
      title: "Define",
      description: "We architect a high-performance blueprint, mapping out clean user flows and custom automation strategy.",
      deliverables: "→ System Architecture, Conversational Map, Creative & Technical Spec",
      imageUrl: "/images/define_abstract.png",
      theme: "transparent" as const,
    },
    {
      number: "03",
      title: "Design",
      description: "We craft beautiful, high-converting digital storefronts, web apps, and cohesive visual identities.",
      deliverables: "→ High-Fidelity UI/UX, Design System, Interactive Prototypes",
      imageUrl: "/images/design_abstract.png",
      theme: "orange" as const,
    },
    {
      number: "04",
      title: "Deliver",
      description: "We engineer with clean, scalable code, integrate automated workflows, and orchestrate a flawless launch.",
      deliverables: "→ Custom Development, Automation Sync, Launch & 24/7 Support",
      imageUrl: "/images/deliver_abstract.png",
      theme: "dark" as const,
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Responsive GSAP ScrollTrigger pinning and scroll deck assembly
  useGSAP(() => {
    if (!cardsContainerRef.current || !sectionRef.current) return;

    // Register ScrollTrigger plugin on client side
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    // 1. DESKTOP LAYOUT (min-width: 1024px) - Premium sticky full screen layout where ONLY cards reveal on scroll
    mm.add("(min-width: 1024px)", () => {
      // Set initial state for cards to sit offset below, while keeping headers/CTA static and fully visible
      gsap.set(".methodology-card-wrapper", {
        opacity: 0,
        y: 160,
        scale: 0.97,
      });

      // Pinned section timeline
      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top", // Pins the section exactly when the section hits top of viewport
          end: "+=1200", // Keep it pinned for 1200px of scrolling depth
          scrub: 1.2, // Smooth scroll scrubbing
          pin: true, // PIN IT STICKY!
          anticipatePin: 1,
        }
      });

      // Reveal cards one-by-one sequentially as user scrolls down
      const cardWrappers = gsap.utils.toArray<HTMLElement>(".methodology-card-wrapper");
      cardWrappers.forEach((card, idx) => {
        pinTimeline.to(
          card,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
          },
          idx * 0.8 // Perfectly paced sequential stagger linked directly to scroll
        );
      });

      // Sort registered ScrollTriggers in DOM order and refresh to dynamically adapt preceding pin heights
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    // 2. MOBILE & TABLET LAYOUT (max-width: 1023px) - Normal scrolling reveals (prevents vertical clipping)
    mm.add("(max-width: 1023px)", () => {
      // Cards staggered reveal
      const cardTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          start: "top 85%",
          end: "bottom 70%",
          scrub: 1.2,
        }
      });

      const cardWrappers = gsap.utils.toArray<HTMLElement>(".methodology-card-wrapper");
      cardWrappers.forEach((card, idx) => {
        cardTimeline.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "power2.out",
            duration: 1,
          },
          idx * 0.3
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef}
      id="methodology" 
      className="relative w-full py-20 lg:py-10 lg:h-screen lg:max-h-screen bg-[#F5F5F7] text-[#1A1A1A] px-4 md:px-12 lg:px-24 overflow-hidden border-b border-black/5 flex flex-col justify-between box-border"
    >
      {/* Structural layout dotted grid lines matching Framer container wrapper */}
      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] border-l border-dotted border-black/15 pointer-events-none z-0" />
      <div className="absolute top-0 bottom-0 right-6 md:right-12 lg:right-24 w-[1px] border-r border-dotted border-black/15 pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10 w-full flex flex-col justify-between h-full">
        
        {/* Header content grid layout split (Static on entry) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start px-2 w-full mt-2 lg:mt-0">
          {/* Column 1: Badge + Stacked title */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4 lg:gap-5">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-[#1A1A1A]">
                Methodology
              </span>
            </div>

            {/* Premium, ultra-bold capitalized stacked header in brand colors */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-sans font-extrabold tracking-tighter uppercase leading-[0.88] select-none flex flex-col pt-1">
              <span className="bg-gradient-to-r from-[#df8326] to-[#C57019] bg-clip-text text-transparent">NEXAGE-X®</span>
              <span className="text-[#1A1A1A]">METHOD</span>
            </h2>
          </div>

          {/* Column 2: Right alignment descriptive copy */}
          <div className="lg:col-span-5 flex items-center justify-start lg:justify-end lg:pt-12">
            <p className="text-[#808080] text-[17px] md:text-lg font-sans font-normal leading-relaxed max-w-sm text-justify select-none">
              Every project requires a distinct strategy, yet our underlying approach remains unified: intentional, collaborative, and engineered to{" "}
              <span className="text-[#1A1A1A] font-semibold">drive measurable outcomes</span>. This is our execution blueprint.
            </p>
          </div>
        </div>

        {/* Methodology Cards Grid Row (Decoupled wrappers for GSAP ScrollTrigger) */}
        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 z-10 relative w-full lg:mt-16 lg:my-auto"
        >
          {cards.map((card, idx) => (
            <div key={idx} className="methodology-card-wrapper w-full origin-bottom will-change-[transform,opacity]">
              <MethodCard
                number={card.number}
                title={card.title}
                description={card.description}
                deliverables={card.deliverables}
                imageUrl={card.imageUrl}
                theme={card.theme}
                index={idx}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA Block with split text and double text slide-up button (Static on entry) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 border-t border-black/10 px-2 w-full mb-2 lg:mb-0">
          {/* Left Side CTA text */}
          <p className="text-[#808080] text-xl md:text-2xl font-sans font-light leading-relaxed select-none mb-6 md:mb-0">
            Strategy meets structure — here&apos;s{" "}
            <span className="text-[#1A1A1A] font-semibold">the full blueprint</span>
          </p>

          {/* Right Side Slide-Up Text Reveal Link Button */}
          <motion.a 
            href="./about-us#method-scroll-section"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(223,131,38,0.06)",
              borderColor: "#df8326",
            }}
            whileTap={{ scale: 0.98 }}
            className="border border-[#1A1A1A] px-8 py-3.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white text-[#1A1A1A] relative overflow-hidden group flex items-center justify-center cursor-pointer min-w-[220px] h-[48px] transition-colors duration-300"
          >
            {/* Sliding text wrapper */}
            <div className="relative overflow-hidden h-[18px] w-full flex items-center justify-center pointer-events-none">
              {/* Default text - slides up and fades on hover */}
              <span 
                className="absolute inline-block text-center whitespace-nowrap transition-all duration-500 group-hover:-translate-y-[150%] group-hover:opacity-0"
                style={{ transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                See Our Full Process
              </span>
              {/* Duplicate text - starts below and slides up on hover inside brand coppery accent */}
              <span 
                className="absolute inline-block text-center whitespace-nowrap translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 text-[#df8326]"
                style={{ transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                See Our Full Process
              </span>
            </div>
          </motion.a>
        </div>

      </div>
    </section>
  );
}
