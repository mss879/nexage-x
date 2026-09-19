"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HOME_AUTOMATION_SERVICES, HOME_ECOMMERCE_SERVICES, type HomeService } from "@/content/services";

interface ServiceItem {
  id: string;
  num: string;
  title: string;
  description: string;
  includes?: string;
  deliverable: string;
  keywords: string[];
  icon: React.ReactNode;
}

// Premium 3D Volumetric Cyber-Cube Matrix (Interactive Spatial Assembly)
interface Cube3DProps {
  x: number;
  y: number;
  z: number;
  type: "glow" | "dark";
}

function Cube3D({ x, y, z, type }: Cube3DProps) {
  const isGlow = type === "glow";
  const size = 32; // Made a bit smaller (32px instead of 40px)
  const halfSize = size / 2;

  // Face CSS 3D Transform styles
  const faces = [
    { name: "front", transform: `translate3d(0, 0, ${halfSize}px)` },
    { name: "back", transform: `rotateY(180deg) translate3d(0, 0, ${halfSize}px)` },
    { name: "left", transform: `rotateY(-90deg) translate3d(0, 0, ${halfSize}px)` },
    { name: "right", transform: `rotateY(90deg) translate3d(0, 0, ${halfSize}px)` },
    { name: "top", transform: `rotateX(90deg) translate3d(0, 0, ${halfSize}px)` },
    { name: "bottom", transform: `rotateX(-90deg) translate3d(0, 0, ${halfSize}px)` },
  ];

  // Identical high-performance clean visual style as top Rubik's Cube, but in white theme
  const faceStyleClass = isGlow
    ? "bg-gradient-to-br from-[#ffd8b3] via-[#df8326] to-[#994d00] border border-[#ffb266] shadow-[0_0_25px_rgba(223,131,38,0.9)]"
    : "bg-gradient-to-br from-[#FFFFFF] via-[#F8F9FA] to-[#E9ECEF] border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,1.0),_0_2px_4px_rgba(0,0,0,0.05)]";

  return (
    <div
      className={`absolute cube-3d cube-x-${x} cube-y-${y} cube-z-${z} ${isGlow ? "cube-glow" : "cube-dark"}`}
      style={{
        transform: `translate3d(
          calc(${x} * (34px + var(--hover-offset, 0) * 1px)),
          calc(${y} * (34px + var(--hover-offset, 0) * 1px)),
          calc(${z} * (34px + var(--hover-offset, 0) * 1px))
        )`,
        transformStyle: "preserve-3d",
        width: `${size}px`,
        height: `${size}px`,
        left: `calc(50% - ${halfSize}px)`,
        top: `calc(50% - ${halfSize}px)`,
      }}
    >
      {faces.map((face) => (
        <div
          key={face.name}
          className={`absolute inset-0 backface-hidden ${faceStyleClass}`}
          style={{
            transform: face.transform,
            backfaceVisibility: "hidden",
            width: "100%",
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

interface CubeData {
  id: number;
  x: number;
  y: number;
  z: number;
  type: "glow" | "dark";
}

// Generate the initial 27 cubes of the 3x3x3 grid (from -1 to 1)
const initialCubes: CubeData[] = [];
let cubeId = 0;
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      const isCore = x === 0 && y === 0 && z === 0;
      initialCubes.push({
        id: cubeId++,
        x,
        y,
        z,
        type: isCore ? "glow" : "dark",
      });
    }
  }
}

// Generate coordinate projections for rotating slices
const moves = [
  { axis: "x" as const, slice: 1, angle: 90 },
  { axis: "y" as const, slice: -1, angle: 90 },
  { axis: "z" as const, slice: 1, angle: 90 },
  { axis: "x" as const, slice: -1, angle: -90 },
  { axis: "y" as const, slice: 1, angle: -90 },
  { axis: "z" as const, slice: -1, angle: 90 },

  // Inverse sequence in reverse order to return to perfect shape
  { axis: "z" as const, slice: -1, angle: -90 },
  { axis: "y" as const, slice: 1, angle: 90 },
  { axis: "x" as const, slice: -1, angle: 90 },
  { axis: "z" as const, slice: 1, angle: -90 },
  { axis: "y" as const, slice: -1, angle: -90 },
  { axis: "x" as const, slice: 1, angle: -90 },
];

function getNewCoordinates(
  x: number,
  y: number,
  z: number,
  axis: "x" | "y" | "z",
  angle: number
): { x: number; y: number; z: number } {
  const is90 = angle === 90 || angle === -270;

  if (axis === "x") {
    return is90 ? { x, y: -z, z: y } : { x, y: z, z: -y };
  }
  if (axis === "y") {
    return is90 ? { x: z, y, z: -x } : { x: -z, y, z: x };
  }
  if (axis === "z") {
    return is90 ? { x: -y, y: x, z } : { x: y, y: -x, z };
  }
  return { x, y, z };
}

function VolumetricCyberCubeMatrix() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const rotateRef = React.useRef<HTMLDivElement>(null);
  const sliceRef = React.useRef<HTMLDivElement>(null);
  const breathTweenRef = React.useRef<gsap.core.Tween | null>(null);

  const [cubes, setCubes] = React.useState<CubeData[]>(initialCubes);
  const [moveIndex, setMoveIndex] = React.useState(0);
  const [activeMove, setActiveMove] = React.useState<{
    axis: "x" | "y" | "z";
    slice: number;
    angle: number;
  } | null>(null);

  // 1. Initial Scale Pop-In & Heartbeat Core Pulsing
  useGSAP(() => {
    if (!containerRef.current) return;

    // Pop-in reveal scale animations
    gsap.fromTo(
      ".cube-3d",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.02,
          from: "center",
        },
      }
    );

    // Pulse core
    gsap.to(".cube-glow", {
      scale: 1.1,
      duration: 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      transformOrigin: "50% 50%",
    });
  }, { scope: containerRef });

  // 2. Controller to cycle through moves when activeMove is completed
  React.useEffect(() => {
    if (activeMove !== null) return;

    const timer = setTimeout(() => {
      const move = moves[moveIndex];
      setActiveMove({
        axis: move.axis,
        slice: move.slice,
        angle: move.angle,
      });
    }, moveIndex === 0 ? 1500 : 400);

    return () => clearTimeout(timer);
  }, [moveIndex, activeMove]);

  // 3. GSAP Timeline executing active slice rotation on direct DOM node (Zero React renders during animation!)
  useGSAP(() => {
    if (!activeMove || !sliceRef.current) return;

    const targetRotation = activeMove.angle;
    const prop = activeMove.axis === "x" ? "rotateX" : activeMove.axis === "y" ? "rotateY" : "rotateZ";

    gsap.fromTo(
      sliceRef.current,
      { [prop]: 0 },
      {
        [prop]: targetRotation,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          // Project the new coordinate states
          setCubes((prevCubes) =>
            prevCubes.map((cube) => {
              const inSlice =
                (activeMove.axis === "x" && cube.x === activeMove.slice) ||
                (activeMove.axis === "y" && cube.y === activeMove.slice) ||
                (activeMove.axis === "z" && cube.z === activeMove.slice);

              if (inSlice) {
                const nextCoords = getNewCoordinates(
                  cube.x,
                  cube.y,
                  cube.z,
                  activeMove.axis,
                  activeMove.angle
                );
                return {
                  ...cube,
                  ...nextCoords,
                };
              }
              return cube;
            })
          );

          // Clear active move and increment index
          setActiveMove(null);
          setMoveIndex((prev) => (prev + 1) % moves.length);
        },
      }
    );
  }, [activeMove]);

  // 4. Auto-Breathing CAD Explode Timeline & Majestic Gyroscopic Spin
  useGSAP(() => {
    const el = containerRef.current;
    if (!el || !rotateRef.current) return;

    // Set initial custom property on the element
    gsap.set(el, { "--hover-offset": 0 });

    // Slow majestic auto-breath cycle (explodes and contracts slowly)
    breathTweenRef.current = gsap.fromTo(
      el,
      { "--hover-offset": 0 },
      {
        "--hover-offset": 8,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      }
    );

    // continuous majestic precessing auto-rotation of the grid
    gsap.to(rotateRef.current, {
      rotateY: 360,
      duration: 22,
      ease: "none",
      repeat: -1,
    });

    gsap.to(rotateRef.current, {
      rotateX: 20,
      duration: 8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      if (breathTweenRef.current) {
        breathTweenRef.current.kill();
      }
    };
  }, { scope: containerRef });

  // 5. Eased Camera Tilt Parallax & Proximity Explode
  useGSAP(() => {
    const el = containerRef.current;
    if (!el || !parallaxRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Eased camera tilt parallax (tilts parent container conflict-free)
      gsap.to(parallaxRef.current, {
        rotateX: -dy * 0.12,
        rotateY: dx * 0.12,
        duration: 0.6,
        ease: "power2.out",
      });

      // Proximity-based explosion (up to 20px offset, matching top cube)
      const maxDist = Math.min(rect.width, rect.height) / 1.2;
      const proximityPct = Math.max(0, Math.min(1, 1 - dist / maxDist));
      const targetOffset = proximityPct * 20;

      if (breathTweenRef.current) {
        breathTweenRef.current.pause();
      }

      gsap.to(el, {
        "--hover-offset": targetOffset,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      // Return space to rest tilt smoothly
      gsap.to(parallaxRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 1.0,
        ease: "power3.out",
      });

      // Contract plates back to resting breath offset and resume breathing
      gsap.to(el, {
        "--hover-offset": 0,
        duration: 1.0,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => {
          if (breathTweenRef.current) {
            breathTweenRef.current.play();
          }
        },
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none overflow-visible group cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      {/* Technical outer orbits */}
      <div
        className="absolute border border-dashed border-white/5 rounded-full animate-[spin_35s_linear_infinite]"
        style={{
          width: "250px",
          height: "250px",
          transform: "rotateX(75deg) rotateY(15deg) translateZ(-10px)",
        }}
      />
      <div
        className="absolute border border-dashed border-[#df8326]/10 rounded-full animate-[spin_20s_linear_infinite_reverse]"
        style={{
          width: "210px",
          height: "210px",
          transform: "rotateX(-45deg) rotateY(-45deg) translateZ(10px)",
        }}
      />

      {/* Parallax Rig (camera tilt) */}
      <div
        ref={parallaxRef}
        className="w-[200px] h-[200px] relative transform-style-3d"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Rotation Rig (gyroscopic spin) */}
        <div
          ref={rotateRef}
          className="absolute inset-0 transform-style-3d"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Pulsing Core LED Glow */}
          <div
            className="absolute w-[100px] h-[100px] rounded-full bg-gradient-to-r from-[#df8326]/30 to-[#e53b17]/15 blur-[25px] pointer-events-none"
            style={{
              left: "calc(50% - 50px)",
              top: "calc(50% - 50px)",
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
            }}
          />

          {/* 1. Rotating active slice wrapper (runs 100% on GPU) */}
          {activeMove && (
            <div
              ref={sliceRef}
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {cubes
                .filter((c) => {
                  if (activeMove.axis === "x") return c.x === activeMove.slice;
                  if (activeMove.axis === "y") return c.y === activeMove.slice;
                  if (activeMove.axis === "z") return c.z === activeMove.slice;
                  return false;
                })
                .map((cube) => (
                  <Cube3D
                    key={cube.id}
                    x={cube.x}
                    y={cube.y}
                    z={cube.z}
                    type={cube.type}
                  />
                ))}
            </div>
          )}

          {/* 2. Static grid cubes (the rest of the cube that stays still) */}
          {cubes
            .filter((c) => {
              if (!activeMove) return true;
              if (activeMove.axis === "x") return c.x !== activeMove.slice;
              if (activeMove.axis === "y") return c.y !== activeMove.slice;
              if (activeMove.axis === "z") return c.z !== activeMove.slice;
              return true;
            })
            .map((cube) => (
              <Cube3D
                key={cube.id}
                x={cube.x}
                y={cube.y}
                z={cube.z}
                type={cube.type}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

// Icons stay with the component; the service copy itself lives in
// content/services.ts so the page and the AI assistant read the same source.
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "brand-setup": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        </svg>
  ),
  "store-dev": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
  ),
  "retention-loyalty": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
  ),
  "perf-marketing": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
  ),
  "ops-automation": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
  ),
  "marketplace-exp": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
  ),
  "fulfillment-mgmt": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M2 9l7-7h6l7 7v6l-7 7H9l-7-7V9z" />
        </svg>
  ),
  "workflow-automation": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        </svg>
  ),
  "content-automation": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
  ),
  "ai-assistants": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
  ),
  "consulting-audits": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
  ),
  "smart-websites": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
  ),
  "smart-campaigns": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
  ),
  "web-apps": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M2 9l7-7h6l7 7v6l-7 7H9l-7-7V9z" />
        </svg>
  ),
  "smart-funnels": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5" />
        </svg>
  ),
  "custom-backend": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="8" y="8" width="8" height="8" />
        </svg>
  ),
  "brand-kits": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 21L21 3" />
        </svg>
  ),
  "chat-voice-agents": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
          <path d="M12 7v10M7 12h10" />
        </svg>
  ),
  "odoo-zoho-integration": (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M4 7h16M4 7l2 13h12l2-13M9 11v5M15 11v5" />
          <circle cx="12" cy="4" r="1.6" />
        </svg>
  ),
};

const withIcon = (service: HomeService): ServiceItem => ({ ...service, icon: SERVICE_ICONS[service.id] });

export default function Services() {
  // Rendered on the server like every other section: the service copy is the
  // most keyword-rich content on the homepage, so it must be in the HTML.
  const [activeTab, setActiveTab] = useState<"ecommerce" | "automation">("ecommerce");
  const [expandedId, setExpandedId] = useState<string | null>(null); // Collapsed by default

  const ecommerceServices: ServiceItem[] = HOME_ECOMMERCE_SERVICES.map(withIcon);

  const automationServices: ServiceItem[] = HOME_AUTOMATION_SERVICES.map(withIcon);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleTabChange = (tab: "ecommerce" | "automation") => {
    setActiveTab(tab);
    setExpandedId(null); // Keep all collapsed by default on tab switch
  };

  const currentServices = activeTab === "ecommerce" ? ecommerceServices : automationServices;

  return (
    <section
      id="what-we-do"
      className="relative w-full pt-24 pb-16 md:pt-32 md:pb-20 bg-[#121212] grain-texture text-white px-4 md:px-12 lg:px-24 border-b border-white/[0.04] overflow-hidden mt-[-15px] md:mt-[-25px]"
    >
      {/* Subtle background guide layers */}
      <div className="absolute inset-0 cyber-grid opacity-[0.02] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#df8326]/5 blur-[150px] pointer-events-none -z-10" />

      {/* Side boundary guide lines */}
      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] bg-white/[0.03] pointer-events-none z-0" />
      <div className="absolute top-0 bottom-0 right-6 md:right-12 lg:right-24 w-[1px] bg-white/[0.03] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-0 px-2 relative z-10">

          {/* Column 1: Badge + Heading */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            {/* Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#21242B] border border-white/5 shadow-md"
            >
              <div className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
              <span className="text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-[#CCCCCC]">
                what we do
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[1.8rem] sm:text-[2.4rem] md:text-[3rem] font-michroma font-normal tracking-tight uppercase leading-[1.2] mt-2 select-none"
            >
              Design <br />
              Services That <br />
              <span className="text-[#9E9E9E]">Drive Results.</span>
            </motion.h2>
          </div>

          {/* Column 2: Description (aligned next to the heading) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 flex items-center justify-start lg:justify-end lg:pt-20"
          >
            <p className="text-[#9E9E9E] text-base md:text-[17px] font-sans font-light leading-relaxed max-w-sm text-left lg:text-left select-none">
              From strategy to visuals — we craft designs that elevate brands, connect with users, and deliver measurable impact.
            </p>
          </motion.div>
        </div>

        {/* Tab System Selector Capsule */}
        <div className="w-full flex justify-center mb-20 relative z-10 px-2 mt-12 sm:mt-16 lg:mt-20">
          <div className="bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-[#14171D]/90 backdrop-blur-xl border border-white/[0.12] p-1.5 rounded-2xl inline-flex relative shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.25),_inset_0_-1.5px_2px_rgba(0,0,0,0.6),_0_12px_36px_rgba(0,0,0,0.45),_0_2px_4px_rgba(0,0,0,0.2)] select-none">
            {/* E-Commerce Tab Button */}
            <button
              onClick={() => handleTabChange("ecommerce")}
              className={`relative px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-mono font-bold tracking-wide sm:tracking-wider uppercase whitespace-nowrap transition-colors duration-300 z-10 cursor-pointer ${activeTab ==="ecommerce" ? "text-white" : "text-white/40 hover:text-white"
                }`}
            >
              {activeTab === "ecommerce" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-b from-[#e58f37] to-[#b7610c] rounded-xl -z-10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),_0_4px_12px_rgba(223,131,38,0.45),_0_2px_4px_rgba(0,0,0,0.3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              E-Commerce Growth
            </button>

            {/* Business Automation Tab Button */}
            <button
              onClick={() => handleTabChange("automation")}
              className={`relative px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-mono font-bold tracking-wide sm:tracking-wider uppercase whitespace-nowrap transition-colors duration-300 z-10 cursor-pointer ${activeTab ==="automation" ? "text-white" : "text-white/40 hover:text-white"
                }`}
            >
              {activeTab === "automation" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-b from-[#e58f37] to-[#b7610c] rounded-xl -z-10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),_0_4px_12px_rgba(223,131,38,0.45),_0_2px_4px_rgba(0,0,0,0.3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              Business Automation
            </button>
          </div>
        </div>

        {/* Services Card List Stack with AnimatePresence for Tab Switching */}
        <motion.div
          layout="position"
          className="flex flex-col gap-4"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              {currentServices.map((svc, idx) => {
                const isExpanded = expandedId === svc.id;

                // Responsive geometric polygon cuts, mirrored left and right:
                // stepped top shoulder + chamfered corners on both sides
                // (the shoulder width shrinks on mobile via the CSS vars below)
                const clipPathStyle = `polygon(
                  0px 32px,
                  16px 16px,
                  var(--shoulder-end, 130px) 16px,
                  var(--shoulder-step, 146px) 0px,
                  calc(100% - var(--shoulder-step, 146px)) 0px,
                  calc(100% - var(--shoulder-end, 130px)) 16px,
                  calc(100% - 16px) 16px,
                  100% 32px,
                  100% calc(100% - 16px),
                  calc(100% - 16px) 100%,
                  16px 100%,
                  0px calc(100% - 16px)
                )`;

                return (
                  <motion.div
                    key={svc.id}
                    layout="position"
                    onClick={() => handleToggle(svc.id)}
                    className="w-full relative cursor-pointer select-none group [--shoulder-end:92px] [--shoulder-step:104px] sm:[--shoulder-end:130px] sm:[--shoulder-step:146px]"
                  >
                    {/* Skewed/Chamfered Card Background Container */}
                    <motion.div
                      layout
                      animate={{
                        backgroundColor: "#ffffff",
                      }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        clipPath: clipPathStyle,
                      }}
                      className={`w-full px-5 pt-9 pb-5 sm:pt-10 sm:pb-6 md:pt-12 md:pb-8 sm:px-8 md:px-10 flex flex-col relative transition-all duration-300 border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${isExpanded ? "" : "hover:bg-zinc-50"
                        }`}
                    >

                      {/* Top Row: Left Pill, Title, Right Button */}
                      <div className="flex items-start justify-between relative z-10 w-full">

                        {/* Left Area (Capsule + Connector Line inside lower shoulder) */}
                        <div className="flex items-center flex-shrink-0 absolute left-0 top-0 md:top-[2px]">
                          <div
                            className={`h-6 sm:h-9 px-2 sm:px-3 border border-dashed rounded-full flex items-center justify-center gap-1.5 sm:gap-2 bg-black/[0.04] overflow-hidden transition-[width,border-color] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? "w-[42px] sm:w-[50px]" : "w-[58px] sm:w-[82px]"}`}
                            style={{
                              borderColor: isExpanded ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            {/* Abstract Geometric Icon (Hidden dynamically in expanded state) */}
                            <AnimatePresence initial={false} mode="wait">
                              {!isExpanded && (
                                <motion.div
                                  key="icon"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="text-[#df8326] flex-shrink-0 [&_svg]:w-3 [&_svg]:h-3 sm:[&_svg]:w-3.5 sm:[&_svg]:h-3.5"
                                >
                                  {svc.icon}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Monospace Index Number */}
                            <span className="text-[9px] sm:text-[12px] font-mono font-semibold tracking-wider text-black">
                              {svc.num}
                            </span>
                          </div>

                          {/* Dashed connector line ending at shoulder slant boundary */}
                          <div
                            className="hidden md:block w-9 h-[1px] border-t border-dashed transition-all"
                            style={{
                              borderColor: isExpanded ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.12)",
                            }}
                          />
                        </div>

                        {/* Main Content Area (Offset specifically to sit outside stepped shoulder) */}
                        <div className="flex-grow pl-[66px] sm:pl-[108px] md:pl-[166px] pr-2 sm:pr-8 flex flex-col items-start select-none">

                          {/* Service Title */}
                          <h3 className={`text-[15px] leading-6 sm:leading-normal sm:text-xl md:text-2xl font-mono font-medium tracking-tight text-black ${isExpanded ? "font-semibold" : ""}`}>
                            {svc.title}
                          </h3>

                          {/* Description & Deliverables Body (Reveals beautifully inside height expansion) */}
                          {/* Always in the DOM (collapsed to height 0) so the copy is
                              server-rendered and crawlable; same spring as before. */}
                          <motion.div
                            initial={false}
                            animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{
                              height: { type: "spring", stiffness: 260, damping: 28 },
                              opacity: { duration: 0.3 }
                            }}
                            aria-hidden={!isExpanded}
                            className="overflow-hidden"
                          >
                                <motion.div
                                  initial={false}
                                  animate={isExpanded ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: isExpanded ? 0.05 : 0 }}
                                  className="mt-3 flex flex-col gap-3.5"
                                >
                                  {/* Service Description (Slightly larger font size when expanded) */}
                                  <p className="text-[15px] md:text-[17px] font-sans font-light leading-relaxed max-w-xl text-left text-zinc-700">
                                    {svc.description}
                                  </p>

                                  {/* Sub-includes (only if exists - slightly larger font size when expanded) */}
                                  {svc.includes && (
                                    <p className="text-[13px] md:text-[14.5px] font-sans font-light italic leading-relaxed max-w-xl text-left border-l-2 pl-3 border-black/15 text-zinc-600">
                                      <strong className="font-semibold not-italic text-black">Includes:</strong> {svc.includes}
                                    </p>
                                  )}

                                  {/* Core Deliverable (Slightly larger font size when expanded) */}
                                  <p className="text-[13.5px] sm:text-[14.5px] font-mono flex items-start gap-2.5 text-black font-semibold">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 flex items-center justify-center font-mono text-white bg-black/80">DELIVERABLE</span>
                                    <span className="font-sans font-light text-zinc-700">{svc.deliverable}</span>
                                  </p>
                                </motion.div>
                          </motion.div>
                        </div>

                        {/* Right action button */}
                        <div className="flex-shrink-0 -mt-1 sm:mt-0">
                          <motion.div
                            animate={{ rotate: isExpanded ? 45 : 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isExpanded
                              ? "border-black/30 text-black hover:scale-105"
                              : "border-black/10 text-black/50 group-hover:border-black/30 group-hover:text-black hover:scale-105"
                              }`}
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-none stroke-current stroke-2">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>

                      {/* Bottom Row (Sub-Keywords) - Reveals at the bottom when expanded */}
                      <motion.div
                            initial={false}
                            animate={isExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                            transition={{
                              height: { type: "spring", stiffness: 260, damping: 28 },
                              opacity: { duration: 0.3 }
                            }}
                            aria-hidden={!isExpanded}
                            className="overflow-hidden w-full relative z-10 pl-[66px] sm:pl-[108px] md:pl-[166px]"
                          >
                            <motion.div
                              initial={false}
                              animate={isExpanded ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: isExpanded ? 0.12 : 0 }}
                              className="flex flex-wrap gap-x-6 gap-y-3 pt-6 mt-6 border-t border-black/10 select-none font-mono text-[11px] sm:text-[12px] text-zinc-600 font-semibold"
                            >
                              {svc.keywords.map((kw, kwIdx) => (
                                <span key={kwIdx} className="tracking-[0.18em] whitespace-nowrap">
                                  [ {kw} ]
                                </span>
                              ))}
                            </motion.div>
                      </motion.div>

                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* The other tab's services, kept in the HTML while its panel is closed so
            both service lists are server-rendered. Swaps with the active tab. */}
        <div hidden>
          <h3>{activeTab === "ecommerce" ? "Business Automation" : "E-Commerce Growth"}</h3>
          {(activeTab === "ecommerce" ? automationServices : ecommerceServices).map((svc) => (
            <div key={svc.id}>
              <h4>{svc.title}</h4>
              <p>{svc.description}</p>
              {svc.includes && <p>Includes: {svc.includes}</p>}
              <p>{svc.deliverable}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
