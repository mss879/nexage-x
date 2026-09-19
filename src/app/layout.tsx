import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Syne,
  Michroma,
  Plus_Jakarta_Sans,
  Orbitron,
  Mohave,
  Rock_Salt,
} from "next/font/google";
import "./globals.css";
import MenuProvider from "@/components/menu/MenuProvider";
import LazyChatWidget from "@/components/LazyChatWidget";
import Tracker from "@/components/analytics/Tracker";
import JsonLd from "@/components/seo/JsonLd";
import { SITE, SITE_URL, PRIMARY_KEYWORDS } from "@/lib/site";
import {
  organizationSchema,
  websiteSchema,
  professionalServiceSchema,
} from "@/lib/structured-data";

// All site fonts are self-hosted via next/font (zero render-blocking requests,
// automatic preload + size-adjusted fallbacks). globals.css maps the design
// tokens (--font-syne, --font-mohave, …) onto these variables.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne-next",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-next",
  subsets: ["latin"],
  display: "swap",
});

// Hero headline — the extended geometric face closest to the YARI wordmark
const michroma = Michroma({
  variable: "--font-michroma-next",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Accent fonts used below the fold — self-hosted but not preloaded
const orbitron = Orbitron({
  variable: "--font-orbitron-next",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const mohave = Mohave({
  variable: "--font-mohave-next",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const rockSalt = Rock_Salt({
  variable: "--font-rock-salt-next",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "YARI — E-commerce, Software & Logistics Studio in Dubai",
    template: "%s | YARI",
  },
  description:
    "YARI is a Dubai e-commerce, software and logistics studio — online stores, custom software, Odoo & Zoho integrations and fulfilment for UAE and GCC brands.",
  keywords: PRIMARY_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  // No canonical here on purpose: a layout-level canonical is inherited by every
  // route that forgets its own (404s, /admin), pointing them all at the homepage.
  // Each page sets its own via pageMetadata() in lib/metadata.ts.
  category: "technology",
  // Google Search Console HTML-tag verification — set the token at deploy time
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
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
  // Site-wide fallbacks only. Every page builds its own complete openGraph +
  // twitter block via pageMetadata() — page-level objects replace these, they
  // are not merged.
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${syne.variable} ${michroma.variable} ${plusJakartaSans.variable} ${orbitron.variable} ${mohave.variable} ${rockSalt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-[#df8326] focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(),
            professionalServiceSchema(),
          ]}
        />
        <MenuProvider>
          {children}
          <LazyChatWidget />
          <Tracker />
        </MenuProvider>
      </body>
    </html>
  );
}
