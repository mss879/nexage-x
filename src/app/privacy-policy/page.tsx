import type { Metadata } from "next";
import PrivacyPolicyContent from "@/components/pages/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How YARI collects, uses and protects personal information on our website — contact form, newsletter and AI chat assistant — and the rights you have.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    url: "/privacy-policy",
    title: "Privacy Policy | YARI",
    description: "How YARI collects, uses and protects personal information on our website.",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
