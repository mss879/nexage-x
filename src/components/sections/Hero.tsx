"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Logo from "@/components/ui/Logo";
import { useMenu } from "@/components/menu/MenuProvider";

// SVG Components for smooth, sloped transitions (S-Curves and stretched concave corners)
const CornerOuter = ({ className, width = 40, height = 40 }: { className?: string, width?: number, height?: number }) => (
  <svg
    className={`absolute text-[#18181b] fill-current pointer-events-none ${className}`}
    style={{ width, height }}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M100 0 H 0 V 100 C 0 55, 55 0, 100 0 Z" />
  </svg>
);

const SCurveTop = ({ className, width = 120, height = 84 }: { className?: string, width?: number, height?: number }) => (
  <svg
    className={`absolute text-[#18181b] fill-current pointer-events-none ${className}`}
    style={{ width, height }}
    viewBox="0 0 120 84"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 0 0 V 84 C 60 84, 60 0, 120 0 Z" />
  </svg>
);

const SCurveRight = ({ className, width = 88, height = 56 }: { className?: string, width?: number, height?: number }) => (
  <svg
    className={`absolute text-[#18181b] fill-current pointer-events-none ${className}`}
    style={{ width, height }}
    viewBox="0 0 88 56"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 88 56 H 0 C 0 32, 88 24, 88 0 Z" />
  </svg>
);


// Superellipse corner radii — identical to the desktop nav buttons, so the
// mobile Menu/Connect buttons share the exact same (skewed) shape.
const SKEW_BTN_STYLE = {
  // @ts-ignore — corner-shape is a newer CSS property used across the design
  cornerShape: "superellipse(1.5)",
  "--corner-shape-fallback": "0.752",
  borderRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
} as React.CSSProperties;

interface HeroProps {
  startAnimation?: boolean;
}

export default function Hero({ startAnimation = true }: HeroProps) {
  const { open: openMenu } = useMenu();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleLinesRef = useRef<HTMLSpanElement[]>([]);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const addToTitleRefs = (el: HTMLSpanElement | null) => {
    if (el && !titleLinesRef.current.includes(el)) {
      titleLinesRef.current.push(el);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Always set initial state unconditionally so things are hidden on mount
      gsap.set(cardRef.current, { scale: 0.97, opacity: 0, y: 30 });
      gsap.set(imageWrapperRef.current, { scale: 1.05, opacity: 0 });
      gsap.set(titleLinesRef.current, { y: 50, opacity: 0 });
      gsap.set(descRef.current, { y: 30, opacity: 0 });
      gsap.set(buttonRef.current, { scale: 0.9, opacity: 0 });
      gsap.set(navRef.current, { y: -25, opacity: 0 });
      gsap.set(logoRef.current, { y: 25, opacity: 0 });
      gsap.set(socialsRef.current, { x: 25, opacity: 0 });

      // 2. Only run the entrance animation once startAnimation becomes true
      if (startAnimation) {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.to(cardRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
        });

        tl.to(imageWrapperRef.current, {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
        }, "-=1.0");

        tl.to(titleLinesRef.current, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.12,
          ease: "power3.out",
        }, "-=1.1");

        tl.to(descRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        }, "-=0.8");

        tl.to(buttonRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.6)",
        }, "-=0.7");

        tl.to([navRef.current, logoRef.current, socialsRef.current], {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }, "-=0.6");
      } // End if (startAnimation)
    }, containerRef);

    return () => ctx.revert();
  }, [startAnimation]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen bg-[#18181b] p-3 flex flex-col justify-center items-center overflow-hidden font-sans"
    >
      {/* 1. Main Light-Grey Card — sits inside the dark frame with padding */}
      <div
        ref={cardRef}
        className="relative w-full h-full bg-[#dfdfe1] overflow-hidden flex items-center z-10"
        style={{ borderRadius: "24px" }} // Beautiful rounded corners framing the card
      >
        {/* Full background video — matching Framer's full-bleed layout */}
        <div
          ref={imageWrapperRef}
          className="absolute inset-0 pointer-events-none select-none z-0"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: "69.8% 49.5%" }}
          >
            <source src="/Silhouette_wearing_VR_visor_202605270054.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Global subtle white/grey wash overlay — not too strong */}
        <div className="absolute inset-0 bg-[#dfdfe1]/30 z-[1] pointer-events-none mix-blend-normal" />

        {/* Left-side gradient overlay — fades video behind the text content area */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: "linear-gradient(to right, #dfdfe1 0%, #dfdfe1 12%, rgba(223,223,225,0.9) 25%, rgba(223,223,225,0.5) 40%, transparent 60%)",
          }}
        />

        {/* Foreground Content */}
        <div className="relative z-20 w-full h-full flex flex-col justify-center items-start px-6 sm:px-12 md:px-20 lg:px-24 py-16 md:py-24 max-w-[1100px] my-auto">
          {/* Mobile-only Header — pinned to the top of the hero */}
          <div className="md:hidden absolute top-0 inset-x-0 z-30 flex items-center justify-between px-5 pt-5 select-none">
            <a href="#hero" className="shrink-0 -ml-2.5">
              <Logo className="h-9 w-[112px]" imgClassName="brightness-0" />
            </a>
            <div className="flex items-center gap-3 shrink-0">
              {/* Menu — solid, skewed to match the desktop button shape */}
              <button
                onClick={openMenu}
                style={SKEW_BTN_STYLE}
                className="-skew-x-[20deg] bg-gradient-to-b from-[#df8326] to-[#C57019] px-4 py-2 shadow-[0_6px_18px_rgba(197,112,25,0.35)] transition-transform active:scale-95"
              >
                <span className="flex skew-x-[20deg] items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
                  Menu
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </span>
              </button>
              {/* Connect — solid, skewed to match the desktop button shape */}
              <a
                href="/contact"
                style={SKEW_BTN_STYLE}
                className="-skew-x-[20deg] bg-gradient-to-b from-[#df8326] to-[#C57019] px-4 py-2 shadow-[0_6px_18px_rgba(197,112,25,0.35)] transition-transform active:scale-95"
              >
                <span className="flex skew-x-[20deg] items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
                  Connect
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Headline Typography — exact Framer text styling */}
          <h1 className="flex flex-col font-syne text-[1.5rem] sm:text-[2.8rem] md:text-[3.6rem] lg:text-[4.2rem] leading-[1.08] sm:leading-[1.05] tracking-tight text-[#000000] select-none font-medium mb-6">
            <span ref={addToTitleRefs} className="block overflow-hidden py-0.5">Designing experiences,</span>
            <span ref={addToTitleRefs} className="block overflow-hidden py-0.5">deploying seamless</span>
            <span ref={addToTitleRefs} className="block overflow-hidden py-0.5"><strong className="font-bold">logistics</strong>.</span>
          </h1>

          {/* Description Paragraph */}
          <p
            ref={descRef}
            className="font-plus-jakarta text-[#4d4d4f] text-sm sm:text-base md:text-[1.05rem] max-w-[540px] leading-relaxed mb-10 select-none font-normal text-left md:text-justify"
          >
            A high-performance digital automation and e-commerce studio. We build stunning custom storefronts, robust web applications, and end-to-end logistics solutions engineered to scale visionary brands.
          </p>

          {/* CTA button — orange gradient with top border highlight, rounded-xl (12px) */}
          <a
            ref={buttonRef}
            href="#work"
            className="framer-m5N6O group cta-btn flex items-center shadow-[0_8px_30px_rgba(197,112,25,0.25)] select-none overflow-hidden"
            style={{
              "--border-bottom-width": "1px",
              "--border-color": "rgba(255, 255, 255, 0.2)",
              "--border-left-width": "1px",
              "--border-right-width": "1px",
              "--border-style": "solid",
              "--border-top-width": "1px",
              "--corner-shape-fallback": "0.752",
              background: "linear-gradient(180deg, #df8326 0%, #C57019 100%)",
              // @ts-ignore
              "cornerShape": "superellipse(1.5)",
              borderBottomLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
              borderBottomRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
              borderTopLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
              borderTopRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
              willChange: "auto",
              transformOrigin: "50% 50% 0px",
              opacity: 1,
              padding: "10px 24px",
            } as React.CSSProperties}
          >
            {/* Background helpers to maintain Framer layer behaviors */}
            <div className="framer-lj3pv framer-xg4s92" style={{ background: "linear-gradient(180deg, #df8326 0%, #C57019 100%)", opacity: 1 }}></div>

            {/* Premium background shimmer gloss sweep */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none rounded-inherit z-0">
              <div className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent cta-shimmer-effect" />
            </div>

            <div className="framer-content-wrapper">
              <span className="text-white font-plus-jakarta font-semibold text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </a>
        </div>
      </div>

      {/* --- ABSOLUTE OVERLAYS (The Cutouts - OUTSIDE CARD FOR PERFECT CORNERS) --- */}

      {/* A. Top-Left Nav Block */}
      <div
        ref={navRef}
        className="hidden md:flex absolute top-[12px] left-[12px] w-[580px] h-[56px] bg-[#18181b] z-30 items-center justify-between rounded-tl-[24px] shadow-[-2px_-2px_0_0_#18181b] px-4"
      >
        {/* Left Side: Logo */}
        <div className="relative flex items-center h-full -top-[5px] w-full">
          <a href="#hero" className="absolute left-[-22px] top-1/2 -translate-y-[49%] flex items-center shrink-0">
            <Image src="/yari-logo.png" alt="Logo" width={800} height={200} className="h-[200px] w-auto object-contain" />
          </a>
        </div>

        {/* Right Side: Two Skewed Buttons (Menu & Connect) aligned far right */}
        <div className="flex items-center gap-5 shrink-0 mr-[-18px] translate-x-[6px] -top-[6px] relative z-40">
          {/* 1. Menu Button (Large) */}
          <div className="framer-iny974-container" style={{ transform: "none", transformOrigin: "50% 50% 0px", opacity: 1 }}>
            <button
              onClick={openMenu}
              className="framer-m5N6O framer-m5N6O-large framer-uXsXm framer-cjrjU framer-55u4xr framer-v-55u4xr framer-1akrlmb"
              style={{
                "--border-bottom-width": "1px",
                "--border-color": "#C57019",
                "--border-left-width": "1px",
                "--border-right-width": "1px",
                "--border-style": "solid",
                "--border-top-width": "1px",
                "--corner-shape-fallback": "0.752",
                backgroundColor: "rgba(0, 0, 0, 0)",
                // @ts-ignore
                "cornerShape": "superellipse(1.5)",
                borderBottomLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderBottomRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderTopLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderTopRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                willChange: "auto",
                transform: "none",
                transformOrigin: "50% 50% 0px",
                opacity: 1,
              } as React.CSSProperties}
            >
              <div className="framer-lj3pv framer-xg4s92" style={{ "--1bgoogp": "#C57019" } as React.CSSProperties}></div>
              <div className="framer-lj3pv framer-1qnijj" style={{ "--1bgoogp": "var(--token-5a0da56e-d8dd-4bcf-a0d0-72196ac2e777, rgb(24, 24, 27))" } as React.CSSProperties}></div>
              <div className="framer-BfnQD framer-1lyy2do" style={{ "--1bgoogp": "#C57019" } as React.CSSProperties}></div>
              <div className="framer-BfnQD framer-o7xx3e" style={{ "--1bgoogp": "var(--token-5a0da56e-d8dd-4bcf-a0d0-72196ac2e777, rgb(24, 24, 27))" } as React.CSSProperties}></div>

              <div className="framer-content-wrapper">
                <div className="framer-1e87nka" data-framer-component-type="RichTextContainer" style={{ "--extracted-r6o4lv": "rgb(255, 255, 255)" } as React.CSSProperties}>
                  <p className="framer-text">Menu</p>
                </div>
                <svg className="framer-IvaS8 framer-gq87w0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </button>
          </div>

          {/* 2. Connect Button */}
          <div className="framer-iny974-container" style={{ transform: "none", transformOrigin: "50% 50% 0px", opacity: 1 }}>
            <a
              href="/contact"
              className="framer-m5N6O framer-m5N6O-large framer-uXsXm framer-cjrjU framer-55u4xr framer-v-55u4xr framer-1akrlmb"
              style={{
                "--border-bottom-width": "1px",
                "--border-color": "#C57019",
                "--border-left-width": "1px",
                "--border-right-width": "1px",
                "--border-style": "solid",
                "--border-top-width": "1px",
                "--corner-shape-fallback": "0.752",
                backgroundColor: "rgba(0, 0, 0, 0)",
                // @ts-ignore
                "cornerShape": "superellipse(1.5)",
                borderBottomLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderBottomRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderTopLeftRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                borderTopRightRadius: "calc(10px*var(--one-if-corner-shape-supported,var(--corner-shape-fallback,1)))",
                willChange: "auto",
                transform: "none",
                transformOrigin: "50% 50% 0px",
                opacity: 1,
              } as React.CSSProperties}
            >
              <div className="framer-lj3pv framer-xg4s92" style={{ "--1bgoogp": "#C57019" } as React.CSSProperties}></div>
              <div className="framer-lj3pv framer-1qnijj" style={{ "--1bgoogp": "var(--token-5a0da56e-d8dd-4bcf-a0d0-72196ac2e777, rgb(24, 24, 27))" } as React.CSSProperties}></div>
              <div className="framer-BfnQD framer-1lyy2do" style={{ "--1bgoogp": "#C57019" } as React.CSSProperties}></div>
              <div className="framer-BfnQD framer-o7xx3e" style={{ "--1bgoogp": "var(--token-5a0da56e-d8dd-4bcf-a0d0-72196ac2e777, rgb(24, 24, 27))" } as React.CSSProperties}></div>

              <div className="framer-content-wrapper">
                <div className="framer-1e87nka" data-framer-component-type="RichTextContainer" style={{ "--extracted-r6o4lv": "rgb(255, 255, 255)" } as React.CSSProperties}>
                  <p className="framer-text">Connect</p>
                </div>
                <svg
                  className="framer-IvaS8 framer-gq87w0"
                  role="presentation"
                  viewBox="0 0 24 24"
                  style={{
                    "--8azvrr": 1,
                    "--ed7zm5": "var(--token-2c617c6c-bc75-483c-a1b2-b392deca402c, rgb(255, 255, 255))",
                    transform: "none",
                    transformOrigin: "50% 50% 0px",
                    opacity: 1,
                  } as React.CSSProperties}
                >
                  <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* S-Curve on the right, standard concave corner on the bottom-left */}
        <SCurveTop className="absolute top-0 -right-[31.5px]" width={32} height={56} />
        <CornerOuter className="absolute -bottom-[39.5px] left-0" width={40} height={40} />
      </div>

      {/* B. Bottom-Left Name Block — Trusted by Ticker */}
      <div
        ref={logoRef}
        className="hidden md:flex absolute bottom-[12px] left-[12px] w-[510px] h-[80px] bg-[#18181b] z-30 items-center rounded-bl-[24px] shadow-[-2px_2px_0_0_#18181b]"
      >
        {/* Left Side: Static Label */}
        <div className="flex items-center h-full pl-6 pr-4 border-r border-[#27272a]/70 shrink-0 select-none">
          <span className="text-[11.5px] uppercase tracking-[0.22em] text-zinc-400 font-bold font-plus-jakarta whitespace-nowrap">
            Trusted by
          </span>
        </div>

        {/* Right Side: Infinite scrolling marquee */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <div className="flex w-max gap-10 animate-marquee">
            {/* Set 1 */}
            <div className="flex items-center gap-10 pr-10 text-zinc-400">
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14v6H12.5L19 14.5V22H5v-6h6.5L5 9.5V2z" /></svg>
                <span>Framer</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[18px] h-[16px]" viewBox="0 0 76 65" fill="currentColor"><polygon points="38,0 76,65 0,65" /></svg>
                <span>Vercel</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[14px] h-[20px]" viewBox="0 0 8 12" fill="currentColor"><path d="M2 12C3.10457 12 4 11.1046 4 10V8H2C0.89543 8 0 8.89543 0 10C0 11.1046 0.89543 12 2 12Z" /><path d="M0 6C0 4.89543 0.89543 4 2 4H4V8H2C0.89543 8 0 7.10457 0 6Z" /><path d="M0 2C0 0.89543 0.89543 0 2 0H4V4H2C0.89543 4 0 3.10457 0 2Z" /><path d="M4 0H6C7.10457 0 8 0.89543 8 2C8 3.10457 7.10457 4 6 4H4V0Z" /><path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6V8H6Z" /></svg>
                <span>Figma</span>
              </div>
              <div className="text-[16px] font-bold font-sans italic hover:text-white transition-colors shrink-0">
                Stripe
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                <span>GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[17px] h-[21px]" viewBox="0 0 24 24" fill="currentColor"><path d="M21.36 11.02h-7.11l3.56-9.02a.6.6 0 0 0-1.04-.54L2.64 12.98a.6.6 0 0 0 .52 1h7.11l-3.56 9.02a.6.6 0 0 0 1.04.54l14.13-11.52c.32-.26.14-.8-.52-.8z" /></svg>
                <span>Supabase</span>
              </div>
              <div className="text-[16px] font-bold font-syne tracking-tight hover:text-white transition-colors shrink-0">
                Linear
              </div>
            </div>
            {/* Set 2 */}
            <div className="flex items-center gap-10 pr-10 text-zinc-400">
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14v6H12.5L19 14.5V22H5v-6h6.5L5 9.5V2z" /></svg>
                <span>Framer</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[18px] h-[16px]" viewBox="0 0 76 65" fill="currentColor"><polygon points="38,0 76,65 0,65" /></svg>
                <span>Vercel</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[14px] h-[20px]" viewBox="0 0 8 12" fill="currentColor"><path d="M2 12C3.10457 12 4 11.1046 4 10V8H2C0.89543 8 0 8.89543 0 10C0 11.1046 0.89543 12 2 12Z" /><path d="M0 6C0 4.89543 0.89543 4 2 4H4V8H2C0.89543 8 0 7.10457 0 6Z" /><path d="M0 2C0 0.89543 0.89543 0 2 0H4V4H2C0.89543 4 0 3.10457 0 2Z" /><path d="M4 0H6C7.10457 0 8 0.89543 8 2C8 3.10457 7.10457 4 6 4H4V0Z" /><path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6V8H6Z" /></svg>
                <span>Figma</span>
              </div>
              <div className="text-[16px] font-bold font-sans italic hover:text-white transition-colors shrink-0">
                Stripe
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                <span>GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-[16px] font-bold font-plus-jakarta hover:text-white transition-colors shrink-0">
                <svg className="w-[17px] h-[21px]" viewBox="0 0 24 24" fill="currentColor"><path d="M21.36 11.02h-7.11l3.56-9.02a.6.6 0 0 0-1.04-.54L2.64 12.98a.6.6 0 0 0 .52 1h7.11l-3.56 9.02a.6.6 0 0 0 1.04.54l14.13-11.52c.32-.26.14-.8-.52-.8z" /></svg>
                <span>Supabase</span>
              </div>
              <div className="text-[16px] font-bold font-syne tracking-tight hover:text-white transition-colors shrink-0">
                Linear
              </div>
            </div>
          </div>
        </div>

        {/* S-Curve on the right, standard concave corner on the top-left */}
        <SCurveTop className="absolute bottom-0 -right-[119.5px] scale-y-[-1]" width={120} height={80} />
        <CornerOuter className="absolute -top-[39.5px] left-0 scale-y-[-1]" width={40} height={40} />
      </div>

      {/* C. Right Socials Block — tall vertical dark strip on bottom-right corner */}
      <div
        ref={socialsRef}
        className="hidden md:flex absolute bottom-[12px] right-[8px] w-[88px] h-[310px] bg-[#18181b] z-30 flex-col items-center justify-center gap-2 py-3 rounded-br-[24px] shadow-[2px_2px_0_0_#18181b]"
      >
        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn-insta relative left-[6px] -top-[24px] w-[76px] h-[92px] flex items-center justify-center rounded-[12px] bg-[#27272a] text-white border-[3px] border-[#C57019] z-10"
        >
          <svg className="social-icon w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn-linkedin relative left-[6px] -top-[24px] w-[76px] h-[92px] flex items-center justify-center rounded-[12px] bg-[#27272a] text-white border-[3px] border-[#C57019] z-10"
        >
          <span className="social-icon font-syne font-bold text-[20px]">in</span>
        </a>

        {/* X / Twitter */}
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn social-btn-x relative left-[6px] -top-[24px] w-[76px] h-[92px] flex items-center justify-center rounded-[12px] bg-[#27272a] text-white border-[3px] border-[#C57019] z-10"
        >
          <span className="social-icon font-syne font-bold text-[20px]">𝕏</span>
        </a>

        {/* S-Curve on the top, standard concave corner on the bottom-left */}
        <SCurveRight className="absolute -top-[55.5px] left-0 z-0" width={88} height={56} />
        <CornerOuter className="absolute bottom-0 -left-[39.5px] rotate-180 z-0" width={40} height={40} />
      </div>
    </section>
  );
}
