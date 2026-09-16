import React from "react";

/**
 * The YARI "Y" mark (the icon half of the logo) as a vector, filled with currentColor.
 * Traced from public/yari-logo.png and made symmetric; the favicon, icon.png and
 * apple-icon.png in app/ are rendered from the same shape (white on a black square).
 */
export default function YMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 155.6 165.8" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0 0H33.2L77.8 42.1 122.4 0H155.6L77.8 72.2ZM30.1 41.6 73.8 81.8V165.8L58.5 147.2V83ZM125.5 41.6 81.8 81.8V165.8L97 147.2V83Z" />
    </svg>
  );
}
