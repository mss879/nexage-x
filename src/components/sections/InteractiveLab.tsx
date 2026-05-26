"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Play, Sparkles, RefreshCw, Sliders, Grid3X3, Zap, Plus } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function InteractiveLab() {
  const [activeTab, setActiveTab] = useState<"particles" | "matrix" | "morph">("particles");
  
  // Tab 1: Particles State
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleBoxRef = useRef<HTMLDivElement>(null);
  const particleIdCounter = useRef(0);

  // Tab 3: Morph Sliders State
  const [morphScale, setMorphScale] = useState(1);
  const [morphColor, setMorphColor] = useState(160); // Hue [0, 360]
  const [morphSpeed, setMorphSpeed] = useState(8); // Seconds for keyframe

  // Trigger Particle Explosion on Click
  const handleParticleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!particleBoxRef.current) return;
    
    const rect = particleBoxRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const colors = [
      "var(--color-neon-cyan)",
      "var(--color-neon-purple)",
      "var(--color-neon-pink)",
      "var(--color-neon-emerald)",
    ];

    // Create 15 particles
    const newParticles: Particle[] = Array.from({ length: 15 }).map(() => {
      particleIdCounter.current += 1;
      return {
        id: particleIdCounter.current,
        x: clickX,
        y: clickY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Animate newly created particles with GSAP
  useEffect(() => {
    if (particles.length === 0) return;

    // Animate only the latest batch of particles
    const unspentParticles = particles.filter((p) => {
      const el = document.getElementById(`part-${p.id}`);
      return el && !el.dataset.animated;
    });

    unspentParticles.forEach((p) => {
      const el = document.getElementById(`part-${p.id}`);
      if (!el) return;
      
      el.dataset.animated = "true";

      // Randomized angle and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 40;
      const targetX = p.x + Math.cos(angle) * distance;
      const targetY = p.y + Math.sin(angle) * distance;

      gsap.fromTo(
        el,
        {
          x: p.x,
          y: p.y,
          scale: 1,
          opacity: 1,
        },
        {
          x: targetX,
          y: targetY,
          scale: 0.1,
          opacity: 0,
          duration: Math.random() * 0.8 + 0.6,
          ease: "power2.out",
          onComplete: () => {
            // Clean up from state
            setParticles((prev) => prev.filter((item) => item.id !== p.id));
          },
        }
      );
    });
  }, [particles]);

  // Reset particles
  const clearParticles = () => {
    setParticles([]);
  };

  return (
    <section 
      id="lab" 
      className="relative py-28 px-6 max-w-7xl mx-auto"
    >
      {/* Background gradients */}
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-primary/5 blur-[160px] pointer-events-none -z-10" />

      {/* Title block */}
      <div className="text-center flex flex-col items-center gap-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glassmorphism border border-white/5 text-[10px] font-mono uppercase text-neon-cyan tracking-wider">
          <Zap className="w-3 h-3 text-neon-cyan animate-pulse" />
          <span>Interactive Sandbox v1.0</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white select-none">
          Interface <span className="text-gradient-purple-cyan">Playground</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed font-sans">
          Toggle interactive animation nodes below to evaluate responsiveness and animation latency live inside the browser.
        </p>
      </div>

      {/* Sandbox layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 font-mono">
              Selector Array
            </h3>
            
            {/* Tab switch buttons */}
            <div className="flex flex-col gap-3">
              {[
                { id: "particles", title: "Shockwave Canvas", desc: "Spawns velocity vectors on mouse click", icon: <Plus className="w-4 h-4" /> },
                { id: "matrix", title: "Hover Node Matrix", desc: "Interactive grid with proximity scaling", icon: <Grid3X3 className="w-4 h-4" /> },
                { id: "morph", title: "SVG Morpher Node", desc: "Tweak svg parameters with smooth springs", icon: <Sliders className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left border cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                    activeTab === tab.id
                      ? "glassmorphism border-accent-primary/45 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white"
                      : "border-white/5 bg-transparent text-gray-400 hover:border-white/10 hover:text-gray-200"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-wide">{tab.title}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">{tab.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contextual Stats card in control pane */}
          <div className="glassmorphism rounded-2xl border border-white/5 p-5 bg-bg-panel/20 text-xs font-mono text-gray-500 flex flex-col gap-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-neon-cyan" /> Core Core Engine</span>
              <span className="text-neon-emerald">ONLINE</span>
            </div>
            <div className="h-[1px] bg-white/5 my-1" />
            <div className="flex justify-between">
              <span>FPS Performance</span>
              <span className="text-white">120.0 fps (STABLE)</span>
            </div>
            <div className="flex justify-between">
              <span>Render Pipeline</span>
              <span className="text-white uppercase">{activeTab === "particles" ? "GSAP QuickTo" : activeTab === "matrix" ? "Framer Spring" : "SVG Morph Path"}</span>
            </div>
          </div>
        </div>

        {/* Live Canvas Window */}
        <div className="lg:col-span-8 glassmorphism rounded-3xl border border-white/5 bg-bg-panel/40 p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[460px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          {/* Inner glass overlay screen design */}
          <div className="absolute top-4 left-6 flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
            <span>Sandbox Display Console</span>
          </div>

          <AnimatePresence mode="wait">
            {/* Tab 1: Particle Playground */}
            {activeTab === "particles" && (
              <motion.div
                key="particles-tab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center gap-6"
              >
                <div 
                  ref={particleBoxRef}
                  onClick={handleParticleClick}
                  className="w-full max-w-xl h-[320px] rounded-2xl border border-dashed border-white/10 hover:border-neon-cyan/40 bg-bg-base/30 relative overflow-hidden flex items-center justify-center group cursor-pointer transition-colors duration-300 shadow-inner"
                >
                  {/* Floating target helper */}
                  <div className="text-center pointer-events-none flex flex-col items-center gap-3 select-none">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-bg-surface group-hover:scale-110 group-hover:border-neon-cyan group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
                      <Play className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan fill-white/5 group-hover:fill-neon-cyan/15 group-hover:rotate-90 transition-all duration-500" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 font-mono tracking-wider">
                      Click inside canvas to trigger vectors
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      Particles Rendered: {particles.length}
                    </span>
                  </div>

                  {/* Absolute particle nodes */}
                  {particles.map((p) => (
                    <div
                      key={p.id}
                      id={`part-${p.id}`}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        left: 0,
                        top: 0,
                      }}
                    />
                  ))}
                </div>

                {particles.length > 0 && (
                  <button 
                    onClick={clearParticles}
                    className="px-5 py-2.5 rounded-full border border-white/5 hover:border-white/20 bg-bg-surface text-xs font-mono text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Canvas
                  </button>
                )}
              </motion.div>
            )}

            {/* Tab 2: Proximity Matrix Grid */}
            {activeTab === "matrix" && (
              <motion.div
                key="matrix-tab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center gap-4"
              >
                <div className="grid grid-cols-7 gap-3.5 p-6 rounded-2xl border border-white/5 bg-bg-base/30 shadow-inner">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ 
                        scale: 1.3,
                        backgroundColor: "var(--color-neon-purple)",
                        boxShadow: "0 0 20px var(--color-neon-purple)",
                        borderColor: "rgba(255,255,255,0.4)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-9 h-9 rounded-xl border border-white/5 bg-bg-surface cursor-pointer flex items-center justify-center text-[10px] font-mono text-gray-600 hover:text-white transition-colors duration-200"
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest select-none pointer-events-none mt-2">
                  Proximity scaling activated // hover grids
                </span>
              </motion.div>
            )}

            {/* Tab 3: Morph Slider Node */}
            {activeTab === "morph" && (
              <motion.div
                key="morph-tab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col md:flex-row items-center gap-12 justify-center"
              >
                {/* Responsive SVG Morpher Blob */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {/* Outer glowing halo */}
                  <div
                    className="absolute inset-0 rounded-full blur-[30px] opacity-40 transition-colors duration-500"
                    style={{
                      backgroundColor: `hsl(${morphColor}, 90%, 65%)`,
                      transform: `scale(${morphScale * 1.1})`,
                    }}
                  />
                  <svg
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full relative z-10 transition-transform duration-500"
                    style={{
                      transform: `scale(${morphScale})`,
                    }}
                  >
                    {/* SVG morph blobs path animated natively with keyframes */}
                    <path
                      fill={`hsl(${morphColor}, 80%, 60%)`}
                      style={{
                        animation: `morphBlob ${morphSpeed}s ease-in-out infinite`,
                        transition: "fill 0.5s ease",
                      }}
                    />
                    <style>{`
                      @keyframes morphBlob {
                        0%, 100% {
                          d: path('M40,-56.2C54.4,-45.5,70.5,-34.5,77.5,-19.4C84.5,-4.3,82.4,14.9,74,31.4C65.5,47.8,50.7,61.4,34.2,69C17.7,76.5,-0.6,77.9,-18.2,73.5C-35.8,69,-52.7,58.6,-63.9,43.2C-75.1,27.8,-80.6,7.5,-77.8,-11.5C-75,-30.5,-63.8,-48.1,-48.6,-58.6C-33.3,-69.1,-16.7,-72.5,-0.2,-72.2C16.3,-71.9,32.7,-68,40,-56.2Z');
                          transform: translate(100px, 100px) rotate(0deg);
                        }
                        33% {
                          d: path('M48.2,-64.5C62.5,-55.8,74.2,-41.8,79.4,-25.5C84.7,-9.2,83.4,9.5,75.9,25.8C68.4,42.1,54.7,56,38.8,64.2C22.9,72.4,1.1,74.9,-19.7,71.2C-40.5,67.5,-60.3,57.6,-70.7,41.9C-81,26.2,-82,4.8,-77.7,-14.7C-73.4,-34.2,-63.7,-51.7,-49.2,-60.3C-34.6,-68.8,-17.3,-68.3,-0.3,-67.9C16.7,-67.5,33.9,-73.2,48.2,-64.5Z');
                          transform: translate(100px, 100px) rotate(120deg);
                        }
                        66% {
                          d: path('M35.6,-48C48.2,-37.2,60.8,-27.2,66.8,-13.7C72.8,0,72.2,17.2,65.3,32C58.3,46.8,45.2,59.3,29.9,65.3C14.7,71.3,-2.5,70.9,-19,66.2C-35.6,61.4,-51.4,52.3,-61.2,38.6C-71,24.8,-74.8,6.5,-72.4,-10.8C-70,-28.1,-61.5,-44.3,-48,-54.9C-34.5,-65.4,-16.1,-70.4,-0.4,-69.8C15.3,-69.2,30.6,-63.1,35.6,-48Z');
                          transform: translate(100px, 100px) rotate(240deg);
                        }
                      }
                    `}</style>
                  </svg>
                </div>

                {/* Vertical slider control parameters */}
                <div className="flex flex-col gap-5 w-full max-w-[240px]">
                  {/* Slider 1: Scale */}
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between font-mono text-gray-500">
                      <span>BLOB SCALING</span>
                      <span className="text-neon-cyan">{Math.floor(morphScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.3"
                      step="0.05"
                      value={morphScale}
                      onChange={(e) => setMorphScale(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5 focus:outline-none"
                    />
                  </div>

                  {/* Slider 2: Hue Color */}
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between font-mono text-gray-500">
                      <span>HUE ANGLE</span>
                      <span className="text-neon-purple">{morphColor}&deg;</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={morphColor}
                      onChange={(e) => setMorphColor(parseInt(e.target.value))}
                      className="w-full accent-purple-400 bg-white/10 rounded-lg cursor-pointer h-1.5 focus:outline-none"
                    />
                  </div>

                  {/* Slider 3: Keyframe Speed */}
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between font-mono text-gray-500">
                      <span>MORPH INTERVAL</span>
                      <span className="text-neon-pink">{(11 - morphSpeed).toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      step="0.5"
                      value={12 - morphSpeed}
                      onChange={(e) => setMorphSpeed(12 - parseFloat(e.target.value))}
                      className="w-full accent-pink-400 bg-white/10 rounded-lg cursor-pointer h-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
