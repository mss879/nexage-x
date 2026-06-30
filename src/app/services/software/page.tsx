import type { Metadata } from "next";
import SoftwareServicesContent from "@/components/pages/SoftwareServicesContent";

export const metadata: Metadata = {
  title: "E-commerce & Software Development in Dubai",
  description:
    "E-commerce website development in Dubai — Shopify and custom stores, web apps, AI automation, backends and deep Odoo & Zoho integrations, engineered for speed, scale and unified data.",
  keywords: [
    "e-commerce development Dubai",
    "Shopify development Dubai",
    "web development UAE",
    "Odoo integration Dubai",
    "Zoho integration UAE",
    "custom software Dubai",
  ],
  alternates: { canonical: "/services/software" },
  openGraph: {
    url: "/services/software",
    title: "E-commerce & Software Development in Dubai | YARI",
    description:
      "Shopify and custom stores, web apps, AI automation and Odoo & Zoho integrations for Dubai and GCC brands.",
  },
};

export default function SoftwareServicesPage() {
  return <SoftwareServicesContent />;
}
