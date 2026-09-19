import type { Metadata } from "next";
import TermsContent from "@/components/pages/TermsContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms for using the YARI website, including our AI chat assistant, intellectual property, liability and governing law.",
  socialDescription:
    "The terms for using the YARI website.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return <TermsContent />;
}
