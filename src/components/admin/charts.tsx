"use client";

/**
 * Admin charts — hand-built SVG/HTML, no chart library.
 *
 * One series, one accent: marks are logo gold, and because gold on white is
 * below 3:1 contrast every mark is backed by a text value in ink (bar values,
 * line end-label, tooltip) plus a screen-reader table. Text never wears the
 * data colour.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GOLD_LINE = "#c98a1b"; // gold-600 — the 2px line
const GOLD_FILL = "#eaa42a"; // gold-500 — area wash + bars
const GRID = "#e7e5e4"; // stone-200
const INK_MUTED = "#78716c"; // stone-500

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en");

/** Round a max up to a clean axis ceiling (1/2/2.5/5 × 10ⁿ), min 4 so tiny counts still get integer ticks. */
function niceCeil(max: number): number {
  if (max <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

export interface DailyPoint {
  day: string; // YYYY-MM-DD
  visitors: number;
  pageviews: number;
}

const dayLabel = (iso: string, long = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", long
    ? { weekday: "short", day: "numeric", month: "short" }
    : { day: "numeric", month: "short" });

/* ── Visitors over time ─────────────────────────────────────────────────── */

export function VisitorsChart({ data }: { data: DailyPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = 240;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const { points, yMax, ticks } = useMemo(() => {
    const max = niceCeil(Math.max(0, ...data.map((d) => d.visitors)));
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
    return {
      yMax: max,
      ticks: [0, max / 2, max],
      points: data.map((d, i) => ({
        x: pad.left + (data.length > 1 ? i * stepX : innerW / 2),
        y: pad.top + innerH - (d.visitors / max) * innerH,
      })),
    };
  }, [data, innerW, innerH, pad.left, pad.top]);

  if (data.length === 0) return null;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const baseline = pad.top + innerH;
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${baseline} L${points[0].x.toFixed(1)},${baseline} Z`;

  // ~6 evenly spaced date labels, always including the last day
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const showLabel = (i: number) => (data.length - 1 - i) % labelEvery === 0;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1)))));
  };

  const active = hover !== null ? { ...data[hover], ...points[hover] } : null;
  const tooltipLeft = active ? Math.min(Math.max(active.x, 84), width - 84) : 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label="Daily visitors over the selected period" className="block">
        {/* Gridlines + y ticks */}
        {ticks.map((t) => {
          const y = pad.top + innerH - (t / yMax) * innerH;
          return (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
              <text x={pad.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={11} fill={INK_MUTED}>
                {compact.format(t)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) =>
          showLabel(i) ? (
            <text
              key={d.day}
              x={points[i].x}
              y={height - 8}
              textAnchor={i === data.length - 1 ? "end" : i === 0 ? "start" : "middle"}
              fontSize={11}
              fill={INK_MUTED}
            >
              {dayLabel(d.day)}
            </text>
          ) : null
        )}

        <path d={area} fill={GOLD_FILL} opacity={0.1} />
        <path d={line} fill="none" stroke={GOLD_LINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Latest point — direct label in ink */}
        {hover === null && (
          <g>
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={GOLD_LINE} stroke="#fff" strokeWidth={2} />
            <text
              x={points[points.length - 1].x - 8}
              y={points[points.length - 1].y - 10}
              textAnchor="end"
              fontSize={12}
              fontWeight={600}
              fill="#1c1917"
            >
              {full.format(data[data.length - 1].visitors)}
            </text>
          </g>
        )}

        {/* Crosshair */}
        {active && (
          <g pointerEvents="none">
            <line x1={active.x} x2={active.x} y1={pad.top} y2={baseline} stroke="#a8a29e" strokeWidth={1} />
            <circle cx={active.x} cy={active.y} r={5} fill={GOLD_LINE} stroke="#fff" strokeWidth={2} />
          </g>
        )}

        {/* Hit area — the whole plot, not the 2px line */}
        <rect
          x={pad.left}
          y={pad.top}
          width={Math.max(0, innerW)}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-2 z-10 w-40 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{ left: tooltipLeft }}
        >
          <div className="font-medium text-stone-900">{dayLabel(active.day, true)}</div>
          <div className="mt-1.5 flex items-center justify-between gap-3 text-stone-600">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ background: GOLD_LINE }} />
              Visitors
            </span>
            <span className="font-semibold tabular-nums text-stone-900">{full.format(active.visitors)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-stone-600">
            <span className="pl-[18px]">Page views</span>
            <span className="font-semibold tabular-nums text-stone-900">{full.format(active.pageviews)}</span>
          </div>
        </div>
      )}

      {/* Table view for assistive tech */}
      <table className="sr-only">
        <caption>Daily visitors and page views</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Visitors</th>
            <th scope="col">Page views</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <th scope="row">{dayLabel(d.day, true)}</th>
              <td>{d.visitors}</td>
              <td>{d.pageviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Ranked bar list ────────────────────────────────────────────────────── */

export interface BarRow {
  label: string;
  value: number;
  /** Optional second line under the label. */
  sub?: string;
}

/**
 * Ranked horizontal bars. Label and value are text in ink on their own line,
 * the 6px gold bar underneath carries magnitude only — so long page paths never
 * collide with the bar and the value is always readable.
 */
export function BarList({
  rows,
  valueLabel,
  emptyLabel = "No data for this period yet",
  className,
}: {
  rows: BarRow[];
  valueLabel: string;
  emptyLabel?: string;
  className?: string;
}) {
  if (rows.length === 0) {
    return <p className={cn("px-5 py-10 text-center text-xs text-stone-500", className)}>{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;

  return (
    <ul className={cn("flex flex-col gap-3 px-5 py-4", className)} aria-label={valueLabel}>
      {rows.map((row) => (
        <li
          key={row.label}
          title={`${row.label} — ${full.format(row.value)} ${valueLabel.toLowerCase()} (${Math.round((row.value / total) * 100)}%)`}
          className="group flex flex-col gap-1.5"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-stone-700 group-hover:text-stone-900">
              {row.label}
              {row.sub && <span className="ml-2 text-xs text-stone-400">{row.sub}</span>}
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-stone-900">{full.format(row.value)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-gold-500 transition-[width] duration-300"
              style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
