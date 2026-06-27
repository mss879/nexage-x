"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Benefits() {
  // Brand card clip-path formula (12px diagonal cuts on top-left, top-right, bottom-left; 48px cut on bottom-right)
  const cardClipPath = "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 48px), calc(100% - 48px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)";

  return (
    <section
      id="benefits"
      className="relative w-full py-24 md:py-32 bg-[#050508] text-white overflow-hidden border-b border-white/[0.04] box-border px-4 md:px-12 lg:px-24"
    >
      {/* Background Cyber Mesh Grid - Subtle overlay */}
      <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />

      {/* Main Structural Outer Wrapper */}
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Core Architectural Container wrapping the entire grid & header */}
        <div className="relative w-full">
          
          {/* 5 Vertical Lane lines dividers running top-to-bottom throughout the container */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/[0.05] pointer-events-none z-0" />
          <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-white/[0.05] pointer-events-none z-0 hidden md:block" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-white/[0.05] pointer-events-none z-0 hidden md:block" />
          <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-white/[0.05] pointer-events-none z-0 hidden md:block" />
          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/[0.05] pointer-events-none z-0" />

          {/* 1. Header Row Block (Spans 4 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 md:gap-y-0 w-full pb-8 relative z-10 px-4 md:px-0">
            
            {/* Left Block (Columns 1 & 2) */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-end md:pr-8">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4 font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-white/50">
                <span className="w-2.5 h-2.5 rounded-full bg-[#df8326] animate-pulse" />
                <span>06 // LOGISTICS</span>
              </div>
              
              {/* Title */}
              <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[85px] font-sans font-extrabold tracking-tighter uppercase leading-[0.82] text-white">
                GLOBAL <br />
                LOGISTICS <br />
                <span className="text-white/30">THAT YOU</span> <br />
                <span className="text-white/30">CAN TRUST.</span>
              </h2>
            </div>

            {/* Right Block (Columns 3 & 4) - Contains visual lanes decoration */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-between items-end md:pl-8 lg:pl-16 relative">
              {/* Abstract decorative bar stack in top right */}
              <div className="flex flex-col gap-0.5 items-end opacity-[0.25] mt-2 select-none">
                <span className="w-10 h-1 bg-white" />
                <span className="w-8 h-1 bg-white" />
                <span className="w-6 h-1 bg-white" />
                <span className="w-4 h-1 bg-white" />
              </div>
            </div>

          </div>

          {/* 2. Horizontal connector line with diamond bullet and paragraph text */}
          <div className="grid grid-cols-1 md:grid-cols-4 w-full items-start relative z-10 py-10 border-b border-white/[0.08] mb-12 px-4 md:px-0">
            {/* Left horizontal line spanning column 1 & 2 */}
            <div className="col-span-1 md:col-span-2 relative h-[1px] w-full bg-white/[0.08] self-center hidden md:block">
              {/* Diamond bullet at the intersection with the 50% vertical guide line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20">
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white/30 stroke-none">
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
              </div>
            </div>
            {/* Paragraph block spanning column 3 & 4 */}
            <div className="col-span-1 md:col-span-2 md:pl-8 lg:pl-16">
              <p className="text-white/70 text-base md:text-lg font-sans font-light leading-relaxed max-w-sm">
                Our mission is to coordinate global transport, supply chain optimization, and modern fulfillment networks to move your business forward.
              </p>
            </div>
          </div>

          {/* 3. Cards Layout Grid (4 columns, gap-x is 0 for grid guides alignment) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 md:gap-y-0 w-full relative z-10">
            
            {/* Column 1: Card 1 (Forward-Thinking Design) */}
            <div className="col-span-1 flex flex-col px-4 md:px-6 w-full">
              {/* Dark card container with custom clip-path */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full bg-[#0a0a0f] border border-white/[0.08] flex flex-col justify-between h-full min-h-[420px] shadow-[0_15px_35px_rgba(0,0,0,0.6)] overflow-hidden"
                style={{ clipPath: cardClipPath }}
              >
                {/* Header labels */}
                <div className="pt-6 px-6 pb-4">
                  <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-[#df8326] block mb-1">
                    Forward-Thinking
                  </span>
                  <h3 className="text-2xl md:text-3xl font-sans font-extrabold text-white leading-none">
                    Logistics
                  </h3>
                </div>

                {/* Team member portrait image */}
                <div className="relative w-full h-[280px] overflow-hidden mt-auto">
                  <img
                    src="/logistics-coordinator.png"
                    alt="Forward-Thinking Logistics Headshot"
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>

            {/* Column 2 & 3: Card 2 (Design that Moves Brands) */}
            <div className="col-span-1 md:col-span-2 flex flex-col px-4 md:px-8 w-full justify-between">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex flex-col w-full h-full justify-between"
              >
                {/* Header divider line */}
                <div className="border-t border-white/15 pt-3.5 pb-4 flex items-center justify-between font-mono text-xs md:text-sm w-full">
                  <span className="font-bold uppercase tracking-widest text-white">
                    Logistics that Moves Brands
                  </span>
                  
                  {/* Visual Equalizer graphic */}
                  <div className="flex items-end gap-0.5 h-3 select-none">
                    <span className="w-0.5 h-2.5 bg-white/60 animate-pulse" />
                    <span className="w-0.5 h-3 bg-white/60" />
                    <span className="w-0.5 h-1.5 bg-white/60 animate-pulse" />
                  </div>
                </div>

                {/* Subtext description */}
                <p className="text-sm md:text-base text-white/70 font-sans leading-relaxed mb-6">
                  We engineer supply chain flows that connect, optimize, and streamline global transportation.
                </p>

                {/* Glass centerpiece render card */}
                <div className="relative w-full overflow-hidden bg-[#0a0a0f] border border-white/[0.08] shadow-lg rounded-[20px] aspect-[16/10]">
                  <img
                    src="/logistics-centerpiece.png"
                    alt="Logistics that Moves Brands Cargo Carrier"
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-103"
                  />
                </div>

                {/* Bottom testimonials & partners divider strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 pt-6 border-t border-white/[0.08] w-full">
                  {/* Left side: Trust Rating Badge */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-[#df8326] font-bold tracking-wider">★★★★★ TRUST RATING</span>
                    <span className="text-sm font-sans text-white/80 font-medium">99.8% On-Time Global Fulfillment</span>
                  </div>

                  {/* Right side: Key Strengths Ticker */}
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-mono font-bold tracking-widest text-white/40 uppercase">
                    <span>SPEED</span>
                    <span className="text-[#df8326] font-normal">•</span>
                    <span>PRECISION</span>
                    <span className="text-[#df8326] font-normal">•</span>
                    <span>SECURITY</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Column 4: Card 3 (Vertical split layout) */}
            <div className="col-span-1 flex flex-col px-4 md:px-6 w-full justify-between gap-6">
              
              {/* Top Box: Ideas in Motion */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="w-full flex flex-col"
              >
                {/* Header border */}
                <div className="border-t border-white/15 pt-3.5 pb-3 flex items-center justify-between font-mono text-xs md:text-sm w-full">
                  <span className="font-bold uppercase tracking-widest text-white">
                    Fleet in Motion
                  </span>
                  {/* Circle symbol */}
                  <div className="w-2.5 h-2.5 rounded-full border border-white/40" />
                </div>
                
                {/* Text Description */}
                <p className="text-sm md:text-base text-white/70 font-sans leading-relaxed mb-4">
                  From route optimization to final mile delivery — precision that ensures prompt execution.
                </p>

                {/* Exhibition art gallery render card */}
                <div className="relative w-full overflow-hidden bg-[#0a0a0f] border border-white/[0.08] shadow-lg rounded-[16px] aspect-[4/3]">
                  <img
                    src="/logistics-network.png"
                    alt="Fleet in Motion Global Map Dashboard"
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-103"
                  />
                </div>
              </motion.div>

              {/* Bottom Box: Beyond Aesthetics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="w-full flex flex-col pt-4 border-t border-white/15"
              >
                {/* Header */}
                <div className="pb-3 flex items-center justify-between font-mono text-xs md:text-sm w-full">
                  <span className="font-bold uppercase tracking-widest text-white">
                    Beyond Freight
                  </span>
                  
                  {/* Equalizer graphic details */}
                  <div className="flex gap-0.5 items-center select-none">
                    <span className="w-1.5 h-0.5 bg-white/50" />
                    <span className="w-1.5 h-0.5 bg-white/50" />
                    <span className="w-2.5 h-0.5 bg-white/50" />
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm md:text-base text-white/70 font-sans leading-relaxed">
                  It's not just about moving cargo, but how it integrates, tracks, and scales your international business.
                </p>
              </motion.div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
