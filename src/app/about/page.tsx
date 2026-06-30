import type { Metadata } from "next";
import AboutContent from "@/components/pages/AboutContent";

export const metadata: Metadata = {
  title: "About YARI — Dubai E-commerce, Software & Logistics Studio",
  description:
    "YARI is a Dubai-based e-commerce, software and logistics studio engineering high-performance storefronts, software and end-to-end operations for ambitious brands across the UAE and GCC.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About YARI — Dubai E-commerce, Software & Logistics Studio | YARI",
    description:
      "One team for design, software and logistics — building operating systems for growth for brands in Dubai and the GCC.",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
