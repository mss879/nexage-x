"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  KanbanSquare,
  Inbox,
  KeyRound,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ListTodo,
  Mail,
  MessageSquare,
  ReceiptText,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/admin/ui";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/admin";
import { cn } from "@/lib/utils";
import ChangePasswordModal from "./ChangePasswordModal";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Also active on pages underneath it (an invoice inside "Invoices"). */
  nested?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/todos", label: "To-dos", icon: ListTodo },
  { href: "/admin/clients", label: "Clients", icon: Building2, nested: true },
  { href: "/admin/analytics", label: "Site analytics", icon: BarChart3 },
  { href: "/admin/chats", label: "AI chats", icon: MessageSquare },
  { href: "/admin/crm", label: "CRM pipeline", icon: KanbanSquare },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/subscribers", label: "Email list", icon: Mail },
];

const FINANCE_LINKS: NavLink[] = [
  { href: "/admin/finance", label: "Analytics", icon: TrendingUp },
  { href: "/admin/finance/invoices", label: "Invoices", icon: ReceiptText, nested: true },
  { href: "/admin/finance/ledger", label: "Expenses & income", icon: Wallet },
];

/** Only a super admin manages who can sign in. */
const TEAM_LINK: NavLink = { href: "/admin/team", label: "Team", icon: UsersRound };

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
  admin,
  chatsWaiting = 0,
  todosDue = 0,
  children,
}: {
  admin: { fullName: string; email: string; role: AdminRole; legacy: boolean };
  /** Conversations where a visitor asked for a person and nobody has stepped in yet. */
  chatsWaiting?: number;
  /** The signed-in person's open to-dos that are due today or overdue. */
  todosDue?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Until the team migration has been run the Team page explains what to do, so it stays reachable
  const canManageTeam = admin.legacy || admin.role === "super_admin";

  const badges: Record<string, { count: number; title: string }> = {
    "/admin/chats": { count: chatsWaiting, title: `${chatsWaiting} visitor${chatsWaiting === 1 ? "" : "s"} asked for a person` },
    "/admin/todos": { count: todosDue, title: `${todosDue} of your to-dos ${todosDue === 1 ? "is" : "are"} due today or overdue` },
  };

  const handleLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const renderLink = (link: NavLink) => {
    const Icon = link.icon;
    const active = pathname === link.href || (link.nested === true && pathname.startsWith(`${link.href}/`));
    const badge = badges[link.href];
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
        {badge && badge.count > 0 && (
          <span
            className="ml-auto rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-stone-900"
            title={badge.title}
          >
            {badge.count}
          </span>
        )}
      </Link>
    );
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
          "fixed bottom-0 left-0 top-0 z-40 flex w-60 flex-col justify-between gap-6 overflow-y-auto border-r border-stone-200 bg-white px-3 py-5 transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="px-3">
            <Brand />
          </div>

          <nav aria-label="Admin" className="flex flex-col gap-0.5">
            {NAV_LINKS.map(renderLink)}
            {canManageTeam && renderLink(TEAM_LINK)}
          </nav>

          <nav aria-labelledby="nav-finance" className="rounded-xl border border-stone-200 bg-stone-50 p-1.5">
            <h2 id="nav-finance" className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold text-stone-500">
              Finance
            </h2>
            <div className="flex flex-col gap-0.5">{FINANCE_LINKS.map(renderLink)}</div>
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200 px-3 pt-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-500">
              {admin.legacy ? "Signed in as" : ADMIN_ROLE_LABELS[admin.role]}
            </span>
            <span className="truncate text-xs font-medium text-stone-800" title={admin.email}>
              {admin.fullName || admin.email}
            </span>
            {admin.fullName && (
              <span className="truncate text-[11px] text-stone-500" title={admin.email}>
                {admin.email}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setChangingPassword(true)} className="w-full justify-start px-2">
            <KeyRound className="h-3.5 w-3.5" />
            Change password
          </Button>
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

      {changingPassword && <ChangePasswordModal onClose={() => setChangingPassword(false)} />}
    </div>
  );
}
