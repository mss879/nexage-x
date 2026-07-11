import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where supported, WebP as fallback — large PNG sources
    // (logos, section art) shrink by ~10-30x at the rendered sizes.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
