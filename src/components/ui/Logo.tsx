"use client";

import React from "react";
import Image from "next/image";

/**
 * The original YARI logo (6250×6250 with heavy transparent padding) cropped to
 * its content band via an overflow-hidden window. `className` sizes the window.
 * Served through next/image so the 2.7MB source PNG arrives as a ~KB-sized
 * AVIF/WebP at the rendered resolution.
 */
export default function Logo({
  className = "h-9 w-[112px]",
  imgClassName = "",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      aria-label="YARI"
    >
      <Image
        src="/yari-logo.png"
        alt="YARI"
        width={256}
        height={256}
        className={`h-[300%] w-auto max-w-none object-contain select-none ${imgClassName}`}
        draggable={false}
      />
    </span>
  );
}
