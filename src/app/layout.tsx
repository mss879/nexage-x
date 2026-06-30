import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MenuProvider from "@/components/menu/MenuProvider";
import JsonLd from "@/components/seo/JsonLd";
import { SITE, SITE_URL, PRIMARY_KEYWORDS } from "@/lib/site";
import {
  organizationSchema,
  websiteSchema,
  professionalServiceSchema,
} from "@/lib/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "YARI — E-commerce, Software & Logistics Studio in Dubai",
    template: "%s | YARI",
  },
  description:
    "YARI is a Dubai-based e-commerce, software and logistics studio. We design, build and ship the whole stack — high-converting online stores, custom software, Odoo & Zoho integrations and end-to-end fulfilment — for ambitious brands across the UAE and GCC.",
  keywords: PRIMARY_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  alternates: {
    canonical: "/",
  },
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_AE",
    url: SITE_URL,
    title: "YARI — E-commerce, Software & Logistics Studio in Dubai",
    description:
      "Design, software and logistics under one roof. High-converting online stores, Odoo & Zoho integrations and end-to-end fulfilment for brands in Dubai and the GCC.",
    // og:image / twitter:image are injected site-wide by app/opengraph-image.tsx.
  },
  twitter: {
    card: "summary_large_image",
    title: "YARI — E-commerce, Software & Logistics Studio in Dubai",
    description:
      "Design, software and logistics under one roof for ambitious brands in Dubai and the GCC.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
            professionalServiceSchema(),
          ]}
        />
        <MenuProvider>{children}</MenuProvider>
      </body>
    </html>
  );
}
