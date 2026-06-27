"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** vertical offset to animate from */
  y?: number;
  /** stagger immediate children instead of the wrapper */
  stagger?: number;
  delay?: number;
  duration?: number;
  /** start position for ScrollTrigger */
  start?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Scroll-triggered entrance used across all marketing pages.
 * Honors prefers-reduced-motion (content stays visible, no motion).
 */
export default function Reveal({
  children,
  className,
  y = 44,
  stagger,
  delay = 0,
  duration = 1.05,
  start = "top 86%",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.from(targets, {
          y,
          autoAlpha: 0,
          duration,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const Tag = as as React.ElementType;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
