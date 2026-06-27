"use client";

import React from "react";

type MarqueeProps = {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  /** seconds per loop */
  speed?: number;
  reverse?: boolean;
};

/** Seamless infinite marquee (two duplicated tracks, translateX -50%). */
export default function Marquee({
  items,
  className = "",
  itemClassName = "",
  speed = 28,
  reverse = false,
}: MarqueeProps) {
  return (
    <div
      className={`relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_7%,white_93%,transparent)] ${className}`}
    >
      <div
        className="flex w-max animate-marquee"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {[0, 1].map((track) => (
          <div key={track} className="flex shrink-0" aria-hidden={track === 1}>
            {items.map((item, i) => (
              <span key={i} className={`shrink-0 ${itemClassName}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
