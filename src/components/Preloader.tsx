"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onActiveReveal: () => void;
  onComplete: () => void;
}

export default function Preloader({ onActiveReveal, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const flashRef = useRef<HTMLDivElement>(null);

  const WORD = "NEXAGE X";
  // Optimized from 12 to 8. We use ambient occlusion shading to maintain the illusion of thick depth.
  const NUM_SLICES = 8; 

  useEffect(() => {
    if (!containerRef.current || !cameraRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // 1. Initial State - Classy, elegant starting angle
    gsap.set(sceneRef.current, { perspective: 1200 });
    gsap.set(cameraRef.current, { transformStyle: "preserve-3d", z: -400 });
    gsap.set(wordRef.current, { 
      transformStyle: "preserve-3d", 
      rotationX: 35, 
      rotationY: -25,
      rotationZ: 5
    });

    // Apply volumetric shading (ambient occlusion)
    slicesRef.current.forEach((slice, i) => {
      if (!slice) return;
      const sliceIndex = i % NUM_SLICES; 
      
      gsap.set(slice, {
        z: sliceIndex * 6, // 6px gap, wider spread for 8 slices = 48px depth
        opacity: 0,
        force3D: true, // Hardware acceleration
      });
    });

    // Elegant Fade In
    tl.to(slicesRef.current, {
      opacity: (i) => {
        const sliceIndex = i % NUM_SLICES;
        const isFront = sliceIndex === NUM_SLICES - 1;
        // Front face is solid, back faces fade out organically to create realistic shadow/depth
        return isFront ? 1 : 0.1 + ((sliceIndex / NUM_SLICES) * 0.7); 
      },
      duration: 1.2,
      ease: "power2.out"
    }, 0);

    // 2. Slow Luxury Pan (0s to 4.5s)
    tl.to(wordRef.current, {
      rotationX: 10,
      rotationY: 15,
      rotationZ: 0,
      duration: 4.5,
      ease: "power1.inOut",
      force3D: true
    }, 0);

    tl.to(cameraRef.current, {
      z: 150,
      duration: 4.5,
      ease: "power1.inOut",
      force3D: true
    }, 0);

    // 3. The Extended Zero-G Deconstruction (Starts at 1.4s)
    // We make this much longer (3.5s) to create a beautiful bullet-time suspension effect
    tl.to(slicesRef.current, {
      z: (i) => {
        const sliceIndex = i % NUM_SLICES;
        return (sliceIndex - (NUM_SLICES/2)) * 200; // push them further apart
      },
      x: (i) => (Math.random() - 0.5) * 500,
      y: (i) => (Math.random() - 0.5) * 500,
      rotationX: () => (Math.random() - 0.5) * 120,
      rotationY: () => (Math.random() - 0.5) * 120,
      duration: 3.5, // Massively extended
      ease: "power2.out", // smooth deceleration, hanging in the air
      force3D: true,
    }, 1.4);

    // Fade the pieces out slowly only near the very end of their drift
    tl.to(slicesRef.current, {
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut"
    }, 3.0);

    // Subtle optical flash to hide the exact moment of Hero rendering
    tl.to(flashRef.current, {
      opacity: 0.15,
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    }, 2.5);

    // 4. Trigger Hero Reveal seamlessly while the pieces are still floating
    tl.add(() => {
      onActiveReveal();
    }, 3.2);

    // 5. Fade out background gracefully
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut"
    }, 3.8);

  }, [onActiveReveal, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#e5e7eb_100%)] flex items-center justify-center overflow-hidden pointer-events-none"
    >
      <div 
        ref={sceneRef} 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        {/* Subtle cinematic glow */}
        <div 
          ref={flashRef} 
          className="absolute inset-0 bg-[#C57019] opacity-0 mix-blend-screen pointer-events-none" 
        />

        {/* The Camera / Viewport */}
        <div ref={cameraRef} className="relative flex items-center justify-center will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          
          {/* The Extruded Word Wrapper */}
          <div ref={wordRef} className="relative flex gap-[2vw] will-change-transform" style={{ transformStyle: "preserve-3d" }}>
            
            {WORD.split("").map((letter, letterIdx) => (
              <div 
                key={`letter-${letterIdx}`} 
                className="relative flex items-center justify-center font-syne"
                style={{ 
                  transformStyle: "preserve-3d",
                  width: '9vw',
                  height: '14vw'
                }}
              >
                {/* Maintain empty space for " " character */}
                {letter !== " " && Array.from({ length: NUM_SLICES }).map((_, sliceIdx) => {
                  const globalIdx = letterIdx * NUM_SLICES + sliceIdx;
                  const isFrontFace = sliceIdx === NUM_SLICES - 1;
                  
                  return (
                    <span
                      key={`slice-${globalIdx}`}
                      ref={el => { slicesRef.current[globalIdx] = el; }}
                      className="absolute flex items-center justify-center font-bold leading-none will-change-[transform,opacity]"
                      style={{
                        fontSize: '12vw',
                        // Inverted shading for light background: Front is dark/slate, core is deep amber/gold
                        color: isFrontFace ? '#1a1a1a' : 'transparent',
                        WebkitTextStroke: isFrontFace ? 'none' : '1.5px #C57019',
                        textShadow: isFrontFace ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                        backgroundImage: isFrontFace ? 'linear-gradient(135deg, #27272a 0%, #000000 100%)' : 'none',
                        WebkitBackgroundClip: isFrontFace ? 'text' : 'border-box',
                        WebkitTextFillColor: isFrontFace ? 'transparent' : 'inherit',
                      }}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            ))}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
