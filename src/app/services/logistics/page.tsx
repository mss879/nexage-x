import type { Metadata } from "next";
import LogisticsServicesContent from "@/components/pages/LogisticsServicesContent";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { pageBreadcrumb, serviceSchema } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "E-commerce Fulfilment & Logistics in Dubai",
  description:
    "Order fulfilment, warehousing, freight, COD and returns in Dubai and the GCC — operated as one connected system and synced live with your storefront and ERP.",
  socialDescription:
    "Fulfilment, warehousing, freight, COD and returns for Dubai brands — synced live with your store and ERP.",
  keywords: [
    "ecommerce fulfilment Dubai",
    "order fulfilment Dubai",
    "3PL Dubai",
    "warehousing Dubai",
    "last mile delivery Dubai",
    "COD management UAE",
  ],
  path: "/services/logistics",
});

export default function LogisticsServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          pageBreadcrumb(["Services", "/services"], ["Logistics", "/services/logistics"]),
          serviceSchema({
            name: "E-commerce Fulfilment & Logistics",
            serviceType: "E-commerce order fulfilment and logistics",
            description:
              "Order fulfilment, warehousing, freight, COD management and returns in Dubai and the GCC, synced live with your storefront and ERP.",
            path: "/services/logistics",
            // Mirrors the service cards on the page
            offers: [
              "Fulfilment Management",
              "Warehousing",
              "Freight & Shipping",
              "COD Management",
              "Returns & Reverse Logistics",
              "International Shipping",
              "Inventory Sync",
              "Last-Mile Delivery",
            ],
          }),
        ]}
      />
      <LogisticsServicesContent />
    </>
  );
}
