"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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

export default function Services() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ecommerce" | "automation">("ecommerce");
  const [expandedId, setExpandedId] = useState<string | null>(null); // Collapsed by default

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section
        id="what-we-do"
        className="relative w-full py-16 md:py-20 bg-[#050508] text-white px-4 md:px-12 lg:px-24 border-b border-white/[0.04] overflow-hidden min-h-[600px]"
      />
    );
  }

  const ecommerceServices: ServiceItem[] = [
    {
      id: "brand-setup",
      num: "001",
      title: "Brand & Store Setup",
      description: "We build your brand foundation and launch-ready online store from the ground up, including identity, visuals, store setup, payments, shipping, and mobile optimization.",
      includes: "Brand identity, logo design, packaging design, product photography, Shopify setup, domain and email setup, payment gateway integration, shipping setup, mobile optimization, and conversion-focused UI/UX.",
      deliverable: "A fully launch-ready online store.",
      keywords: ["IDENTITY", "LOGO", "SHOPIFY SETUP", "LAUNCH READY"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        </svg>
      ),
    },
    {
      id: "store-dev",
      num: "002",
      title: "Store Development & Customization",
      description: "We design and develop high-performing e-commerce stores tailored to your products, customers, and business goals.",
      includes: "Custom Shopify sections, theme customization, product page optimization, collection setup, checkout improvements, upsell features, app integrations, and performance optimization.",
      deliverable: "A customized online store built for speed, trust, and conversions.",
      keywords: ["THEME CUSTOMIZATION", "SHOPIFY SECTIONS", "SPEED", "CONVERSIONS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "retention-loyalty",
      num: "003",
      title: "Retention & Loyalty Systems",
      description: "We help brands increase repeat purchases through customer retention, loyalty, and automated engagement systems.",
      includes: "Email marketing flows, SMS campaigns, loyalty programs, referral systems, abandoned cart recovery, customer win-back campaigns, and post-purchase automation.",
      deliverable: "A retention system that keeps customers engaged and buying again.",
      keywords: ["EMAIL FLOWS", "SMS CAMPAIGNS", "LOYALTY", "AUTOMATIONS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      ),
    },
    {
      id: "perf-marketing",
      num: "004",
      title: "Performance Marketing",
      description: "We create and manage data-driven advertising campaigns that help e-commerce brands attract customers and generate sales.",
      includes: "Meta Ads, Google Ads, campaign strategy, creative direction, audience targeting, retargeting, conversion tracking, and performance reporting.",
      deliverable: "A paid advertising system focused on traffic, conversions, and return on ad spend.",
      keywords: ["META ADS", "GOOGLE ADS", "RETARGETING", "ROI OUTCOME"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      ),
    },
    {
      id: "ops-automation",
      num: "005",
      title: "Operations & Automation",
      description: "We streamline your e-commerce operations using automation, integrations, and smart backend systems.",
      includes: "Inventory syncing, ERP integrations, warehouse automation, CRM setup, customer service systems, WhatsApp integrations, AI chatbots, Make.com automation, and Shopify Flow automation.",
      deliverable: "A more efficient e-commerce operation with fewer manual tasks and better control.",
      keywords: ["INTEGRATIONS", "SYNCING", "MAKE.COM", "AI CHATBOTS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: "marketplace-exp",
      num: "006",
      title: "Marketplace Expansion",
      description: "We help brands expand beyond their own website by setting up and optimizing marketplace sales channels.",
      includes: "Amazon setup, Noon setup, product listing creation, marketplace account configuration, catalog structuring, and basic marketplace optimization.",
      deliverable: "Your products listed and ready to sell across major marketplaces.",
      keywords: ["AMAZON SETUP", "NOON SETUP", "LISTINGS", "EXPANSION"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      ),
    },
    {
      id: "fulfillment-mgmt",
      num: "007",
      title: "Fulfillment Management",
      description: "We manage the operational side of shipping and order fulfillment so brands can focus on growth.",
      includes: "Warehouse coordination, pick and pack management, inventory monitoring, shipping label generation, COD management, return handling, and international shipping coordination.",
      deliverable: "A reliable fulfillment process that keeps orders moving smoothly.",
      keywords: ["WAREHOUSE COORD", "PICK AND PACK", "COD MGMT", "SHIPPING LABELS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M2 9l7-7h6l7 7v6l-7 7H9l-7-7V9z" />
        </svg>
      ),
    },
  ];

  const automationServices: ServiceItem[] = [
    {
      id: "workflow-automation",
      num: "001",
      title: "Workflow Automation Systems",
      description: "We automate repetitive business tasks so your team can save time, reduce errors, and operate more efficiently.",
      deliverable: "Automated workflows that save time and eliminate manual errors.",
      keywords: ["INTEGRATIONS", "API SYNC", "TASK AUTOMATION", "ERROR REDUCTION"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        </svg>
      ),
    },
    {
      id: "content-automation",
      num: "002",
      title: "Content Automation Systems",
      description: "We build systems that help plan, create, organize, and publish content faster across multiple platforms.",
      deliverable: "A central publishing and automation system for digital media.",
      keywords: ["CONTENT SCHEDULING", "DYNAMIC TEMPLATES", "MULTI-PLATFORM", "AUTO-PUBLISH"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "ai-assistants",
      num: "003",
      title: "AI Assistants & Chatbots",
      description: "We create AI-powered assistants and chatbots that can support customers, answer questions, qualify leads, and handle routine tasks.",
      deliverable: "An intelligent AI chatbot working 24/7 to capture and support leads.",
      keywords: ["LEAD QUALIFICATION", "CUSTOMER SUPPORT", "NLP ENGINES", "CRM SYNC"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      ),
    },
    {
      id: "consulting-audits",
      num: "004",
      title: "Consulting & Automation Audits",
      description: "We review your current systems, identify bottlenecks, and recommend practical automation solutions for your business.",
      deliverable: "A complete automation strategy report tailored to your business.",
      keywords: ["BOTTLENECK ANALYSIS", "PIPELINE AUDITS", "ROI ESTIMATES", "ARCH PLANS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      ),
    },
    {
      id: "smart-websites",
      num: "005",
      title: "Smart Websites",
      description: "We build modern, SEO-optimized websites designed to look professional, load fast, and convert visitors into leads or customers.",
      deliverable: "A fast, modern website built to turn traffic into paying leads.",
      keywords: ["SEO OPTIMIZATION", "STATIC BUILDS", "RESPONSIVE UI", "CONVERSION FLOWS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      id: "smart-campaigns",
      num: "006",
      title: "Smart Ad Campaigns",
      description: "We plan, launch, and optimize targeted advertising campaigns across platforms to help businesses generate leads, sales, and measurable growth.",
      deliverable: "High-ROI ad campaigns built to generate predictable business growth.",
      keywords: ["AUDIENCE RESEARCH", "PERFORMANCE TRACK", "AD TESTING", "BUDGET CONTROL"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      ),
    },
    {
      id: "web-apps",
      num: "007",
      title: "Web Apps",
      description: "We design and develop custom web applications built around your business needs, workflows, and customer experience.",
      deliverable: "A custom-coded web application designed to run your business operations.",
      keywords: ["CUSTOM WORKFLOWS", "USER INTERFACES", "CLOUD COMPUTE", "DATABASE ARCH"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M2 9l7-7h6l7 7v6l-7 7H9l-7-7V9z" />
        </svg>
      ),
    },
    {
      id: "smart-funnels",
      num: "008",
      title: "Smart Funnels",
      description: "We create conversion-focused funnels that guide visitors from interest to action through landing pages, forms, automations, and follow-up systems.",
      deliverable: "A high-converting marketing funnel that guides visitors to take action.",
      keywords: ["LANDING PAGES", "FORM BUILDERS", "SEQUENTIAL EMAILS", "CONVERSION HOOKS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5" />
        </svg>
      ),
    },
    {
      id: "custom-backend",
      num: "009",
      title: "Custom Backend Systems",
      description: "We build secure backend systems that manage data, users, operations, dashboards, and business processes.",
      deliverable: "A robust backend engine to manage data, security, and users.",
      keywords: ["SECURE DATABASES", "API GATEWAYS", "DASHBOARD LOGIC", "SYSTEM INTEGRITY"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="8" y="8" width="8" height="8" />
        </svg>
      ),
    },
    {
      id: "brand-kits",
      num: "010",
      title: "Brand Kits",
      description: "We create professional brand kits that give your business a consistent visual identity across websites, ads, social media, and marketing materials.",
      deliverable: "A unified visual identity guidelines package for all materials.",
      keywords: ["COLOR PALETTES", "LOGO SUITES", "VECTOR BRANDING", "STYLE MANUALS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 21L21 3" />
        </svg>
      ),
    },
    {
      id: "chat-voice-agents",
      num: "011",
      title: "AI Chat Agents & Voice Agents",
      description: "We build AI chat and voice agents that can handle customer conversations, answer inquiries, capture leads, and support business operations.",
      deliverable: "AI chat and voice agents operating seamlessly across calls and text.",
      keywords: ["NATURAL DIALOGUE", "LEAD CAPTURE", "INTEGRATED CHANNELS", "SUPPORT AGENTS"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      ),
    },
    {
      id: "odoo-zoho-integration",
      num: "012",
      title: "Website + Odoo & Zoho Integration",
      description: "We connect your website and storefront to Odoo ERP and tools like Zoho — unifying CRM, inventory, accounting, and order fulfilment into one synchronized system with no manual re-entry.",
      includes: "Odoo ERP integration, Zoho CRM & Books sync, two-way product/customer/order sync, invoicing automation, inventory and stock syncing, payment reconciliation, custom Odoo modules, and API middleware between your site and back office.",
      deliverable: "A fully integrated website wired into Odoo/Zoho with reliable two-way data sync.",
      keywords: ["ODOO ERP", "ZOHO CRM", "TWO-WAY SYNC", "UNIFIED DATA"],
      icon: (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
          <path d="M4 7h16M4 7l2 13h12l2-13M9 11v5M15 11v5" />
          <circle cx="12" cy="4" r="1.6" />
        </svg>
      ),
    },
  ];

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
              className="text-4xl sm:text-5xl md:text-6xl font-syne font-medium tracking-tight uppercase leading-[1.05] mt-2 select-none"
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

                // Responsive geometric polygon cuts:
                // Desktop: Stepped left shoulder
                // Mobile: Standard symmetric left-corner chamfers to prevent squeeze
                const clipPathStyle = `polygon(
                  0px 32px, 
                  16px 16px, 
                  var(--shoulder-end, 130px) 16px, 
                  var(--shoulder-step, 146px) 0px, 
                  100% 0px, 
                  100% 100%, 
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
                          <motion.div
                            animate={{
                              width: isExpanded ? 50 : 82,
                            }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="h-9 px-3 border border-dashed rounded-full flex items-center justify-center gap-2 bg-black/[0.04] overflow-hidden transition-colors"
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
                                  className="text-[#df8326] flex-shrink-0"
                                >
                                  {svc.icon}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Monospace Index Number */}
                            <span className="text-[12px] font-mono font-semibold tracking-wider text-black">
                              {svc.num}
                            </span>
                          </motion.div>

                          {/* Dashed connector line ending at shoulder slant boundary */}
                          <div
                            className="hidden md:block w-9 h-[1px] border-t border-dashed transition-all"
                            style={{
                              borderColor: isExpanded ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.12)",
                            }}
                          />
                        </div>

                        {/* Main Content Area (Offset specifically to sit outside stepped shoulder) */}
                        <div className="flex-grow pl-[84px] sm:pl-[108px] md:pl-[166px] pr-3 sm:pr-8 flex flex-col items-start select-none">

                          {/* Service Title */}
                          <h3 className={`text-base sm:text-xl md:text-2xl font-mono font-medium tracking-tight text-black ${isExpanded ? "font-semibold" : ""}`}>
                            {svc.title}
                          </h3>

                          {/* Description & Deliverables Body (Reveals beautifully inside height expansion) */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  height: { type: "spring", stiffness: 260, damping: 28 },
                                  opacity: { duration: 0.3 }
                                }}
                                className="overflow-hidden"
                              >
                                <motion.div
                                  initial={{ y: 8, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 8, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
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
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Right action button */}
                        <div className="flex-shrink-0">
                          <motion.div
                            animate={{ rotate: isExpanded ? 45 : 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${isExpanded
                              ? "border-black/30 text-black hover:scale-105"
                              : "border-black/10 text-black/50 group-hover:border-black/30 group-hover:text-black hover:scale-105"
                              }`}
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>

                      {/* Bottom Row (Sub-Keywords) - Reveals at the bottom when expanded */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { type: "spring", stiffness: 260, damping: 28 },
                              opacity: { duration: 0.3 }
                            }}
                            className="overflow-hidden w-full relative z-10 pl-[84px] sm:pl-[108px] md:pl-[166px]"
                          >
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 10, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                              className="flex flex-wrap gap-x-6 gap-y-3 pt-6 mt-6 border-t border-black/10 select-none font-mono text-[11px] sm:text-[12px] text-zinc-600 font-semibold"
                            >
                              {svc.keywords.map((kw, kwIdx) => (
                                <span key={kwIdx} className="tracking-[0.18em] whitespace-nowrap">
                                  [ {kw} ]
                                </span>
                              ))}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
