import type { Metadata } from "next";
import ContactContent from "@/components/pages/ContactContent";

export const metadata: Metadata = {
  title: "Contact // YARI",
  description:
    "Start a project with YARI. Tell us about your brand and we'll map the design, software and logistics to scale it.",
};

export default function ContactPage() {
  return <ContactContent />;
}
