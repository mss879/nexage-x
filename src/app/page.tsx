import type { Metadata } from "next";
import HomeContent from "@/components/pages/HomeContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "YARI — E-commerce, Software & Logistics Studio in Dubai",
  absoluteTitle: true,
  description:
    "YARI is a Dubai e-commerce, software and logistics studio — online stores, custom software, Odoo & Zoho integrations and fulfilment for UAE and GCC brands.",
  socialDescription:
    "Design, software and logistics under one roof. High-converting online stores, Odoo & Zoho integrations and end-to-end fulfilment for brands in Dubai and the GCC.",
  path: "/",
});

export default function Home() {
  return <HomeContent />;
}
