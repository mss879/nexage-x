import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Nexage-X // Welcome",
  description: "Experience Nexage-X, a responsive and high-performance visual interface built with Next.js 16 and React 19.",
  keywords: [
    "Next.js 16",
    "React 19",
    "Framer Motion",
    "High Fidelity Web Design"
  ],
  authors: [{ name: "Nexage-X Core Team" }],
  openGraph: {
    title: "Nexage-X // Welcome",
    description: "Experience Nexage-X, a responsive and high-performance visual interface built with Next.js 16 and React 19.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexage-X UI Engine",
    description: "Responsive and high-performance visual interface.",
  }
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
