import React from "react";
import Link from "next/link";
import { Inbox, KanbanSquare, DollarSign, Award, ArrowUpRight, FolderSync, Percent, Users } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import MonthCalendar, { type CalendarItem } from "@/components/admin/MonthCalendar";
import { Badge, Card, CardHeader, EmptyState, ErrorBanner, PageHeader, StatCard } from "@/components/admin/ui";
import { INQUIRY_STATUS_TONE, LEAD_STAGE_TONE } from "@/components/admin/status";
import { isOpenProject, type ProjectStatus } from "@/lib/clients";
import { addDays, todayInDubai } from "@/lib/dates";
import { formatMoney } from "@/lib/invoices";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message?: string;
  interests: string[];
  status: "new" | "converted" | "archived";
}

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email?: string;
  company?: string;
  budget?: string;
  message?: string;
  interests?: string[];
  stage: "Lead" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
  value: number;
  notes?: string;
}

/**
 * Everything with a date on it: to-do deadlines, unpaid invoices' due dates and
 * project deadlines. Each source is optional — a table whose migration hasn't
 * been run yet simply contributes nothing.
 */
async function loadCalendar(supabase: SupabaseClient, today: string): Promise<{ items: CalendarItem[]; todosReady: boolean }> {
  // Finished to-dos drop off the calendar after a while; open ones stay however late they are
  const doneSince = addDays(today, -45);

  const [todosRes, teamRes, invoicesRes, projectsRes] = await Promise.all([
    supabase
      .from("todos")
      .select("id, title, status, priority, due_date, assignee_id")
      .not("due_date", "is", null)
      .or(`status.neq.done,due_date.gte.${doneSince}`)
      .limit(1000),
    supabase.from("team_members").select("id, full_name"),
    supabase.from("invoices").select("*").eq("status", "sent").not("due_date", "is", null).limit(500),
    supabase.from("projects").select("id, name, status, due_date, client_id, clients(company, contact_name)").not("due_date", "is", null).limit(500),
  ]);

  const names = new Map((teamRes.data ?? []).map((member) => [member.id as string, member.full_name as string]));
  const items: CalendarItem[] = [];

  for (const todo of todosRes.data ?? []) {
    items.push({
      id: todo.id,
      date: todo.due_date,
      kind: "todo",
      title: todo.title,
      detail: todo.assignee_id ? (names.get(todo.assignee_id) ?? "Unassigned") : "Unassigned",
      href: `/admin/todos?open=${todo.id}`,
      done: todo.status === "done",
      important: todo.priority === "high",
    });
  }

  for (const inv of invoicesRes.data ?? []) {
    // amount_paid only exists once the payments migration has been run
    const owed = Math.max(Number(inv.total) - Number(inv.amount_paid ?? 0), 0);
    items.push({
      id: inv.id,
      date: inv.due_date,
      kind: "invoice",
      title: `${inv.number}${inv.client_name ? ` · ${inv.client_name}` : ""}`,
      detail: `${formatMoney(owed, inv.currency)} to collect`,
      href: `/admin/finance/invoices/${inv.id}`,
    });
  }

  for (const project of (projectsRes.data ?? []) as unknown as {
    id: string;
    name: string;
    status: ProjectStatus;
    due_date: string;
    client_id: string;
    clients: { company: string; contact_name: string } | null;
  }[]) {
    if (project.status === "cancelled") continue;
    items.push({
      id: project.id,
      date: project.due_date,
      kind: "project",
      title: project.name,
      detail: project.clients?.company || project.clients?.contact_name || undefined,
      href: `/admin/clients/${project.client_id}`,
      done: !isOpenProject(project.status),
    });
  }

  return { items, todosReady: !todosRes.error };
}

export default async function AdminDashboardPage() {
  let inquiries: Inquiry[] = [];
  let leads: Lead[] = [];
  let fetchError: string | null = null;
  // null until the analytics migration has been applied
  let weekVisitors: number | null = null;
  const today = todayInDubai();
  let calendar: { items: CalendarItem[]; todosReady: boolean } = { items: [], todosReady: false };

  try {
    const supabase = await requireAdmin();
    
    // Fetch inquiries and leads in parallel
    const [inquiriesRes, leadsRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("*").order("updated_at", { ascending: false }),
    ]);

    if (inquiriesRes.error) throw inquiriesRes.error;
    if (leadsRes.error) throw leadsRes.error;

    inquiries = inquiriesRes.data || [];
    leads = leadsRes.data || [];

    const now = new Date();
    const { data: traffic } = await supabase.rpc("analytics_report", {
      p_from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      p_to: now.toISOString(),
    });
    if (traffic?.totals) weekVisitors = Number(traffic.totals.visitors);

    calendar = await loadCalendar(supabase, today);
  } catch (err: any) {
    console.error("Dashboard data fetch error:", err);
    fetchError = err.message || "Failed to load database records.";
  }

  // 1. Calculate Summary Metrics
  const totalInquiries = inquiries.length;
  const newInquiriesCount = inquiries.filter((i) => i.status === "new").length;
  const totalLeads = leads.length;
  
  const totalPipelineValue = leads.reduce((sum, l) => sum + Number(l.value || 0), 0);
  const wonDealsValue = leads
    .filter((l) => l.stage === "Won")
    .reduce((sum, l) => sum + Number(l.value || 0), 0);

  // 2. Process Service Interests Breakdown (Website Data Preview)
  const interestCounts: Record<string, number> = {};
  inquiries.forEach((inq) => {
    if (inq.interests) {
      inq.interests.forEach((interest) => {
        interestCounts[interest] = (interestCounts[interest] || 0) + 1;
      });
    }
  });

  const sortedInterests = Object.entries(interestCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const recentInquiries = inquiries.slice(0, 4);
  const recentLeads = leads.slice(0, 4);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const shortDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const convertedCount = inquiries.filter((i) => i.status === "converted").length;
  const conversionRate = totalInquiries > 0 ? Math.round((convertedCount / totalInquiries) * 100) : 0;

  const viewAll = (href: string) => (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-gold-700 transition-colors hover:text-gold-800"
    >
      View all
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Leads, pipeline and revenue captured from the YARI website." />

      {fetchError && (
        <ErrorBanner>
          <strong className="font-semibold">Couldn&rsquo;t load data.</strong> {fetchError}
        </ErrorBanner>
      )}

      {/* Summary */}
      <div className={cn("grid grid-cols-2 gap-4", weekVisitors === null ? "lg:grid-cols-5" : "lg:grid-cols-3 xl:grid-cols-6")}>
        <StatCard
          label="New inquiries"
          value={newInquiriesCount}
          hint={`${totalInquiries} total`}
          icon={Inbox}
          emphasis
        />
        {weekVisitors !== null && (
          <StatCard
            label="Visitors · 7 days"
            value={weekVisitors.toLocaleString("en")}
            icon={Users}
            hint={
              <Link href="/admin/analytics" className="font-medium text-gold-700 hover:text-gold-800">
                Open analytics
              </Link>
            }
          />
        )}
        <StatCard label="Deals in CRM" value={totalLeads} icon={KanbanSquare} />
        <StatCard label="Pipeline value" value={formatCurrency(totalPipelineValue)} icon={DollarSign} />
        <StatCard label="Revenue won" value={formatCurrency(wonDealsValue)} icon={Award} />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate}%`}
          hint={`${convertedCount} of ${totalInquiries} inquiries`}
          icon={Percent}
        />
      </div>

      {/* Calendar: what is due, and when */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Calendar"
          description={
            calendar.todosReady
              ? "To-do deadlines, invoices waiting to be paid and project deadlines. Click a day to see what's due."
              : "Invoice due dates. To-do deadlines appear here once the to-dos migration has been run."
          }
          action={calendar.todosReady ? viewAll("/admin/todos") : undefined}
        />
        <MonthCalendar
          items={calendar.items}
          today={today}
          newTodoHref={calendar.todosReady ? "/admin/todos?new=1&due=" : undefined}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent inquiries */}
        <Card>
          <CardHeader title="Recent inquiries" description="Latest contact form submissions" action={viewAll("/admin/inquiries")} />
          {recentInquiries.length === 0 ? (
            <EmptyState icon={Inbox} title="No inquiries yet" description="Contact form submissions will show up here." />
          ) : (
            <ul className="divide-y divide-stone-200">
              {recentInquiries.map((inq) => (
                <li key={inq.id} className="flex flex-col gap-1.5 px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-stone-900">{inq.name}</span>
                      {inq.company && <span className="truncate text-xs text-stone-500">· {inq.company}</span>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs tabular-nums text-stone-500">{shortDate(inq.created_at)}</span>
                      <Badge tone={INQUIRY_STATUS_TONE[inq.status]}>{inq.status}</Badge>
                    </div>
                  </div>
                  {inq.message && <p className="line-clamp-2 text-xs leading-relaxed text-stone-600">{inq.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent deals */}
        <Card>
          <CardHeader title="Recent deals" description="Most recently updated in the CRM" action={viewAll("/admin/crm")} />
          {recentLeads.length === 0 ? (
            <EmptyState icon={FolderSync} title="No deals yet" description="Convert an inquiry or add a lead in the CRM." />
          ) : (
            <ul className="divide-y divide-stone-200">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-stone-900">{lead.name}</span>
                    <span className="truncate text-xs text-stone-500">{lead.company || "Individual"}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-stone-900">
                      {formatCurrency(Number(lead.value || 0))}
                    </span>
                    <Badge tone={LEAD_STAGE_TONE[lead.stage]}>{lead.stage}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Interest breakdown */}
      <Card>
        <CardHeader title="What people ask for" description="Share of inquiries that selected each service" />
        {sortedInterests.length === 0 ? (
          <EmptyState title="No interest data yet" description="Service interests from the contact form appear here." />
        ) : (
          <ul className="flex flex-col gap-3.5 px-5 py-5">
            {sortedInterests.map((item) => (
              <li key={item.name} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-4">
                <span className="truncate text-sm text-stone-700">{item.name}</span>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-gold-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <span className="w-16 text-right text-xs tabular-nums text-stone-500">
                  {item.count} · {item.percentage}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
