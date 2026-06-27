"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

/** Scroll-triggered count-up. Respects prefers-reduced-motion. */
export default function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const obj = { v: 0 };
      const render = () => {
        el.textContent = format(obj.v);
      };
      if (reduce) {
        obj.v = to;
        render();
        return;
      }
      render();
      gsap.to(obj, {
        v: to,
        duration,
        ease: "power2.out",
        onUpdate: render,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
