"use client";

import React from "react";
import { motion, useScroll, useTransform, MotionValue, useInView } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ScrollWordProps {
  text: string;
  style: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

// Custom sub-component to comply with React "Rules of Hooks" (no hooks inside loops)
function ScrollWord({ text, style, index, total, progress }: ScrollWordProps) {
  // Let the reveal overlap slightly by adding a +2 word buffer for butter-smooth fading
  const start = index / total;
  const end = Math.min(1, (index + 2) / total); 
  
  // High-performance GPU-accelerated motion transforms linked to scroll progress
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const y = useTransform(progress, [start, end], [4, 0]); 

  return (
    <motion.span
      style={{ opacity, y }}
      className={`inline-block ${style}`}
    >
      {text}
    </motion.span>
  );
}

// True volumetric 3D Cube component using HTML5 3D Transforms
interface Cube3DProps {
  x: number;
  y: number;
  z: number;
  type: string;
}

function Cube3D({ x, y, z, type }: Cube3DProps) {
  const isGlow = type === "glow";
  const size = 40; // Larger volumetric cube face size in px (up from 36)
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

  // Completely uniform opaque gradients for ultimate rendering speed and zero color shifting during rotation
  const faceStyleClass = isGlow
    ? "bg-gradient-to-br from-[#ffd8b3] via-[#df8326] to-[#994d00] border border-[#ffb266] shadow-[0_0_25px_rgba(223,131,38,0.9)]"
    : "bg-gradient-to-br from-[#ffffff] via-[#f4f4f5] to-[#d4d4d8] border border-black/[0.08] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9)]";

  return (
    <div
      className={`absolute cube-3d cube-x-${x} cube-y-${y} cube-z-${z} ${isGlow ? "cube-glow" : "cube-dark"}`}
      style={{
        transform: `translate3d(
          calc(${x} * (42px + var(--hover-offset, 0) * 1px)),
          calc(${y} * (42px + var(--hover-offset, 0) * 1px)),
          calc(${z} * (42px + var(--hover-offset, 0) * 1px))
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

// Structured sequence of 12 moves (R U F ... then their inverses to solve the cube back)
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

// Perform coordinate projection for a 90 or -90 degree rotation
function getNewCoordinates(
  x: number,
  y: number,
  z: number,
  axis: "x" | "y" | "z",
  angle: number
): { x: number; y: number; z: number } {
  const is90 = angle === 90 || angle === -270;
  
  if (axis === "x") {
    // Rotation around X-axis: x stays constant, y and z rotate
    return is90 ? { x, y: -z, z: y } : { x, y: z, z: -y };
  }
  if (axis === "y") {
    // Rotation around Y-axis: y stays constant, x and z rotate
    return is90 ? { x: z, y, z: -x } : { x: -z, y, z: x };
  }
  if (axis === "z") {
    // Rotation around Z-axis: z stays constant, x and y rotate
    return is90 ? { x: -y, y: x, z } : { x: y, y: -x, z };
  }
  return { x, y, z };
}

// Volumetric 3D Shifting Cube Grid Container
function VolumetricIsometricGrid() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const sliceRef = React.useRef<HTMLDivElement>(null);

  const [cubes, setCubes] = React.useState<CubeData[]>(initialCubes);
  const [moveIndex, setMoveIndex] = React.useState(0);
  const [activeMove, setActiveMove] = React.useState<{
    axis: "x" | "y" | "z";
    slice: number;
    angle: number;
  } | null>(null);

  // 1. Initial Scale Pop-In & Heartbeat Core Pulsing
  useGSAP(() => {
    if (!gridRef.current || !containerRef.current) return;

    // Pop-in reveal scale animations
    gsap.fromTo(
      ".cube-3d",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: "back.out(1.2)",
        stagger: {
          each: 0.03,
          from: "center",
        },
        delay: 0.2,
      }
    );

    // Pulse core
    gsap.to(".cube-glow", {
      scale: 1.08,
      duration: 1.4,
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
    }, moveIndex === 0 ? 1500 : 400); // 1.5s delay before first move, 400ms between moves

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

  // 4. Interactive 3D Cursor Parallax & Proximity-Based Magnetic Pull-Apart Engine
  useGSAP(() => {
    if (!gridRef.current || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate mouse offset from center of the container
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;

      // 1. Specular Parallax tilt wiggles
      gsap.to(gridRef.current, {
        rotateX: -25 - dy * 0.12,
        rotateY: 45 + dx * 0.12,
        duration: 0.5,
        ease: "power2.out",
      });

      // 2. Proximity-based exploding pull-apart calculation
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.min(rect.width, rect.height) / 1.5; // Radial active boundary
      const proximityPct = Math.max(0, Math.min(1, 1 - dist / maxDist));
      
      // Pull cubes apart proportionally closer to the center (max 20px offset)
      const targetOffset = proximityPct * 20;

      // Smoothly animate the CSS custom variable on the GPU
      gsap.to(gridRef.current, {
        "--hover-offset": targetOffset,
        duration: 0.3,
        ease: "power1.out",
      });
    };

    const handleMouseLeave = () => {
      // Return space to rest tilt and collapse the cubes back into a solid shape
      gsap.to(gridRef.current, {
        rotateX: -25,
        rotateY: 45,
        "--hover-offset": 0,
        duration: 0.8,
        ease: "power3.out",
      });
    };

    const el = containerRef.current;
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
      className="w-full h-full cursor-pointer flex items-center justify-center relative select-none overflow-visible group"
      style={{ perspective: "600px" }} // Decreased perspective for a richer, more stereoscopic 3D depth effect
    >
      {/* Core Background Radial Glow */}
      <div 
        className="absolute w-[220px] h-[220px] rounded-full bg-[#df8326]/12 blur-3xl pointer-events-none z-0" 
        style={{ transform: "translate3d(0, 0, -50px)" }}
      />

      {/* The 3D Grid Space */}
      <div
        ref={gridRef}
        className="w-[180px] h-[180px] relative transition-transform duration-300 transform-style-3d ease-out"
        style={{
          transform: "rotateX(-25deg) rotateY(45deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Perpendicular center axis guide rods */}
        <div 
          className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#df8326]/20 pointer-events-none" 
          style={{ transform: "translate3d(0, 0, 0)" }}
        />
        <div 
          className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#df8326]/20 pointer-events-none" 
          style={{ transform: "translate3d(0, 0, 0)" }}
        />

        {/* 1. Rotating active slice wrapper (when rotating, runs 100% on GPU) */}
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
  );
}

function DigitColumn({ digit, isInView }: { digit: number; isInView: boolean }) {
  // 2 cycles of digits to create a complete full rotation spin effect
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  return (
    <span className="relative inline-flex overflow-hidden h-[1em] leading-none align-baseline">
      <motion.span
        initial={{ y: 0 }}
        animate={isInView ? { y: `-${digit + 10}em` } : { y: 0 }}
        transition={{
          duration: 2.4,
          ease: [0.16, 1, 0.3, 1], // Cinematic easeOut
          delay: Math.random() * 0.4, // Stagger each digit column
        }}
        className="flex flex-col absolute left-0 top-0 w-full"
      >
        {digits.map((d, idx) => (
          <span key={idx} className="inline-block h-[1em] leading-none select-none text-center">
            {d}
          </span>
        ))}
      </motion.span>
      {/* Spacer digit to preserve width/height in flow */}
      <span className="opacity-0 select-none pointer-events-none">0</span>
    </span>
  );
}

function AnimatedCounter({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const characters = value.split("");

  return (
    <span ref={ref} className="inline-flex items-baseline font-syne select-none">
      {characters.map((char, index) => {
        const isDigit = /[0-9]/.test(char);
        if (isDigit) {
          return (
            <DigitColumn
              key={index}
              digit={parseInt(char, 10)}
              isInView={isInView}
            />
          );
        }
        return (
          <span key={index} className="inline-block select-none leading-none">
            {char}
          </span>
        );
      })}
    </span>
  );
}

export default function AboutUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Premium cinematic easeOut
      },
    },
  };

  const textContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015, // Stagger words rapidly for a seamless reading flow
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0.15, y: 4 }, // Start dimmed down to mimic an Apple-style lit-up typographic reveal
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const words = [
    { text: "YARI®", style: "font-semibold text-white" },
    { text: "is", style: "" },
    { text: "a", style: "" },
    { text: "high-performance", style: "" },
    { text: "e-commerce", style: "" },
    { text: "and", style: "" },
    { text: "digital", style: "" },
    { text: "automation", style: "" },
    { text: "studio", style: "" },
    { text: "built", style: "" },
    { text: "for", style: "" },
    { text: "visionary", style: "" },
    { text: "brands.", style: "" },
    { text: "We", style: "" },
    { text: "seamlessly", style: "" },
    { text: "blend", style: "" },
    { text: "stunning", style: "font-semibold text-white" },
    { text: "creative", style: "font-semibold text-white" },
    { text: "design,", style: "font-semibold text-white" },
    { text: "robust", style: "" },
    { text: "software", style: "" },
    { text: "engineering,", style: "" },
    { text: "and", style: "" },
    { text: "end-to-end", style: "font-semibold text-white underline decoration-[#df8326]/70 decoration-2 underline-offset-8" },
    { text: "logistics", style: "font-semibold text-white underline decoration-[#df8326]/70 decoration-2 underline-offset-8" },
    { text: "automation—from", style: "font-semibold text-white underline decoration-[#df8326]/70 decoration-2 underline-offset-8" },
    { text: "launch-ready", style: "" },
    { text: "storefronts", style: "" },
    { text: "and", style: "" },
    { text: "web", style: "" },
    { text: "apps", style: "" },
    { text: "to", style: "" },
    { text: "automated", style: "" },
    { text: "operations,", style: "" },
    { text: "marketplace", style: "" },
    { text: "scaling,", style: "" },
    { text: "and", style: "" },
    { text: "smart", style: "" },
    { text: "fulfillment", style: "" },
    { text: "systems.", style: "" }
  ];

  const stats = [
    { value: "120+", label: "Brands Transformed" },
    { value: "98%", label: "Client Retention Rate" },
    { value: "99.9%", label: "Fulfillment Accuracy" },
    { value: "9.6/10", label: "Client Satisfaction Score" },
  ];

  // Ref and useScroll tracking specifically for the typography block
  const paragraphRef = React.useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ["start 75%", "start 35%"], // Animation plays perfectly as the paragraph moves through the main viewport focus
  });

  return (
    <section className="relative w-full py-24 md:py-32 bg-[#121214] text-white px-6 md:px-12 lg:px-24 overflow-hidden border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* Left Column: Headline and 3D Volumetric Shifting Cube Grid */}
          <motion.div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
              <span className="text-xs uppercase font-mono tracking-widest text-[#df8326] font-semibold">
                About Us
              </span>
            </motion.div>

            <motion.h2 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-syne font-medium leading-[1.05] tracking-tight uppercase text-white select-none"
            >
              We Are <br />
              <span className="bg-gradient-to-r from-[#df8326] to-[#C57019] bg-clip-text text-transparent">
                YARI®
              </span>
            </motion.h2>

            {/* Hardware-Accelerated True 3D Volumetric Shifting Grid Container */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 w-full max-w-[340px] sm:max-w-[380px] aspect-[1/1] relative flex items-center justify-center overflow-visible z-10"
              style={{ perspective: "1000px" }}
            >
              <VolumetricIsometricGrid />
            </motion.div>
          </motion.div>

          {/* Right Column: Narrative Body with Scroll-Linked Word-by-Word Reveal */}
          <motion.div className="lg:col-span-6 lg:pt-10">
            <p 
              ref={paragraphRef}
              className="text-lg sm:text-xl md:text-[22px] lg:text-[24px] font-sans font-light text-white/50 leading-relaxed tracking-tight max-w-2xl text-justify md:text-left flex flex-wrap gap-x-[6px] gap-y-[4px]"
            >
              {words.map((word, idx) => (
                <ScrollWord
                  key={idx}
                  text={word.text}
                  style={word.style}
                  index={idx}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
            </p>
          </motion.div>
        </motion.div>

        {/* Minimalist Divider Line */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="h-[1px] w-full bg-white/[0.08] mt-8 mb-12 md:mt-10 md:mb-16 origin-left"
        />

        {/* Bottom Row: Stats Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="flex flex-col"
            >
              <span className="text-4xl sm:text-5xl md:text-6xl font-syne font-semibold tracking-tight text-white">
                <AnimatedCounter value={stat.value} />
              </span>
              <span className="text-xs md:text-sm font-sans tracking-wider text-white/50 mt-3 uppercase font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
