"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

interface ProjectData {
  num: string;
  title: string;
  image: string;
  x?: string; // Statically or dynamically assigned track X percentage
  rotate?: number;
  scale?: number;
}

const allProjects: ProjectData[] = [
  {
    num: "01",
    title: "Ontriq Gateway",
    image: "/projects-done/Ontriq-screenshot.webp",
  },
  {
    num: "02",
    title: "Agenly Online",
    image: "/projects-done/agenly.online.webp",
  },
  {
    num: "03",
    title: "Car Arena Ceylon",
    image: "/projects-done/cararenaceylon.webp",
  },
  {
    num: "04",
    title: "Ceylon Tea Land",
    image: "/projects-done/ceylon-tea-land.webp",
  },
  {
    num: "05",
    title: "Core Craft Portal",
    image: "/projects-done/core-craft-screenshot.webp",
  },
  {
    num: "06",
    title: "Exim Logistics",
    image: "/projects-done/exim.webp",
  },
  {
    num: "07",
    title: "Halo Systems",
    image: "/projects-done/halo.webp",
  },
  {
    num: "08",
    title: "Javagap Hub",
    image: "/projects-done/javagap.webp",
  },
  {
    num: "09",
    title: "Portlands Group",
    image: "/projects-done/portlands.webp",
  },
  {
    num: "10",
    title: "Secretary Services",
    image: "/projects-done/secertery-services.webp",
  },
  {
    num: "11",
    title: "TOS Lanka Mfg",
    image: "/projects-done/tos-lanka.png",
  },
  {
    num: "12",
    title: "YBO Growth Agency",
    image: "/projects-done/yboagency.webp",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [shuffledList, setShuffledList] = useState<ProjectData[]>([]);

  // Safe client-side mount & true random shuffle engine to prevent Next.js SSR hydration warnings
  useEffect(() => {
    setMounted(true);
    
    // Spacious, non-overlapping horizontal tracks flanking the center (cards are 520px wide)
    const leftTracks = ["3%", "6%", "9%", "12%", "15%", "18%"];
    const rightTracks = ["56%", "59%", "62%", "65%", "68%", "71%"];

    // Distribute exactly 6 left and 6 right positions to ensure perfect side-to-side balance
    const tracksList = [
      ...leftTracks.map(x => ({ x, side: "left" })),
      ...rightTracks.map(x => ({ x, side: "right" }))
    ];

    // Double shuffle: shuffle projects and tracks independently so their association is truly random,
    // and shuffle their rise order so that they float up in a completely random sequence!
    const shuffledProjects = [...allProjects].sort(() => Math.random() - 0.5);
    const shuffledTracks = [...tracksList].sort(() => Math.random() - 0.5);

    const shuffled = shuffledProjects.map((proj, idx) => {
      const track = shuffledTracks[idx];
      const randomRotate = -3.5 + Math.random() * 7; // Tactile rotation between -3.5deg and +3.5deg
      const randomScale = 0.94 + Math.random() * 0.08; // Elegant scale variations

      return {
        ...proj,
        x: track.x,
        rotate: randomRotate,
        scale: randomScale,
      };
    });

    setShuffledList(shuffled);
  }, []);

  // Brand card clip-path formula (12px small diagonal cuts on top-left, top-right, bottom-left; 48px large diagonal cut on bottom-right)
  const cardClipPath = "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 48px), calc(100% - 48px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)";

  useGSAP(() => {
    if (!sectionRef.current || !containerRef.current || shuffledList.length === 0) return;

    // Register ScrollTrigger on client side
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    // 1. DESKTOP VIEWPORT PINNING (min-width: 1024px)
    mm.add("(min-width: 1024px)", () => {
      const totalCards = shuffledList.length;
      // Proportional luxurious scroll depth for all 12 cards (total duration units)
      const scrollDepth = 1200 + totalCards * 550; 

      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top", // Pins exactly when the section hits top of viewport
          end: `+=${scrollDepth}`,
          scrub: 1, // High scrub sensitivity for smooth navigation
          pin: true, // PIN IT!
          anticipatePin: 1,
        }
      });

      // Calculate total timeline duration based on 0.5s stagger and 1.2s card animation duration
      const totalTimelineDuration = (totalCards - 1) * 0.5 + 1.2;

      // Animate center title scale & glowing opacity (lasts the entire scroll) - Crisp and fully visible!
      pinTimeline.fromTo(
        ".projects-center-title",
        {
          scale: 0.9,
          opacity: 0.85,
        },
        {
          scale: 1.02,
          opacity: 0.95,
          duration: totalTimelineDuration,
          ease: "none",
        },
        0 // starts synced with pin scroll
      );

      // Animate cards rise, rotate & fade in their randomized sequence (multiple cards rising at once)
      const cards = gsap.utils.toArray<HTMLElement>(".projects-floating-card");
      cards.forEach((card, idx) => {
        const proj = shuffledList[idx];
        const startOffset = idx * 0.5; // Staggered entry (multiple cards moving up simultaneously)

        // A. Vertical rise and rotation
        pinTimeline.to(
          card,
          {
            y: -1400,
            rotation: proj.rotate || 0, // Breathtaking natural weightless rotation
            duration: 1.2, // Each card takes 1.2 scroll time units to rise and fade
            ease: "none", // Linear scrub mapping
          },
          startOffset
        );

        // B. Opacity and scale: Fade in (first 20% of duration = 0.24 units)
        pinTimeline.fromTo(
          card,
          {
            opacity: 0,
            scale: (proj.scale || 1.0) * 0.9,
          },
          {
            opacity: 1,
            scale: proj.scale || 1.0,
            duration: 0.24,
            ease: "power1.out",
          },
          startOffset
        );

        // C. Opacity and scale: Fade out (last 20% of duration = 0.24 units, starts at 0.96 offset)
        pinTimeline.to(
          card,
          {
            opacity: 0,
            scale: (proj.scale || 1.0) * 0.9,
            duration: 0.24,
            ease: "power1.in",
          },
          startOffset + 0.96
        );
      });

      // Sort all registered triggers in DOM order and refresh to update spacing calculations
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, { dependencies: [shuffledList], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="recent-projects"
      className="relative w-full bg-[#F5F5F7] text-[#1A1A1A] overflow-hidden border-b border-black/[0.04] lg:h-screen lg:max-h-screen box-border flex flex-col justify-center"
    >
      {/* Background Cyber Mesh Grid - Light Theme */}
      <div className="absolute inset-0 cyber-grid opacity-[0.012] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-150px] w-[500px] h-[500px] rounded-full bg-[#df8326]/3 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute bottom-[30%] right-[-150px] w-[500px] h-[500px] rounded-full bg-[#df8326]/3 blur-[180px] pointer-events-none -z-10" />

      {/* Structural layout dashed guide lines */}
      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] border-l border-dashed border-black/[0.04] pointer-events-none z-0" />
      <div className="absolute top-0 bottom-0 right-6 md:right-12 lg:right-24 w-[1px] border-r border-dashed border-black/[0.04] pointer-events-none z-0" />

      {/* Main Container */}
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto relative z-10 w-full h-full flex items-center justify-center min-h-[600px] py-16 px-4 md:px-12 lg:px-24 lg:py-0"
      >
        {/* Sticky Center Text Layer (Dimmed dark watermark look on scroll) */}
        <div className="projects-center-title absolute text-center select-none pointer-events-none z-0 flex flex-col items-center justify-center transition-all duration-300">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#df8326] mb-4">
            [ showcase // portfolio ]
          </span>
          <h2 className="text-5xl sm:text-6xl md:text-8xl lg:text-[105px] font-sans font-extrabold tracking-tighter uppercase leading-[0.88] bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A] to-[#1A1A1A]/30 bg-clip-text text-transparent">
            RECENT <br />
            PROJECTS
          </h2>
        </div>

        {/* 1. DESKTOP FLOATING CARDS SPACE (min-width: 1024px) */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
          {mounted && shuffledList.map((proj, idx) => (
            <div
              key={idx}
              className="projects-floating-card absolute w-[520px] flex flex-col pointer-events-auto origin-center will-change-[transform,opacity] opacity-0"
              style={{
                left: proj.x,
                top: "100%", // Starts completely below viewport
                zIndex: 20,
              }}
            >
              {/* Premium Beveled Card frame contour - Light Theme */}
              <div
                className="w-full rounded-none p-[1px] relative overflow-hidden select-none group bg-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
                style={{
                  clipPath: cardClipPath,
                }}
              >
                {/* Full-Bleed Contained Screenshot Container */}
                <div
                  className="w-full bg-[#FFFFFF] rounded-none flex flex-col relative overflow-hidden h-[375px]"
                  style={{
                    clipPath: cardClipPath,
                  }}
                >
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    sizes="520px"
                    className="object-contain object-center p-3 transition-transform duration-750 group-hover:scale-102"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. MOBILE & TABLET RESPONSIVE GRID (max-width: 1023px) */}
        <div className="lg:hidden w-full flex flex-col gap-8 z-10 mt-64 sm:mt-80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {mounted && shuffledList.map((proj, idx) => (
              <div
                key={idx}
                className="w-full flex flex-col"
              >
                <div
                  className="w-full rounded-none p-[1px] relative overflow-hidden select-none group bg-black/[0.06] shadow-md"
                  style={{
                    clipPath: cardClipPath,
                  }}
                >
                  <div
                    className="w-full bg-[#FFFFFF] rounded-none flex flex-col relative overflow-hidden h-[290px]"
                    style={{
                      clipPath: cardClipPath,
                    }}
                  >
                    <Image
                      src={proj.image}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-contain object-center p-2.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
