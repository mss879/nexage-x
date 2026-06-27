"use client";

import React from "react";

export default function FeatureTicker() {
  const itemsTop = [
    "Shopify Development",
    "Custom Web Apps",
    "Workflow Automation",
    "Brand Identity",
    "AI Chat Agents",
    "API Integrations",
    "UI/UX Strategy",
    "Smart Funnels",
    "Speed Optimization",
    "Custom Backends"
  ];

  const itemsBottom = [
    "E-Commerce Experts",
    "24/7 Customer Service",
    "ROI Focused",
    "Rapid Delivery",
    "Tailored Solutions",
    "Top-Rated Agency",
    "Trusted Partner",
    "Free Consultations",
    "Seamless Workflows",
    "Dedicated Developers"
  ];

  return (
    <section className="relative w-full h-[140px] md:h-[180px] bg-transparent overflow-visible flex items-center justify-center select-none z-30 pointer-events-none">
      <style>{`
        @keyframes scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        @keyframes scroll-right {
          0% { transform: translate3d(-33.33%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-scroll-left {
          animation: scroll-left 70s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 70s linear infinite;
        }
      `}</style>

      {/* Ticker 1 (Black, on top): Dark Background, White Text, rotated -4.5deg */}
      <div
        className="absolute w-[125%] h-[58px] md:h-[68px] bg-[#161618] border-y border-white/[0.08] flex items-center overflow-hidden z-20 shadow-[0_12px_35px_rgba(0,0,0,0.6)]"
        style={{ transform: "rotate(-4.5deg) translateY(2px)" }}
      >
        <div className="flex w-max items-center h-full animate-scroll-right whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-10 px-5">
              {itemsTop.map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 font-syne font-bold text-white text-base md:text-lg uppercase tracking-wider">
                  <span>{item}</span>
                  <span className="w-2 h-2 bg-[#df8326] rotate-45 shrink-0 block" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Ticker 2 (White, at the bottom): White Background, Black Text, rotated 4.5deg */}
      <div
        className="absolute w-[125%] h-[58px] md:h-[68px] bg-white flex items-center overflow-hidden z-10 shadow-[0_8px_25px_rgba(0,0,0,0.25)]"
        style={{ transform: "rotate(4.5deg) translateY(58px)" }}
      >
        <div className="flex w-max items-center h-full animate-scroll-left whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-10 px-5">
              {itemsBottom.map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 font-syne font-bold text-black text-base md:text-lg uppercase tracking-wider">
                  <span>{item}</span>
                  {/* Diamond Bullet */}
                  <span className="w-2 h-2 bg-black rotate-45 shrink-0 block" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
