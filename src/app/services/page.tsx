import type { Metadata } from "next";
import ServicesContent from "@/components/pages/ServicesContent";

export const metadata: Metadata = {
  title: "Services // YARI",
  description:
    "Two practices, one stack: YARI Software Services (web, apps, AI & integrations) and Logistics Services (fulfilment, freight & operations) for modern brands.",
};

export default function ServicesPage() {
  return <ServicesContent />;
}
