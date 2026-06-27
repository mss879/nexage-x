"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight, Layers, Command } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  onNavClick?: (sectionId: string) => void;
}

export default function Navbar({ onNavClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "Features", id: "features" },
    { label: "Interactive Lab", id: "lab" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    setIsMobileMenuOpen(false);
    if (onNavClick) {
      onNavClick(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "py-3 bg-bg-base/70 backdrop-blur-md border-b border-border-subtle shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => handleClick("hero")} 
            className="flex items-center cursor-pointer"
          >
            <Image 
              src="/yari-logo.png"
              alt="YARI Logo" 
              width={840}
              height={210}
              className="h-[210px] w-auto object-contain ml-[-32px] translate-y-[2px]"
              priority
            />
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 glassmorphism px-2 py-1.5 rounded-full border border-border-subtle bg-bg-panel/40">
            {navItems.map((item, idx) => (
              <div
                key={item.id}
                className="relative px-5 py-2 cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleClick(item.id)}
              >
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </div>
            ))}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => handleClick("lab")}
              className="relative px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider font-mono uppercase overflow-hidden group cursor-pointer border border-border-subtle"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              <div className="absolute inset-[1px] bg-bg-surface rounded-full -z-10 group-hover:bg-bg-surface/90 transition-colors duration-300" />
              <span className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors duration-300">
                Launch Lab
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border-subtle bg-bg-surface/50 text-gray-300 hover:text-white hover:border-accent-primary transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[72px] z-40 md:hidden glassmorphism border-b border-border-subtle mx-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className="px-4 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-gray-300 hover:text-white text-base font-semibold tracking-wide cursor-pointer transition-all duration-300"
                >
                  {item.label}
                </div>
              ))}
              <div className="h-[1px] bg-border-subtle my-2" />
              <button 
                onClick={() => handleClick("lab")}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                Launch Lab <Sparkles className="w-4 h-4 animate-bounce" />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
