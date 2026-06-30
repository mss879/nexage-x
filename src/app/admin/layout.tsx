import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YARI Admin Portal",
  description: "Authorized access to contact inquiries and CRM pipeline.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#050508] text-white">{children}</div>;
}
