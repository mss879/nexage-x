"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import lottie from "lottie-web";

export default function Values() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for the Lottie containers
  const circleRef1 = useRef<HTMLDivElement>(null);
  const iconRef1 = useRef<HTMLDivElement>(null);
  
  const circleRef2 = useRef<HTMLDivElement>(null);
  const iconRef2 = useRef<HTMLDivElement>(null);
  
  const circleRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    let animations: any[] = [];

    // --- Item 1: Quality ---
    if (circleRef1.current && iconRef1.current) {
      // Circle Lottie (Scrubbed with Scroll)
      const circleAnim = lottie.loadAnimation({
        container: circleRef1.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/lottie/circle.json",
      });
      animations.push(circleAnim);

      circleAnim.addEventListener("DOMLoaded", () => {
        gsap.to({ frame: 0 }, {
          frame: circleAnim.totalFrames - 1,
          ease: "none",
          scrollTrigger: {
            trigger: circleRef1.current,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 1.5,
          },
          onUpdate: function () {
            const currentFrame = Math.round(this.targets()[0].frame);
            circleAnim.goToAndStop(currentFrame, true);
          },
        });
      });

      // Icon Lottie (Autoplay when visible)
      const iconAnim = lottie.loadAnimation({
        container: iconRef1.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: "/lottie/quality.json",
      });
      animations.push(iconAnim);

      iconAnim.addEventListener("DOMLoaded", () => {
        ScrollTrigger.create({
          trigger: iconRef1.current,
          start: "top 85%",
          onEnter: () => iconAnim.play(),
          onLeave: () => iconAnim.pause(),
          onEnterBack: () => iconAnim.play(),
          onLeaveBack: () => iconAnim.pause(),
        });
      });
    }

    // --- Item 2: Creativity ---
    if (circleRef2.current && iconRef2.current) {
      // Circle Lottie (Scrubbed with Scroll)
      const circleAnim = lottie.loadAnimation({
        container: circleRef2.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/lottie/circle.json",
      });
      animations.push(circleAnim);

      circleAnim.addEventListener("DOMLoaded", () => {
        gsap.to({ frame: 0 }, {
          frame: circleAnim.totalFrames - 1,
          ease: "none",
          scrollTrigger: {
            trigger: circleRef2.current,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 1.5,
          },
          onUpdate: function () {
            const currentFrame = Math.round(this.targets()[0].frame);
            circleAnim.goToAndStop(currentFrame, true);
          },
        });
      });

      // Icon Lottie (Autoplay when visible)
      const iconAnim = lottie.loadAnimation({
        container: iconRef2.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: "/lottie/creativity.json",
      });
      animations.push(iconAnim);

      iconAnim.addEventListener("DOMLoaded", () => {
        ScrollTrigger.create({
          trigger: iconRef2.current,
          start: "top 85%",
          onEnter: () => iconAnim.play(),
          onLeave: () => iconAnim.pause(),
          onEnterBack: () => iconAnim.play(),
          onLeaveBack: () => iconAnim.pause(),
        });
      });
    }

    // --- Item 3: Growth ---
    if (circleRef3.current) {
      // Circle Lottie (Scrubbed with Scroll)
      const circleAnim = lottie.loadAnimation({
        container: circleRef3.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "/lottie/circle.json",
      });
      animations.push(circleAnim);

      circleAnim.addEventListener("DOMLoaded", () => {
        gsap.to({ frame: 0 }, {
          frame: circleAnim.totalFrames - 1,
          ease: "none",
          scrollTrigger: {
            trigger: circleRef3.current,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 1.5,
          },
          onUpdate: function () {
            const currentFrame = Math.round(this.targets()[0].frame);
            circleAnim.goToAndStop(currentFrame, true);
          },
        });
      });
    }

    // --- Staggered Entrance Animation of Value Items ---
    gsap.fromTo(".value-item-wrapper",
      { 
        opacity: 0, 
        y: 150 
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#values",
          start: "top 85%",
          end: "bottom -20%",
          scrub: 2.0,
        }
      }
    );

    // Cleanup on unmount
    return () => {
      animations.forEach((anim) => anim.destroy());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="values"
      ref={containerRef}
      className="relative w-full py-24 md:py-32 bg-[#050508] text-white overflow-hidden border-b border-white/[0.04] box-border px-4 md:px-12 lg:px-24"
    >
      {/* Background Cyber Mesh Grid - Subtle overlay */}
      <div className="absolute inset-0 cyber-grid opacity-[0.015] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto relative z-10 w-full flex flex-col gap-20">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <span className="text-sm font-sans tracking-[0.2em] text-white/50 uppercase">
            Our Values
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-sans font-extrabold tracking-tight uppercase text-white mt-1">
            Our Key Priorities
          </h2>
        </div>

        {/* Values Row Container with Left Vertical Line */}
        <div className="relative w-full mt-4 flex items-center justify-center">
          
          {/* Vertical highlight line on the left */}
          <div className="absolute left-0 md:left-6 lg:left-12 top-0 bottom-0 w-[1px] bg-white/20 hidden md:block" />

          {/* Grid containing the circular elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full max-w-4xl pl-0 md:pl-20 py-8 values-row">
            
            {/* Item 1: Quality */}
            <div className="value-item-wrapper flex flex-col items-center gap-6 opacity-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Lottie circle drawing outline */}
                <div ref={circleRef1} className="absolute inset-0 w-full h-full z-0 opacity-80" />
                {/* Lottie icon inside circle */}
                <div ref={iconRef1} className="w-12 h-12 relative z-10 opacity-90" />
              </div>
              <h3 className="text-xl font-sans font-bold text-white tracking-wide">
                Quality
              </h3>
            </div>

            {/* Item 2: Creativity */}
            <div className="value-item-wrapper flex flex-col items-center gap-6 opacity-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Lottie circle drawing outline */}
                <div ref={circleRef2} className="absolute inset-0 w-full h-full z-0 opacity-80" />
                {/* Lottie icon inside circle */}
                <div ref={iconRef2} className="w-12 h-12 relative z-10 opacity-90" />
              </div>
              <h3 className="text-xl font-sans font-bold text-white tracking-wide">
                Creativity
              </h3>
            </div>

            {/* Item 3: Growth */}
            <div className="value-item-wrapper flex flex-col items-center gap-6 opacity-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Lottie circle drawing outline */}
                <div ref={circleRef3} className="absolute inset-0 w-full h-full z-0 opacity-80" />
                {/* Sprout SVG icon inside circle */}
                <div className="w-12 h-12 relative z-10 opacity-90 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-10 h-10 text-white/90"
                  >
                    {/* Stem */}
                    <path d="M12 22V10" />
                    {/* Left Leaf */}
                    <path d="M12 14C12 14 8 12 8 8C8 8 12 7 12 10" />
                    {/* Right Leaf */}
                    <path d="M12 10C12 10 16 8 16 4C16 4 12 3 12 6" />
                    {/* Base dirt or hand indicator line */}
                    <path d="M9 20c1.5.5 4.5.5 6 0" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-sans font-bold text-white tracking-wide">
                Growth
              </h3>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
