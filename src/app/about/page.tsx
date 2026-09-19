import type { Metadata } from "next";
import AboutContent from "@/components/pages/AboutContent";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { pageBreadcrumb } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "About YARI — Dubai E-commerce & Logistics Studio",
  description:
    "YARI is a Dubai-based e-commerce, software and logistics studio building high-performance storefronts and end-to-end operations for UAE and GCC brands.",
  socialDescription:
    "One team for design, software and logistics — building operating systems for growth for brands in Dubai and the GCC.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          pageBreadcrumb(["About", "/about"]),
        ]}
      />
      <AboutContent />
    </>
  );
}
