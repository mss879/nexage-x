import type { Metadata } from "next";
import ServicesContent from "@/components/pages/ServicesContent";

export const metadata: Metadata = {
  title: "E-commerce, Software & Logistics Services in Dubai",
  description:
    "Two practices, one stack. YARI's software services (e-commerce, web apps, AI & Odoo/Zoho integrations) and logistics services (fulfilment, freight & operations) for brands in Dubai and the GCC.",
  alternates: { canonical: "/services" },
  openGraph: {
    url: "/services",
    title: "E-commerce, Software & Logistics Services in Dubai | YARI",
    description:
      "Software and logistics under one roof for Dubai brands — storefronts, integrations and end-to-end fulfilment.",
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
