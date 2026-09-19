import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "YARI Admin Portal",
  description: "Authorized access to contact inquiries and CRM pipeline.",
  robots: { index: false, follow: false },
};

// The admin is a light workspace (DESIGN.md §9) — override the site's dark chrome colour
export const viewport: Viewport = {
  themeColor: "#fafaf9",
  colorScheme: "light",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-theme min-h-screen font-sans antialiased">{children}</div>;
}
