"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import WhyChooseMe from "@/components/sections/WhyChooseMe";
import Preloader from "@/components/Preloader";

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

  return (
    <main className="relative min-h-screen w-full bg-[#050508] overflow-x-hidden">
      {showPreloader && (
        <Preloader 
          onActiveReveal={() => setIsPreloaded(true)}
          onComplete={() => setShowPreloader(false)} 
        />
      )}
      
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
      </div>
    </main>
  );
}
