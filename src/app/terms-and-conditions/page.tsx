import type { Metadata } from "next";
import TermsContent from "@/components/pages/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for using the YARI website, including our AI chat assistant, intellectual property, liability and governing law.",
  alternates: { canonical: "/terms-and-conditions" },
  openGraph: {
    url: "/terms-and-conditions",
    title: "Terms & Conditions | YARI",
    description: "The terms for using the YARI website.",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
