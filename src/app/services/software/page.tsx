import type { Metadata } from "next";
import SoftwareServicesContent from "@/components/pages/SoftwareServicesContent";

export const metadata: Metadata = {
  title: "Software Services // YARI",
  description:
    "Custom websites, web apps, e-commerce, AI automation, backends and deep Odoo & Zoho integrations — engineered for speed, scale and unified data.",
};

export default function SoftwareServicesPage() {
  return <SoftwareServicesContent />;
}
