import type { Metadata } from "next";
import ContactContent from "@/components/pages/ContactContent";
import { pageMetadata } from "@/lib/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { faqSchema, pageBreadcrumb } from "@/lib/structured-data";
import { CONTACT_FAQS } from "@/content/contact-faqs";

export const metadata: Metadata = pageMetadata({
  title: "Contact YARI — Start Your Dubai E-commerce Project",
  description:
    "Start a project with YARI in Dubai. Tell us about your brand and we'll map the e-commerce, software and logistics to scale it. Call +971 50 863 2422.",
  socialDescription:
    "Tell us what you're building. We usually reply within one business day. Dubai · UAE.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          pageBreadcrumb(["Contact", "/contact"]),
          faqSchema(CONTACT_FAQS),
        ]}
      />
      <ContactContent />
    </>
  );
}
