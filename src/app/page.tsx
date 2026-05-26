"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/sections/Hero";
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
    <main className="relative min-h-screen w-full bg-[#050508] overflow-hidden">
      {showPreloader && (
        <Preloader 
          onActiveReveal={() => setIsPreloaded(true)}
          onComplete={() => setShowPreloader(false)} 
        />
      )}
      
      {/* Replicated High-Fidelity Hero Section */}
      <Hero startAnimation={isPreloaded} />
    </main>
  );
}
