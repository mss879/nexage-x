import type { Metadata } from "next";
import AboutContent from "@/components/pages/AboutContent";

export const metadata: Metadata = {
  title: "About // YARI",
  description:
    "YARI is a digital automation, e-commerce and logistics studio engineering high-performance storefronts, software and end-to-end operations for visionary brands.",
};

export default function AboutPage() {
  return <AboutContent />;
}
