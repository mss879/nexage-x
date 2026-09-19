import type { Metadata } from "next";
import ServicesContent from "@/components/pages/ServicesContent";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { pageBreadcrumb, serviceSchema } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "E-commerce, Software & Logistics Services in Dubai",
  description:
    "YARI's software services (e-commerce, web apps, AI, Odoo & Zoho integrations) and logistics services (fulfilment, freight, operations) for Dubai and GCC brands.",
  socialDescription:
    "Software and logistics under one roof for Dubai brands — storefronts, integrations and end-to-end fulfilment.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          pageBreadcrumb(["Services", "/services"]),
          serviceSchema({
            name: "E-commerce, Software & Logistics Services",
            serviceType: "E-commerce development and fulfilment",
            description:
              "Software services (e-commerce, web apps, AI, Odoo & Zoho integrations) and logistics services (fulfilment, freight, operations) for brands in Dubai and the GCC.",
            path: "/services",
            offers: ["Software Services", "Logistics Services"],
          }),
        ]}
      />
      <ServicesContent />
    </>
  );
}
