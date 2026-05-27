"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Cpu, ShoppingBag, Package } from "lucide-react";

export default function WhyChooseMe() {
  const cardClipPath = "polygon(0 0, 100% 0, 100% calc(100% - 48px), calc(100% - 48px) 100%, 0 100%)";
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRefCard2 = React.useRef<HTMLVideoElement>(null);
  const videoRefCard4 = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Trigger play when at least 15% of the video is visible
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    const v2 = videoRefCard2.current;
    const v4 = videoRefCard4.current;

    if (v2) observer.observe(v2);
    if (v4) observer.observe(v4);

    return () => {
      if (v2) observer.unobserve(v2);
      if (v4) observer.unobserve(v4);
    };
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Organic floating staggered sines for premium suspended physics feel
    gsap.to(".node-1", {
      y: -8,
      x: 4,
      duration: 3.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    gsap.to(".node-2", {
      y: 8,
      x: -3,
      duration: 3.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.3
    });

    gsap.to(".node-3", {
      y: -6,
      x: -4,
      duration: 3.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.6
    });

    // Glowing laser pulse dashoffset flows
    gsap.fromTo(".flow-line",
      { strokeDashoffset: 100 },
      {
        strokeDashoffset: 0,
        duration: 3,
        ease: "none",
        repeat: -1
      }
    );

    // Staggered custom ripple expanding pulses
    gsap.fromTo(".ripple-pulse",
      { scale: 0.8, opacity: 0.6 },
      {
        scale: 2.2,
        opacity: 0,
        duration: 2,
        ease: "power1.out",
        stagger: {
          each: 0.6,
          repeat: -1
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section className="relative w-full py-24 bg-[#F5F5F7] text-[#1A1A1A] px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-syne font-medium tracking-tight text-[#1A1A1A] uppercase">
            Why choose us
          </h2>
          <div className="h-[1px] w-full bg-black/10 mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Systems (Span 2) - Dark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-2 bg-[#121214] rounded-3xl p-8 md:p-12 overflow-hidden relative flex flex-col min-h-[400px] md:min-h-[500px] justify-end shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            {/* Background Image wrapper */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/why-us.png"
                alt="Why Choose Nexage-X"
                fill
                className="object-cover"
                style={{ objectPosition: "center" }}
                priority
              />
              {/* Subtle dark gradient overlay to ensure text is never blocked */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-lg md:max-w-xl">
              <h3 className="text-3xl md:text-4xl font-sans font-bold text-white mb-4 tracking-tight leading-tight">
                We build systems, not just websites.
              </h3>
              <p className="text-zinc-300 text-lg font-sans leading-relaxed text-justify">
                Your store, marketing, automation, and backend should work together. We design every piece around growth, speed, and long-term control.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Design (Span 1) - Dark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#121214] rounded-3xl overflow-hidden relative flex flex-col min-h-[400px] md:min-h-[500px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            <div className="relative z-10 pt-8 px-8 md:pt-10 md:px-10 mb-6">
              <h3 className="text-[28px] md:text-[38px] lg:text-[40px] font-sans font-bold text-white leading-tight tracking-tight">
                Design that makes sense and looks stunning
              </h3>
            </div>
            <div className="relative flex-grow mt-auto w-full min-h-[250px] overflow-hidden">
              <video
                ref={videoRefCard2}
                src="/Web_design_gallery_fly-through_202605271835.mp4"
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Horizontal black fade overlay at the top edge of the video to remove any line and blend seamlessly */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#121214] via-[#121214]/40 to-transparent z-10 pointer-events-none" />
            </div>
          </motion.div>

          {/* Card 3: Projects Completed (Span 1) - Dark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-[#121214] rounded-3xl overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src="/projects completed.png"
                alt="Projects Completed"
                fill
                className="object-cover"
                style={{ objectPosition: "center" }}
              />
            </div>
          </motion.div>

          {/* Card 4: Flexible and scalable (Span 1) - Light */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-black rounded-3xl p-[1px] overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            style={{ clipPath: cardClipPath }}
          >
            <div
              className="bg-[#e7e6e7] w-full h-full rounded-[23px] overflow-hidden flex flex-col relative flex-grow"
              style={{ clipPath: cardClipPath }}
            >
              <div className="relative z-10 pt-8 px-8 mb-6">
                <h3 className="text-[26px] md:text-[28px] lg:text-[32px] font-sans font-bold text-[#1A1A1A] mb-2 tracking-tight">
                  Flexible and scalable
                </h3>
                <p className="text-[#666666] text-[15px] md:text-base font-sans leading-relaxed">
                  Easily scale as your business grows.
                </p>
              </div>
              <div className="relative flex-grow mt-auto w-full min-h-[200px] overflow-hidden">
                <video
                  ref={videoRefCard4}
                  src="/Plant_grows_on_platforms_202605271924.mp4#t=4"
                  loop
                  muted
                  playsInline
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    if (video.currentTime < 4) {
                      video.currentTime = 4;
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.currentTime < 4) {
                      video.currentTime = 4;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* Horizontal feather-fade overlay at the top edge of the video */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#e7e6e7] via-[#e7e6e7]/40 to-transparent z-10 pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Card 5: Logistics & Automation (Span 1) - Dark */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-[#121214] rounded-3xl p-8 overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-left"
            style={{ clipPath: cardClipPath }}
            ref={containerRef}
          >
            <div className="relative z-10 mb-6">
              <h3 className="text-[26px] md:text-[28px] lg:text-[32px] font-sans font-bold text-white mb-2 tracking-tight">
                Logistics & Automation
              </h3>
              <p className="text-white/50 text-[15px] md:text-base font-sans leading-relaxed">
                Streamline backend workflows, scale marketplace channels, and manage shipping automatically.
              </p>
            </div>
            
            {/* High-End GSAP-Animated Floating Workflow Visual */}
            <div className="relative flex-grow mt-auto w-full min-h-[180px] bg-white/[0.01] border border-white/5 rounded-2xl p-4 overflow-hidden">
              {/* Moving cyber grid background */}
              <div className="absolute inset-0 cyber-grid opacity-20 animate-grid-drift" />
              
              {/* SVG Curved Pipeline Data Flow */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 320 180" fill="none" preserveAspectRatio="none">
                {/* Curved pipeline background */}
                <path
                  d="M 65 36 Q 160 36 160 90 T 255 144"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Glowing laser data flow */}
                <path
                  className="flow-line"
                  d="M 65 36 Q 160 36 160 90 T 255 144"
                  stroke="url(#laserGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="20 40"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#df8326" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#C57019" stopOpacity="1.0" />
                    <stop offset="100%" stopColor="#df8326" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 w-full h-full z-10">
                {/* Node 1: Operations */}
                <div className="node-1 absolute top-[12%] left-[6%] flex items-center gap-2 bg-[#16161a]/95 border border-[#C57019]/35 px-3 py-1 rounded-full text-[10px] font-mono text-[#df8326] shadow-[0_0_15px_rgba(197,112,25,0.15)]">
                  <Cpu className="w-3.5 h-3.5 text-[#df8326]" />
                  <span className="relative flex h-2 w-2">
                    <span className="ripple-pulse absolute inline-flex h-full w-full rounded-full bg-[#C57019] opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C57019]"></span>
                  </span>
                  Backend Automation
                </div>

                {/* Node 2: Marketplace */}
                <div className="node-2 absolute top-[43%] left-[28%] flex items-center gap-2 bg-[#16161a]/95 border border-[#C57019]/35 px-3 py-1 rounded-full text-[10px] font-mono text-[#df8326] shadow-[0_0_15px_rgba(197,112,25,0.15)]">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#df8326]" />
                  <span className="relative flex h-2 w-2">
                    <span className="ripple-pulse absolute inline-flex h-full w-full rounded-full bg-[#C57019] opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C57019]"></span>
                  </span>
                  Marketplace Setup
                </div>

                {/* Node 3: Fulfillment */}
                <div className="node-3 absolute bottom-[12%] right-[6%] flex items-center gap-2 bg-[#16161a]/95 border border-[#C57019]/35 px-3 py-1 rounded-full text-[10px] font-mono text-[#df8326] shadow-[0_0_15px_rgba(197,112,25,0.15)]">
                  <Package className="w-3.5 h-3.5 text-[#df8326]" />
                  <span className="relative flex h-2 w-2">
                    <span className="ripple-pulse absolute inline-flex h-full w-full rounded-full bg-[#C57019] opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C57019]"></span>
                  </span>
                  Fulfillment Sync
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
