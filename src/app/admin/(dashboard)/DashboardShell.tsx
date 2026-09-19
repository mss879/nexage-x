"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, KanbanSquare, Inbox, LogOut, Menu, X, LayoutDashboard, Mail } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/crm", label: "CRM pipeline", icon: KanbanSquare },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/subscribers", label: "Email list", icon: Mail },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/yari-logo-black.png" alt="YARI" width={80} height={26} className="h-[22px] w-auto" />
      <span className="rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500">
        Admin
      </span>
    </div>
  );
}

export default function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white px-4 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          {sidebarOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-40 flex w-60 flex-col justify-between border-r border-stone-200 bg-white px-3 py-5 transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="px-3">
            <Brand />
          </div>

          <nav aria-label="Admin" className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                    active ? "bg-gold-50 text-gold-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-gold-600" : "text-stone-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 px-3 pt-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-500">Signed in as</span>
            <span className="truncate text-xs font-medium text-stone-800" title={email}>
              {email}
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout} className="w-full">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-stone-900/30 lg:hidden" />
      )}

      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pl-60 lg:pt-0">
        <main className="mx-auto w-full max-w-7xl flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
