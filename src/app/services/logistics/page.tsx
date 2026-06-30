import type { Metadata } from "next";
import LogisticsServicesContent from "@/components/pages/LogisticsServicesContent";

export const metadata: Metadata = {
  title: "E-commerce Fulfilment & Logistics in Dubai",
  description:
    "Order fulfilment, warehousing, freight, COD and returns in Dubai and the GCC — operated as one connected system and synced live with your storefront and ERP.",
  keywords: [
    "ecommerce fulfilment Dubai",
    "order fulfilment Dubai",
    "3PL Dubai",
    "warehousing Dubai",
    "last mile delivery Dubai",
    "COD management UAE",
  ],
  alternates: { canonical: "/services/logistics" },
  openGraph: {
    url: "/services/logistics",
    title: "E-commerce Fulfilment & Logistics in Dubai | YARI",
    description:
      "Fulfilment, warehousing, freight, COD and returns for Dubai brands — synced live with your store and ERP.",
  },
};

export default function LogisticsServicesPage() {
  return <LogisticsServicesContent />;
}
