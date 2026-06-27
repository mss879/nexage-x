import type { Metadata } from "next";
import LogisticsServicesContent from "@/components/pages/LogisticsServicesContent";

export const metadata: Metadata = {
  title: "Logistics Services // YARI",
  description:
    "Fulfilment, warehousing, freight, COD and returns — operated as one connected system and synced live with your digital stack.",
};

export default function LogisticsServicesPage() {
  return <LogisticsServicesContent />;
}
