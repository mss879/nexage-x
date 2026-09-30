import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Eye,
  Minus,
  MousePointerClick,
  Target,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { Badge, Card, CardHeader, EmptyState, ErrorBanner, PageHeader, StatCard } from "@/components/admin/ui";
import { BarList, VisitorsChart, type BarRow, type DailyPoint } from "@/components/admin/charts";
import {
  EVENT_LABELS,
  VITAL_DESCRIPTIONS,
  VITAL_NAMES,
  VITAL_THRESHOLDS,
  type VitalName,
} from "@/lib/analytics-events";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

interface LabelCount {
  label: string;
  visitors: number;
}

interface Report {
  totals: { visitors: number; pageviews: number; conversions: number; bounces: number };
  previous: { visitors: number; pageviews: number; conversions: number };
  daily: DailyPoint[];
  pages: { path: string; pageviews: number; visitors: number }[];
  sources: LabelCount[];
  campaigns: LabelCount[];
  countries: LabelCount[];
  devices: LabelCount[];
  browsers: LabelCount[];
  events: { label: string; count: number; conversion: boolean }[];
  vitals: { label: string; p75: number; samples: number }[];
}

const number = new Intl.NumberFormat("en");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code: string): string {
  if (code === "??") return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const toRows = (items: LabelCount[], format: (label: string) => string = (l) => l): BarRow[] =>
  items.map((i) => ({ label: format(i.label), value: i.visitors }));

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "▲ 12% vs previous 30 days" — direction is carried by the icon and the words, not by colour. */
function Delta({ current, previous, range }: { current: number; previous: number; range: Range }) {
  if (previous === 0) {
    return <span>{current === 0 ? "No change" : "New this period"}</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3.5 w-3.5 text-stone-700" />
      <span className="font-medium text-stone-700">{Math.abs(pct)}%</span>
      <span>
        {pct > 0 ? "up" : pct < 0 ? "down" : "flat"} vs previous {range} days
      </span>
    </span>
  );
}

function VitalCard({ name, p75, samples }: { name: VitalName; p75?: number; samples?: number }) {
  const [good, poor] = VITAL_THRESHOLDS[name];
  const measured = typeof p75 === "number";
  const status = !measured ? null : p75 <= good ? "good" : p75 <= poor ? "needs work" : "poor";
  const display = !measured
    ? "—"
    : name === "CLS"
      ? p75.toFixed(2)
      : p75 >= 1000
        ? `${(p75 / 1000).toFixed(2)} s`
        : `${Math.round(p75)} ms`;

  // Marker position on a track that runs 0 → 1.5 × the "poor" threshold
  const scaleMax = poor * 1.5;
  const pos = measured ? Math.min(100, (p75 / scaleMax) * 100) : 0;

  return (
    <div className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-stone-900">{name}</div>
          <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{VITAL_DESCRIPTIONS[name]}</p>
        </div>
        {status === "good" && (
          <Badge tone="soft">
            <Check className="h-3 w-3" />
            Good
          </Badge>
        )}
        {status === "needs work" && (
          <Badge tone="outline">
            <Minus className="h-3 w-3" />
            Needs work
          </Badge>
        )}
        {status === "poor" && (
          <Badge className="border-red-200 bg-red-50 text-red-700">
            <AlertTriangle className="h-3 w-3" />
            Poor
          </Badge>
        )}
      </div>

      <div className="text-2xl font-semibold tracking-tight tabular-nums text-stone-900">{display}</div>

      {/* Threshold track: ticks at "good" and "poor", marker = this site's p75 */}
      <div className="relative h-1.5 rounded-full bg-stone-100" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gold-200" style={{ width: `${(good / scaleMax) * 100}%` }} />
        <div className="absolute -inset-y-1 w-px bg-stone-400" style={{ left: `${(good / scaleMax) * 100}%` }} />
        <div className="absolute -inset-y-1 w-px bg-stone-400" style={{ left: `${(poor / scaleMax) * 100}%` }} />
        {measured && (
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-stone-900 shadow-sm"
            style={{ left: `${pos}%` }}
          />
        )}
      </div>
      <div className="flex justify-between text-[11px] text-stone-500">
        <span>
          Good ≤ {name === "CLS" ? good : `${good / 1000}s`} · Poor &gt; {name === "CLS" ? poor : `${poor / 1000}s`}
        </span>
        <span className="tabular-nums">{measured ? `${number.format(samples ?? 0)} samples` : "No samples yet"}</span>
      </div>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range: Range = (RANGES as readonly number[]).includes(Number(params.range)) ? (Number(params.range) as Range) : 30;

  const to = new Date();
  const from = new Date(to.getTime() - range * 24 * 60 * 60 * 1000);

  let report: Report | null = null;
  let fetchError: string | null = null;
  let needsMigration = false;

  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase.rpc("analytics_report", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    });
    if (error) {
      // PGRST202 / 42883 = function missing → the analytics migration hasn't been applied yet
      needsMigration = error.code === "PGRST202" || error.code === "42883" || error.code === "42P01";
      fetchError = error.message;
    } else {
      report = data as Report;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "An unexpected error occurred.";
  }

  const rangePicker = (
    <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <Link
          key={r}
          href={`/admin/analytics?range=${r}`}
          aria-current={r === range ? "true" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
            r === range ? "bg-gold-50 text-gold-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          )}
        >
          {r} days
        </Link>
      ))}
    </div>
  );

  if (!report) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Site analytics" description="Traffic, sources and conversions for the YARI website." />
        {needsMigration ? (
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-stone-900">One step left: create the analytics tables</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
              The website is already set up to record visits, but the database doesn&rsquo;t have the analytics table yet.
              Open the Supabase dashboard → SQL Editor, paste the contents of{" "}
              <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-800">
                supabase/migrations/20260919120000_analytics.sql
              </code>{" "}
              and run it. Data starts appearing here as soon as people visit the site.
            </p>
          </Card>
        ) : (
          <ErrorBanner>Couldn&rsquo;t load analytics: {fetchError}</ErrorBanner>
        )}
      </div>
    );
  }

  const { totals, previous } = report;
  const conversionRate = totals.visitors > 0 ? (totals.conversions / totals.visitors) * 100 : 0;
  const previousRate = previous.visitors > 0 ? (previous.conversions / previous.visitors) * 100 : 0;
  const bounceRate = totals.visitors > 0 ? Math.round((totals.bounces / totals.visitors) * 100) : 0;
  const pagesPerVisit = totals.visitors > 0 ? (totals.pageviews / totals.visitors).toFixed(1) : "0";
  const vitalByName = new Map(report.vitals.map((v) => [v.label, v]));
  const hasTraffic = totals.pageviews > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Site analytics"
        description="First-party and cookieless — no personal data is stored. Days are in Dubai time."
        action={rangePicker}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Visitors"
          value={number.format(totals.visitors)}
          icon={Users}
          emphasis
          hint={<Delta current={totals.visitors} previous={previous.visitors} range={range} />}
        />
        <StatCard
          label="Page views"
          value={number.format(totals.pageviews)}
          icon={Eye}
          hint={<Delta current={totals.pageviews} previous={previous.pageviews} range={range} />}
        />
        <StatCard
          label="Conversions"
          value={number.format(totals.conversions)}
          icon={Target}
          hint={<Delta current={totals.conversions} previous={previous.conversions} range={range} />}
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate.toFixed(1)}%`}
          icon={MousePointerClick}
          hint={
            <span>
              {previousRate.toFixed(1)}% previous · {bounceRate}% bounce · {pagesPerVisit} pages/visit
            </span>
          }
        />
      </div>

      {/* Trend */}
      <Card>
        <CardHeader title="Visitors over time" description={`Unique visitors per day, last ${range} days`} />
        {hasTraffic ? (
          <div className="px-3 py-4 sm:px-5">
            <VisitorsChart data={report.daily} />
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No visits recorded yet"
            description="Once the site is live and people visit, the daily trend appears here."
          />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top pages" description="Page views by URL" />
          <BarList
            valueLabel="Page views"
            rows={report.pages.map((p) => ({ label: p.path, value: p.pageviews, sub: `${number.format(p.visitors)} visitors` }))}
          />
        </Card>

        <Card>
          <CardHeader title="Where visitors come from" description="Referring site or UTM source of each visit" />
          <BarList valueLabel="Visitors" rows={toRows(report.sources)} />
        </Card>

        <Card>
          <CardHeader title="Conversions and interactions" description="Conversions are marked — everything else is engagement" />
          {report.events.length === 0 ? (
            <EmptyState icon={Target} title="No interactions yet" description="Form submissions, signups, chat and link clicks land here." />
          ) : (
            <ul className="divide-y divide-stone-200">
              {report.events.map((ev) => (
                <li key={ev.label} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm text-stone-700">{EVENT_LABELS[ev.label] ?? ev.label}</span>
                    {ev.conversion && <Badge tone="soft">Conversion</Badge>}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-stone-900">{number.format(ev.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Countries" description="Visitors by country" />
          <BarList valueLabel="Visitors" rows={toRows(report.countries, countryName)} />
        </Card>

        <Card>
          <CardHeader title="Devices" description="Visitors by device type" />
          <BarList valueLabel="Visitors" rows={toRows(report.devices, capitalize)} />
        </Card>

        <Card>
          <CardHeader title="Browsers" description="Visitors by browser" />
          <BarList valueLabel="Visitors" rows={toRows(report.browsers)} />
        </Card>

        {report.campaigns.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader title="Campaigns" description="Visitors by utm_campaign" />
            <BarList valueLabel="Visitors" rows={toRows(report.campaigns)} />
          </Card>
        )}
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader
          title="Core Web Vitals"
          description="Measured in real visitors' browsers (75th percentile) — this is what Google uses for ranking"
        />
        <div className="grid grid-cols-1 divide-y divide-stone-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {(["LCP", "INP", "CLS"] as const).map((name) => (
            <VitalCard key={name} name={name} p75={vitalByName.get(name)?.p75} samples={vitalByName.get(name)?.samples} />
          ))}
        </div>
        <div className="grid grid-cols-1 divide-y divide-stone-200 border-t border-stone-200 md:grid-cols-2 md:divide-x md:divide-y-0">
          {VITAL_NAMES.filter((n) => n === "FCP" || n === "TTFB").map((name) => (
            <VitalCard key={name} name={name} p75={vitalByName.get(name)?.p75} samples={vitalByName.get(name)?.samples} />
          ))}
        </div>
      </Card>
    </div>
  );
}
