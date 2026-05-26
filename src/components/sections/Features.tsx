"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Cpu, Zap, Eye, Atom, ArrowRight } from "lucide-react";

// Individual 3D Tilt Card Component
function FeatureCard({
  title,
  description,
  icon,
  glowColor,
  tag,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  glowColor: string;
  tag: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalize coordinates to range [-0.5, 0.5]
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative h-[380px] rounded-2xl glassmorphism border border-white/5 bg-bg-panel/40 p-8 flex flex-col justify-between group cursor-pointer transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
    >
      {/* Background neon glow overlay on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-[30px]"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}15 0%, transparent 70%)`,
        }}
      />
      
      {/* Glowing card border on hover */}
      <div 
        className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/10 transition-colors duration-300 pointer-events-none -z-10"
        style={{
          boxShadow: hovered ? `0 0 25px ${glowColor}10` : "none",
        }}
      />

      {/* Tag and icon */}
      <div className="flex justify-between items-start" style={{ transform: "translateZ(30px)" }}>
        <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          {tag}
        </span>
        <div 
          className="p-3.5 rounded-xl border border-white/5 bg-bg-surface/60 group-hover:scale-110 transition-all duration-300"
          style={{
            color: glowColor,
            boxShadow: hovered ? `0 0 15px ${glowColor}20` : "none",
          }}
        >
          {icon}
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col gap-3" style={{ transform: "translateZ(45px)" }}>
        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed font-sans">
          {description}
        </p>
      </div>

      {/* Button link reveal */}
      <div 
        className="flex items-center gap-2 text-xs font-semibold tracking-wider font-mono uppercase text-gray-500 group-hover:text-white transition-colors duration-300 mt-2"
        style={{ transform: "translateZ(25px)" }}
      >
        <span>Explore Core</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
      </div>
    </motion.div>
  );
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "GSAP Vector Timelines",
      description: "Performant animation engines mapping complex visual physics paths at a clean 120fps. Guaranteed zero layout trash or rendering drops.",
      icon: <Zap className="w-5 h-5" />,
      glowColor: "var(--color-neon-cyan)",
      tag: "Engine // v.01",
    },
    {
      title: "Interactive 3D Matrices",
      description: "Spatial component grids powered by hardware-accelerated transforms and interactive mouse tracking arrays.",
      icon: <Cpu className="w-5 h-5" />,
      glowColor: "var(--color-neon-purple)",
      tag: "Display // v.02",
    },
    {
      title: "Glassmorphism Layers",
      description: "Dynamic backdrop-filter compositions blending blurred panels, floating blobs, and custom shadow offsets flawlessly.",
      icon: <Eye className="w-5 h-5" />,
      glowColor: "var(--color-neon-pink)",
      tag: "Visuals // v.03",
    },
    {
      title: "React 19 Reactive Nodes",
      description: "Fully compiled reactive structures ensuring sub-millisecond element state transition speeds and robust static render hooks.",
      icon: <Atom className="w-5 h-5" />,
      glowColor: "var(--color-neon-emerald)",
      tag: "Compute // v.04",
    },
  ];

  return (
    <section 
      id="features" 
      ref={containerRef}
      className="relative py-28 px-6 max-w-7xl mx-auto"
    >
      {/* Background neon accent */}
      <div className="absolute top-[30%] right-[-100px] w-[350px] h-[350px] rounded-full bg-accent-secondary/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-100px] w-[350px] h-[350px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none -z-10" />

      {/* Headers */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-neon-purple tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
            <span>Nexage-X Capabilities</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white select-none">
            High Fidelity <br />
            <span className="text-gradient-purple-cyan">Display Systems</span>
          </h2>
        </div>
        <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed font-sans mb-1">
          Every layer has been curated to output absolute rendering performance. Powered by native browser composites and GPU transforms.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-[1000px]">
        {features.map((feature, idx) => (
          <FeatureCard
            key={idx}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            glowColor={feature.glowColor}
            tag={feature.tag}
          />
        ))}
      </div>
    </section>
  );
}
