"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ShoppingBag, Package, RefreshCw } from "lucide-react";

const services = [
  {
    name: "Fulfillment Sync",
    icon: Package,
    initialPos: { bottom: "10%", left: "45%" },
    floatAnim: { y: [0, -6, 0] },
    floatDuration: 4.2,
    floatDelay: 0.3,
  },
  {
    name: "Marketplace Setup",
    icon: ShoppingBag,
    initialPos: { top: "45%", left: "20%" },
    floatAnim: { y: [0, -5, 0] },
    floatDuration: 3.8,
    floatDelay: 0.5,
  },
  {
    name: "Supply Chain",
    icon: RefreshCw,
    initialPos: { top: "15%", right: "8%" },
    floatAnim: { y: [0, -6, 0] },
    floatDuration: 3.9,
    floatDelay: 0.7,
  },
];

export default function WhyChooseMe() {
  const cardClipPath = "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 48px), calc(100% - 48px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)";
  const constraintsRef = useRef<HTMLDivElement>(null);
  const videoRefCard2 = useRef<HTMLVideoElement>(null);
  const videoRefCard4 = useRef<HTMLVideoElement>(null);

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Trigger play when at least 15% of the video is visible
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(() => { });
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = constraintsRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const pills = container.querySelectorAll(".draggable-pill");
    pills.forEach((pill, idx) => {
      // If actively dragging this pill, let Framer Motion handle it, do not apply repulsion offsets!
      if (draggingIdx === idx) return;

      const htmlPill = pill as HTMLElement;
      const pillRect = htmlPill.getBoundingClientRect();
      const pillCenterX = pillRect.left - rect.left + pillRect.width / 2;
      const pillCenterY = pillRect.top - rect.top + pillRect.height / 2;

      const dx = pillCenterX - mouseX;
      const dy = pillCenterY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 110; // Active repulsion boundary in pixels

      if (dist < threshold) {
        const force = (threshold - dist) / threshold;
        const maxPush = 40; // Max push distance in px
        const pushX = (dx / dist) * force * maxPush;
        const pushY = (dy / dist) * force * maxPush;

        gsap.to(htmlPill, {
          x: pushX,
          y: pushY,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        // Smoothly float back to original position
        gsap.to(htmlPill, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  };

  const handleMouseLeave = () => {
    const container = constraintsRef.current;
    if (!container) return;
    const pills = container.querySelectorAll(".draggable-pill");
    pills.forEach((pill) => {
      gsap.to(pill, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

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
            className="md:col-span-2 bg-[#121214] p-8 md:p-12 overflow-hidden relative flex flex-col min-h-[400px] md:min-h-[500px] justify-end shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            {/* Background Image wrapper */}
            <div 
              className="absolute inset-0 z-0"
              style={{ clipPath: cardClipPath }}
            >
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
            className="bg-[#121214] overflow-hidden relative flex flex-col min-h-[400px] md:min-h-[500px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            <div className="relative z-10 pt-8 px-8 md:pt-10 md:px-10 mb-6">
              <h3 className="text-[28px] md:text-[38px] lg:text-[40px] font-sans font-bold text-white leading-tight tracking-tight">
                Design that makes sense and looks stunning
              </h3>
            </div>
            <div 
              className="relative flex-grow mt-auto w-full min-h-[250px] overflow-hidden"
              style={{ clipPath: cardClipPath }}
            >
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
            className="bg-[#121214] overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            style={{ clipPath: cardClipPath }}
          >
            <div 
              className="absolute inset-0 z-0"
              style={{ clipPath: cardClipPath }}
            >
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
            className="bg-black p-[1px] overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            style={{ clipPath: cardClipPath }}
          >
            <div
              className="bg-[#e7e6e7] w-full h-full overflow-hidden flex flex-col relative flex-grow"
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
              <div 
                className="relative flex-grow mt-auto w-full min-h-[200px] overflow-hidden"
                style={{ clipPath: cardClipPath }}
              >
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
            className="bg-[#121214] p-8 overflow-hidden relative flex flex-col min-h-[380px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-left"
            style={{ clipPath: cardClipPath }}
          >
            <div className="relative z-10 mb-6">
              <h3 className="text-[26px] md:text-[28px] lg:text-[32px] font-sans font-bold text-white mb-2 tracking-tight">
                Logistics & Automation
              </h3>
              <p className="text-white/50 text-[15px] md:text-base font-sans leading-relaxed">
                Streamline backend workflows, scale marketplace channels, and manage shipping automatically.
              </p>
            </div>

            {/* High-End Draggable Floating Playground Bounded Area */}
            <div
              ref={constraintsRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative flex-grow mt-auto w-full min-h-[180px] bg-white/[0.01] border border-white/5 overflow-hidden touch-none select-none"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 48px), calc(100% - 48px) 100%, 0 100%)" }}
            >
              {/* Moving cyber grid background */}
              <div className="absolute inset-0 cyber-grid opacity-15 animate-grid-drift pointer-events-none" />

              {/* Floating & Draggable Services Pills (Elastic Spring Return Slots) */}
              {services.map((svc, idx) => {
                const IconComponent = svc.icon;
                return (
                  <motion.div
                    key={idx}
                    drag
                    dragConstraints={constraintsRef}
                    dragElastic={0.4}
                    dragSnapToOrigin={true}
                    dragTransition={{ bounceStiffness: 400, bounceDamping: 18 }}
                    onDragStart={() => setDraggingIdx(idx)}
                    onDragEnd={() => {
                      setDraggingIdx(null);
                      // Instantly reset visual evasion offset on drag end
                      const pill = constraintsRef.current?.querySelectorAll(".draggable-pill")[idx];
                      if (pill) {
                        gsap.to(pill, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
                      }
                    }}
                    whileDrag={{
                      scale: 1.12,
                      zIndex: 40,
                      cursor: "grabbing",
                    }}
                    whileHover={{
                      scale: 1.05,
                      cursor: "grab",
                    }}
                    animate={{
                      y: svc.floatAnim.y,
                    }}
                    transition={{
                      y: {
                        duration: svc.floatDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: svc.floatDelay,
                      },
                    }}
                    style={{
                      position: "absolute",
                      ...svc.initialPos,
                    }}
                    className="z-20 select-none cursor-grab"
                  >
                    {/* Skewed Container (Layer 2) - Repelled by Mouse */}
                    <div className="draggable-pill transform -skew-x-20 bg-[#16161a]/95 border border-[#df8326]/30 px-3.5 py-2 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-2.5 transition-colors duration-300 hover:border-[#df8326] hover:shadow-[0_0_20px_rgba(223,131,38,0.25)]">
                      {/* Unskewed Content wrapper (Layer 3) */}
                      <div className="transform skew-x-20 flex items-center gap-2.5 text-[10.5px] md:text-[11px] font-mono text-[#df8326]">
                        <IconComponent className="w-3.5 h-3.5 text-[#df8326]" />
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[#C57019] opacity-75 animate-ping"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C57019]"></span>
                        </span>
                        <span className="text-zinc-100 font-semibold uppercase tracking-wider font-sans whitespace-nowrap">{svc.name}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
