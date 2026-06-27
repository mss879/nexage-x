"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import Services from "@/components/sections/Services";
import WhyChooseMe from "@/components/sections/WhyChooseMe";
import FeatureTicker from "@/components/sections/FeatureTicker";
import Projects from "@/components/sections/Projects";
import Methodology from "@/components/sections/Methodology";
import Benefits from "@/components/sections/Benefits";
import Values from "@/components/sections/Values";
import Footer from "@/components/Footer";

// Load Preloader dynamically to prevent SSR/hydration mismatch with Three.js canvas
const Preloader = dynamic(() => import("@/components/Preloader"), {
  ssr: false,
});

export default function Home() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  // Fallback timeout in case animation fails
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloaded(true);
      setShowPreloader(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  // Stable callback references to prevent Preloader GSAP re-triggering cleanup/re-init
  const handleActiveReveal = useCallback(() => {
    setIsPreloaded(true);
  }, []);

  const handleComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-[#050508] overflow-x-hidden">
      {/* Preloader — always mounted on client, hidden via CSS to prevent DOM removal race conditions */}
      <div
        className={`${showPreloader ? '' : 'pointer-events-none invisible'}`}
        style={{ opacity: showPreloader ? 1 : 0, transition: 'opacity 0.1s ease-out' }}
      >
        <Preloader 
          onActiveReveal={handleActiveReveal}
          onComplete={handleComplete} 
        />
      </div>
      
      {/* Fixed Hero Section Wrapper */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <Hero startAnimation={isPreloaded} />
      </div>
      
      {/* Scroll Stack Overlay Container (Starts 100vh down, covers fixed Hero on scroll) */}
      <div className="relative z-10 w-full bg-[#F5F5F7] shadow-[0_-30px_60px_rgba(0,0,0,0.18)] mt-[100vh] rounded-t-[32px] md:rounded-t-[48px] lg:rounded-t-[56px] overflow-hidden">
        {/* Section 2: About Us */}
        <AboutUs />
        
        {/* Section 3: Why Choose Me */}
        <WhyChooseMe />

        {/* Dynamic crossing ticker section */}
        <FeatureTicker />

        {/* Section 4: Services (What We Do) */}
        <Services />

        {/* Section: Projects (Recent Work Showcase) */}
        <Projects />

        {/* Section 5: Methodology (How We Work) */}
        <Methodology />

        {/* Section 6: Benefits (Creative Partners Who You Can Trust) */}
        <Benefits />

        {/* Section 7: Our Values */}
        <Values />

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
