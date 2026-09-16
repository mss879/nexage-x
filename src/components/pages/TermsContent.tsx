import React from "react";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/pages/LegalPage";
import { SITE } from "@/lib/site";

const UPDATED = "16 September 2026";
const [UAE_PHONE, UK_PHONE] = SITE.phones;

const sections: LegalSection[] = [
  {
    id: "about-these-terms",
    title: "About these terms",
    content: (
      <p>
        This website is operated by {SITE.legalName}{" "}(&ldquo;YARI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), based in
        Dubai, United Arab Emirates. These terms cover your use of the website only. Any project work we carry out for
        you is governed by the separate proposal, statement of work or agreement we sign together.
      </p>
    ),
  },
  {
    id: "using-the-website",
    title: "Using the website",
    content: (
      <>
        <p>You may browse and use the website for lawful purposes. You agree not to:</p>
        <ul>
          <li>use it in a way that breaks any law or infringes anyone&rsquo;s rights;</li>
          <li>try to gain unauthorised access to the website, our systems or our data;</li>
          <li>introduce malicious code, scrape the site with automated tools or overload it;</li>
          <li>submit false, misleading or abusive information through our forms or chat.</li>
        </ul>
      </>
    ),
  },
  {
    id: "services-and-quotes",
    title: "Our services, proposals and quotes",
    content: (
      <p>
        Service descriptions, examples, timelines and figures on this website are general information and may change —
        they aren&rsquo;t an offer. Prices, scope and delivery dates only become binding once they are set out in a
        written proposal or agreement accepted by both sides.
      </p>
    ),
  },
  {
    id: "ai-chat-assistant",
    title: "AI chat assistant",
    content: (
      <p>
        Our chat assistant gives automated answers that may be incomplete or wrong. Nothing it says is professional,
        legal or financial advice, or a binding quote or commitment from YARI. Please confirm anything important with
        our team.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: (
      <p>
        The website and its content — including the YARI name and logo, text, graphics, 3D artwork, images and code —
        belong to us or our licensors and are protected by intellectual-property laws. You may view our pages and share
        links to them, but you may not copy, modify, republish or commercially use our content or branding without our
        written permission.
      </p>
    ),
  },
  {
    id: "newsletter",
    title: "Newsletter",
    content: (
      <p>
        If you subscribe, we&rsquo;ll occasionally email insights and updates, and you can unsubscribe at any time. Our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> explains how we handle your email address.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-party links and services",
    content: (
      <p>
        The website may link to, or rely on, third-party websites and services such as social media platforms. We
        don&rsquo;t control them and aren&rsquo;t responsible for their content, availability or practices.
      </p>
    ),
  },
  {
    id: "no-warranties",
    title: "No warranties",
    content: (
      <p>
        We work to keep the website accurate and available, but it is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;. To the extent permitted by law, we don&rsquo;t guarantee that it will be error-free,
        uninterrupted or free of harmful components.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    content: (
      <p>
        To the fullest extent permitted by law, YARI is not liable for any indirect, incidental or consequential loss,
        or for loss of profit, revenue, data or goodwill, arising from your use of — or inability to use — the website.
        Nothing in these terms limits any liability that cannot be limited under applicable law.
      </p>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    content: (
      <p>
        Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we collect and use personal information
        through the website.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <p>
        These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai. Any dispute
        relating to them is subject to the exclusive jurisdiction of the courts of Dubai.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms from time to time. The date at the top of this page shows the latest version, and
        continuing to use the website after an update means you accept the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        {SITE.legalName} · Dubai, United Arab Emirates
        <br />
        Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <br />
        Phone: <a href={`tel:${UAE_PHONE.e164}`}>{UAE_PHONE.number}</a> ({UAE_PHONE.label}) ·{" "}
        <a href={`tel:${UK_PHONE.e164}`}>{UK_PHONE.number}</a> ({UK_PHONE.label})
      </p>
    ),
  },
];

export default function TermsContent() {
  return (
    <LegalPage
      title="Terms &"
      accent="Conditions."
      updated={UPDATED}
      intro="The rules for using the YARI website. By using the site you agree to these terms — if you don't, please don't use it."
      sections={sections}
    />
  );
}
