import type { Metadata } from "next";
import ContactContent from "@/components/pages/ContactContent";

export const metadata: Metadata = {
  title: "Contact YARI — Start Your Dubai E-commerce Project",
  description:
    "Start a project with YARI in Dubai. Tell us about your brand and we'll map the e-commerce, software and logistics to scale it across the UAE and GCC. Call +971 50 863 2422.",
  alternates: { canonical: "/contact" },
  openGraph: {
    url: "/contact",
    title: "Contact YARI — Start Your Dubai E-commerce Project | YARI",
    description:
      "Tell us what you're building. We usually reply within one business day. Dubai · UAE.",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
