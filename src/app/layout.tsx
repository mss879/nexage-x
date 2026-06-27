import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MenuProvider from "@/components/menu/MenuProvider";

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
  title: "YARI // Welcome",
  description: "Experience YARI, a responsive and high-performance visual interface built with React 19.",
  keywords: [
    "YARI",
    "React 19",
    "Framer Motion",
    "High Fidelity Web Design"
  ],
  authors: [{ name: "YARI Core Team" }],
  openGraph: {
    title: "YARI // Welcome",
    description: "Experience YARI, a responsive and high-performance visual interface built with React 19.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YARI UI Engine",
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
      <body className="min-h-full flex flex-col">
        <MenuProvider>{children}</MenuProvider>
      </body>
    </html>
  );
}
