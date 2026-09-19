import type { Metadata } from "next";
import SoftwareServicesContent from "@/components/pages/SoftwareServicesContent";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { pageBreadcrumb, serviceSchema } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "E-commerce & Software Development in Dubai",
  description:
    "E-commerce website development in Dubai — Shopify and custom stores, web apps, AI automation and deep Odoo & Zoho integrations built for speed and scale.",
  socialDescription:
    "Shopify and custom stores, web apps, AI automation and Odoo & Zoho integrations for Dubai and GCC brands.",
  keywords: [
    "e-commerce development Dubai",
    "Shopify development Dubai",
    "web development UAE",
    "Odoo integration Dubai",
    "Zoho integration UAE",
    "custom software Dubai",
  ],
  path: "/services/software",
});

export default function SoftwareServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          pageBreadcrumb(["Services", "/services"], ["Software", "/services/software"]),
          serviceSchema({
            name: "E-commerce & Software Development",
            serviceType: "E-commerce website and software development",
            description:
              "Shopify and custom online stores, web apps, AI automation, custom backends and Odoo & Zoho integrations for brands in Dubai and the GCC.",
            path: "/services/software",
            // Mirrors the service cards on the page
            offers: [
              "Custom Web & Web Apps",
              "Smart Websites",
              "E-commerce & Shopify",
              "AI Assistants & Chatbots",
              "Workflow Automation",
              "Custom Backend Systems",
              "Website + Odoo & Zoho Integration",
              "Brand Kits & Identity",
            ],
          }),
        ]}
      />
      <SoftwareServicesContent />
    </>
  );
}
