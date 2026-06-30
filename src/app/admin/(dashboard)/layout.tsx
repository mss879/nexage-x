"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KanbanSquare, Inbox, LogOut, ShieldCheck, Menu, X, LayoutDashboard } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch logged-in user email on mount
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setEmail(data.user.email ?? "Admin");
      }
    });
  }, []);

  const handleLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/crm", label: "CRM Pipeline", icon: KanbanSquare },
    { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  ];

  return (
    <div className="flex min-h-screen bg-[#050508] text-white">
      {/* Mobile Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0d]/80 px-6 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">YARI ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02]"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-40 w-64 border-r border-[#df8326]/15 bg-gradient-to-b from-[#0a0a0d] via-[#050508] to-[#120d0a] px-5 py-6 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Golden ambient glow inside the sidebar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#df8326]/8 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#df8326]/30 bg-[#df8326]/10 text-[#df8326] shadow-[0_0_15px_rgba(223,131,38,0.2)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-syne text-sm font-bold uppercase tracking-tight text-white leading-none">YARI Studio</span>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500">Control Panel</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 font-sans text-sm font-medium transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-[#df8326]/15 to-[#df8326]/5 border border-[#df8326]/40 text-[#df8326] shadow-[0_0_15px_rgba(223,131,38,0.15)]"
                        : "border border-transparent text-zinc-400 hover:bg-[#df8326]/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer - Logged in user & Signout */}
          <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4">
            <div className="flex flex-col px-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Authenticated As</span>
              <span className="mt-0.5 truncate font-sans text-xs text-zinc-300" title={email ?? ""}>
                {email ?? "Loading..."}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] py-2.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64 pt-16 lg:pt-0">
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
