"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on fine pointer devices (desktops/laptops with mouse/trackpad)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);
    document.body.classList.add("custom-cursor-active");

    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;

    if (!cursorDot || !cursorRing) return;

    // Quicksetters for extreme performance (reduces React re-renders)
    const setDotX = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power3.out" });
    const setDotY = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power3.out" });
    
    const setRingX = gsap.quickTo(cursorRing, "x", { duration: 0.35, ease: "power3.out" });
    const setRingY = gsap.quickTo(cursorRing, "y", { duration: 0.35, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half the width of elements to center them on the cursor
      setDotX(e.clientX - 4);
      setDotY(e.clientY - 4);
      
      setRingX(e.clientX - 20);
      setRingY(e.clientY - 20);
    };

    const handleMouseDown = () => {
      gsap.to(cursorDot, { scale: 1.5, duration: 0.15 });
      gsap.to(cursorRing, { 
        scale: 0.8, 
        borderColor: "var(--color-neon-pink)",
        borderWidth: "3px", 
        boxShadow: "0 0 15px rgba(244, 114, 182, 0.6)",
        duration: 0.15 
      });
    };

    const handleMouseUp = () => {
      gsap.to(cursorDot, { scale: 1, duration: 0.15 });
      gsap.to(cursorRing, { 
        scale: 1, 
        borderColor: "var(--color-neon-cyan)",
        borderWidth: "1.5px", 
        boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)",
        duration: 0.15 
      });
    };

    // Expand cursor when hovering over interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer");

      if (isInteractive) {
        gsap.to(cursorDot, { 
          scale: 0.5, 
          backgroundColor: "var(--color-neon-pink)",
          duration: 0.2 
        });
        gsap.to(cursorRing, { 
          scale: 1.5, 
          backgroundColor: "rgba(34, 211, 238, 0.05)",
          borderColor: "var(--color-neon-purple)",
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
          borderWidth: "1px",
          duration: 0.2 
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "A" || 
        target.tagName === "BUTTON" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer");

      if (isInteractive) {
        gsap.to(cursorDot, { 
          scale: 1, 
          backgroundColor: "var(--color-neon-cyan)",
          duration: 0.2 
        });
        gsap.to(cursorRing, { 
          scale: 1, 
          backgroundColor: "transparent",
          borderColor: "var(--color-neon-cyan)",
          boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)",
          borderWidth: "1.5px",
          duration: 0.2 
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Dot pointer */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          backgroundColor: "var(--color-neon-cyan)",
          boxShadow: "0 0 10px var(--color-neon-cyan)",
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />
      {/* Outer Ring trail */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-50 border border-[var(--color-neon-cyan)] mix-blend-screen"
        style={{
          boxShadow: "0 0 10px rgba(34, 211, 238, 0.3)",
          transform: "translate3d(-100px, -100px, 0)",
          transition: "border-color 0.2s ease, border-width 0.2s ease, background-color 0.2s ease",
        }}
      />
    </>
  );
}
