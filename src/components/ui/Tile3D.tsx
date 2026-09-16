import React from "react";

/**
 * Floating 3D tile: glossy face, extruded body and a tinted ground glow (`.tile-3d-*` in globals.css).
 * `variant` picks the face colours (a social brand, or "gold" for the YARI accent); `size` is the tile
 * edge in px; `delay` (seconds, usually negative) staggers the float so neighbouring tiles bob out of sync.
 */
export default function Tile3D({
  variant,
  size = 42,
  delay = 0,
  children,
}: {
  variant: string;
  size?: number;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`tile-3d-wrap tile-3d-${variant}`}
      style={{ "--tile-size": `${size}px`, "--tile-delay": `${delay}s` } as React.CSSProperties}
    >
      <span className="tile-3d">{children}</span>
      <span className="tile-3d-shadow" />
    </span>
  );
}
