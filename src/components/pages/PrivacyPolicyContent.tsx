import React from "react";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/pages/LegalPage";
import { SITE, SITE_URL } from "@/lib/site";

// Written to match how the site actually handles data (contact form + newsletter → Supabase,
// AI chat → OpenAI, first-party cookieless statistics via /api/track, no advertising or
// third-party analytics). Update it if any of that changes.
const UPDATED = "19 September 2026";
const [UAE_PHONE, UK_PHONE] = SITE.phones;
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    content: (
      <>
        <p>
          {SITE.legalName}{" "}(&ldquo;YARI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an e-commerce, software and
          logistics studio based in Dubai, United Arab Emirates. We are responsible for the personal information
          collected through {DOMAIN}.
        </p>
        <p>
          Questions about this policy or your data? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call{" "}
          <a href={`tel:${UAE_PHONE.e164}`}>{UAE_PHONE.number}</a>.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <ul>
          <li>
            <strong>Contact form</strong> — your name, email address, company, budget range, the services you&rsquo;re
            interested in and your message.
          </li>
          <li>
            <strong>Newsletter</strong> — your email address and whether you&rsquo;re subscribed.
          </li>
          <li>
            <strong>AI chat assistant</strong> — the messages you send. If you share contact details in the chat (such
            as your name, email, company or budget), we save them with a short excerpt of the conversation so our team
            can follow up.
          </li>
          <li>
            <strong>Emails and calls</strong> — whatever you choose to share when you contact us directly.
          </li>
          <li>
            <strong>Technical data</strong> — like most websites, our hosting infrastructure automatically records basic
            request data (such as IP address, browser type and pages requested) to keep the site secure and working.
          </li>
        </ul>
        <p>We don&rsquo;t ask for sensitive personal information — please don&rsquo;t share it through the form or chat.</p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    content: (
      <>
        <ul>
          <li>To reply to your enquiry and prepare proposals or quotes.</li>
          <li>To deliver and manage projects you engage us for.</li>
          <li>To send our newsletter if you subscribed — it&rsquo;s optional and you can unsubscribe at any time.</li>
          <li>To run the AI chat assistant so it can answer questions about our services.</li>
          <li>To keep the website secure, prevent spam and abuse, and meet our legal obligations.</li>
        </ul>
        <p>
          We don&rsquo;t sell your personal information, and we don&rsquo;t use it for automated decisions that have
          legal or similarly significant effects on you.
        </p>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "Legal basis",
    content: (
      <p>
        We handle personal data in line with applicable data-protection laws, including the UAE Personal Data Protection
        Law (Federal Decree-Law No. 45 of 2021) and, where they apply to you, the UK GDPR and EU GDPR. Depending on the
        situation, we rely on your consent (for example, a newsletter sign-up), steps you ask us to take before entering
        a contract (answering an enquiry), our legitimate interests in running and securing our business, or our legal
        obligations.
      </p>
    ),
  },
  {
    id: "ai-chat-assistant",
    title: "Our AI chat assistant",
    content: (
      <>
        <p>
          The chat assistant on our website is powered by OpenAI: the messages you send are passed to OpenAI to
          generate a reply. Responses are automated and can be inaccurate, so please don&rsquo;t rely on them for
          important decisions and avoid sharing sensitive information in the chat.
        </p>
        <p>
          We keep a record of chat conversations so our team can review them, improve the assistant and follow up. A
          member of the YARI team may read a conversation and join it to reply in person — the chat tells you when that
          happens. Your conversation is linked to your browser so you can pick it up again; starting a new chat from
          the reset button unlinks it. When a conversation includes an email address, we store the lead details
          described above in our systems. You can ask us to delete a conversation at any time.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    content: (
      <>
        <p>
          We only share personal information with providers that help us run the website and our business, under
          appropriate confidentiality and data-protection terms:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — secure database hosting for enquiries, newsletter subscriptions and our CRM.
          </li>
          <li>
            <strong>OpenAI</strong> — generating replies in the AI chat assistant.
          </li>
          <li>
            <strong>Hosting, email and IT providers</strong> — keeping the website online and communicating with you.
          </li>
          <li>
            <strong>Professional advisers and authorities</strong> — where required by law or to protect our rights.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International transfers",
    content: (
      <p>
        Some of our providers store or process data outside the UAE, for example in the European Union or the United
        States. When that happens, we rely on their contractual and security safeguards to protect your information.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    content: (
      <ul>
        <li>
          <strong>Enquiries and CRM records</strong> — for as long as we need them to respond to you and manage our
          relationship, then deleted or anonymised, unless we must keep them for legal or accounting reasons.
        </li>
        <li>
          <strong>Newsletter</strong> — until you unsubscribe. We keep a record of the opt-out so we don&rsquo;t email
          you again.
        </li>
        <li>
          <strong>Technical logs</strong> — for a limited period set by our hosting providers.
        </li>
      </ul>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & analytics",
    content: (
      <>
        <p>
          This website doesn&rsquo;t use advertising or analytics cookies. The only cookies we set are strictly
          necessary ones for secure sign-in to our private admin area, which visitors don&rsquo;t use.
        </p>
        <p>
          To understand how the site is used we run our own privacy-friendly statistics — no third-party analytics
          service is involved. We count page views, the referring website, the country, device type and browser, a few
          interactions (such as a form being sent), and page-speed measurements. We don&rsquo;t store your IP address,
          set a cookie or build a profile: visits are counted with an anonymous code that changes every day, so it
          can&rsquo;t be linked to you or followed from one day to the next. If your browser sends a &ldquo;Do Not
          Track&rdquo; or Global Privacy Control signal, we don&rsquo;t record the visit at all.
        </p>
        <p>
          If we add marketing or third-party analytics tools in future, we&rsquo;ll update this policy and ask for your
          consent where the law requires it.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>access the personal information we hold about you;</li>
          <li>ask us to correct or delete it;</li>
          <li>object to, or ask us to restrict, how we use it;</li>
          <li>withdraw your consent at any time — for example, by unsubscribing from the newsletter;</li>
          <li>receive a copy of your data in a portable format.</li>
        </ul>
        <p>
          To make a request, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we&rsquo;ll respond within the
          time required by applicable law. You can also complain to your data-protection authority — the UAE Data Office
          in the UAE, or the Information Commissioner&rsquo;s Office (ICO) in the UK.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>
        We use reputable providers, encrypted connections (HTTPS) and access controls to protect your information. No
        system is completely secure, so please contact us straight away if you believe your data has been compromised.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        Our website and services are intended for businesses and aren&rsquo;t directed at children under 18. We
        don&rsquo;t knowingly collect their personal information.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy as our website or services change. The date at the top of this page shows when it was
        last revised. See also our <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
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

export default function PrivacyPolicyContent() {
  return (
    <LegalPage
      title="Privacy"
      accent="Policy."
      updated={UPDATED}
      intro="What personal information we collect through this website, how we use it and the choices you have — kept short and specific to how our site actually works."
      sections={sections}
    />
  );
}
