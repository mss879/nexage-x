"use client";

import React, { useState, useEffect, useCallback } from "react";
import Hero from "@/components/sections/Hero";
// Imported statically and server-rendered: the preloader is a few KB of raw
// WebGL, so it ships in the page bundle and starts on the first effect after
// hydration instead of waiting for a second, lazily-requested chunk.
import Preloader from "@/components/Preloader";

export default function HeroWithPreloader() {
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
    <>
      {/* SSR-painted shield: covers the server-rendered hero from the very first
          paint and unmounts when the preloader reveals (onActiveReveal or the
          fallback timer). Both it and the server-rendered preloader are hidden
          for no-JS visitors so the page never stays black without JavaScript. */}
      {!isPreloaded && (
        <>
          <div
            id="preloader-shield"
            className="fixed inset-0 z-[99] bg-[#050508] pointer-events-none"
          />
          <noscript>
            <style>{`#preloader-shield,#preloader-root{display:none}`}</style>
          </noscript>
        </>
      )}

      {/* Preloader — always mounted on client, hidden via CSS to prevent DOM removal race conditions */}
      <div
        className={`${showPreloader ? "" : "pointer-events-none invisible"}`}
        style={{ opacity: showPreloader ? 1 : 0, transition: "opacity 0.1s ease-out" }}
      >
        <Preloader onActiveReveal={handleActiveReveal} onComplete={handleComplete} />
      </div>

      {/* Fixed Hero Section Wrapper */}
      <div className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <Hero startAnimation={isPreloaded} />
      </div>
    </>
  );
}
