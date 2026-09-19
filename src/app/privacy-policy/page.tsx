import type { Metadata } from "next";
import PrivacyPolicyContent from "@/components/pages/PrivacyPolicyContent";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How YARI collects, uses and protects personal information on our website — contact form, newsletter and AI chat assistant — and the rights you have.",
  socialDescription:
    "How YARI collects, uses and protects personal information on our website.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
