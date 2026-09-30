"use client";

/**
 * Month calendar for the admin dashboard — hand-built, no calendar library.
 *
 * One accent, as everywhere in the admin: to-dos are the gold marks (soft for
 * normal, solid for high priority), invoice and project deadlines are quiet
 * outlines told apart by their icon, overdue is ink, done is muted. Nothing is
 * identified by colour alone.
 */
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, ListTodo, Plus, ReceiptText } from "lucide-react";
import { Button, buttonClass } from "@/components/admin/ui";
import { formatDayShort, monthGrid, monthName, shiftMonth } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type CalendarKind = "todo" | "invoice" | "project";

export interface CalendarItem {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  kind: CalendarKind;
  title: string;
  /** Second line in the day panel: who, which client, how much */
  detail?: string;
  href: string;
  done?: boolean;
  /** High-priority to-do */
  important?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_PILLS = 3;

const KIND_ICON: Record<CalendarKind, React.ComponentType<{ className?: string }>> = {
  todo: ListTodo,
  invoice: ReceiptText,
  project: FolderKanban,
};

const KIND_LABEL: Record<CalendarKind, string> = {
  todo: "To-do",
  invoice: "Invoice due",
  project: "Project deadline",
};

/** Past its date and still open. */
const isLate = (item: CalendarItem, today: string) => !item.done && item.date < today;

function pillClass(item: CalendarItem, today: string) {
  if (item.done) return "border-stone-200 bg-stone-100 text-stone-400 line-through";
  if (isLate(item, today)) return "border-stone-900 bg-stone-900 text-white";
  if (item.kind === "todo") return item.important ? "border-gold-500 bg-gold-500 text-stone-900" : "border-gold-200 bg-gold-50 text-gold-800";
  return cn("border-stone-300 bg-white text-stone-700", item.kind === "project" && "border-dashed");
}

export default function MonthCalendar({
  items,
  today,
  newTodoHref,
}: {
  items: CalendarItem[];
  /** Today's date in Dubai, YYYY-MM-DD */
  today: string;
  /** Link for "add a to-do on this day" — the selected date is appended. Omit to hide it (to-dos aren't set up yet). */
  newTodoHref?: string;
}) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    // To-dos first, then invoices, then projects; open before done
    const rank = (item: CalendarItem) => (item.done ? 10 : 0) + (item.kind === "todo" ? 0 : item.kind === "invoice" ? 1 : 2);
    for (const item of [...items].sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title))) {
      map.set(item.date, [...(map.get(item.date) ?? []), item]);
    }
    return map;
  }, [items]);

  const weeks = useMemo(() => monthGrid(month), [month]);
  const selectedItems = byDate.get(selected) ?? [];
  const lateCount = useMemo(() => items.filter((item) => isLate(item, today)).length, [items, today]);

  const goTo = (nextMonth: string) => {
    setMonth(nextMonth);
    // Keep the day panel on a day that is visible
    setSelected(nextMonth === today.slice(0, 7) ? today : `${nextMonth}-01`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {/* Month switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <h3 className="min-w-[9.5rem] text-base font-semibold tracking-tight text-stone-900" aria-live="polite">
              {monthName(month, { month: "long", year: "numeric" })}
            </h3>
            <Button variant="secondary" size="sm" className="w-8 px-0" onClick={() => goTo(shiftMonth(month, -1))} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" className="w-8 px-0" onClick={() => goTo(shiftMonth(month, 1))} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => goTo(today.slice(0, 7))} disabled={month === today.slice(0, 7) && selected === today}>
              Today
            </Button>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500" aria-label="Legend">
            {(["todo", "invoice", "project"] as const).map((kind) => {
              const Icon = KIND_ICON[kind];
              return (
                <li key={kind} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      kind === "todo" ? "border-gold-200 bg-gold-50 text-gold-700" : "border-stone-300 bg-white text-stone-500",
                      kind === "project" && "border-dashed"
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  {KIND_LABEL[kind]}
                </li>
              );
            })}
            <li className="flex items-center gap-1.5">
              <span className="h-4 w-4 rounded border border-stone-900 bg-stone-900" />
              Overdue
            </li>
          </ul>
        </div>

        {/* Grid */}
        <div role="grid" aria-label={monthName(month, { month: "long", year: "numeric" })}>
          <div role="row" className="grid grid-cols-7 border-b border-stone-200">
            {WEEKDAYS.map((day) => (
              <div key={day} role="columnheader" className="px-2 py-2 text-center text-[11px] font-medium text-stone-500">
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week[0]} role="row" className="grid grid-cols-7 border-b border-stone-200 last:border-b-0">
              {week.map((date) => {
                const dayItems = byDate.get(date) ?? [];
                const inMonth = date.startsWith(month);
                const isToday = date === today;
                const isSelected = date === selected;
                return (
                  <div
                    key={date}
                    role="gridcell"
                    aria-selected={isSelected}
                    onClick={() => setSelected(date)}
                    className={cn(
                      "flex min-h-[64px] min-w-0 cursor-pointer flex-col gap-1 border-r border-stone-200 p-1.5 transition-colors duration-150 last:border-r-0 sm:min-h-[108px]",
                      inMonth ? "bg-white hover:bg-stone-50" : "bg-stone-50/70",
                      isSelected && "bg-gold-50/60 ring-1 ring-inset ring-gold-500 hover:bg-gold-50/60"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(date)}
                      aria-label={`${formatDayShort(date)}${dayItems.length > 0 ? `, ${dayItems.length} due` : ""}`}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-full text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer",
                        isToday ? "bg-gold-500 font-semibold text-stone-900" : inMonth ? "font-medium text-stone-700" : "text-stone-400"
                      )}
                    >
                      {Number(date.slice(8))}
                    </button>

                    {/* Wide screens: what's due, by name */}
                    <div className="hidden min-w-0 flex-col gap-1 sm:flex">
                      {dayItems.slice(0, MAX_PILLS).map((item) => {
                        const Icon = KIND_ICON[item.kind];
                        return (
                          <Link
                            key={`${item.kind}-${item.id}`}
                            href={item.href}
                            onClick={(e) => e.stopPropagation()}
                            title={`${KIND_LABEL[item.kind]}: ${item.title}${item.detail ? ` — ${item.detail}` : ""}`}
                            className={cn(
                              "flex min-w-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500",
                              pillClass(item, today)
                            )}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                      {dayItems.length > MAX_PILLS && <span className="px-1 text-[11px] text-stone-500">+{dayItems.length - MAX_PILLS} more</span>}
                    </div>

                    {/* Phones: how many, as marks — the day panel below names them */}
                    {dayItems.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 sm:hidden" aria-hidden="true">
                        {dayItems.slice(0, 4).map((item) => (
                          <span
                            key={`${item.kind}-${item.id}`}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full border",
                              item.done ? "border-stone-300 bg-stone-300" : isLate(item, today) ? "border-stone-900 bg-stone-900" : item.kind === "todo" ? "border-gold-500 bg-gold-500" : "border-stone-400 bg-white"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* The selected day */}
      <aside className="flex flex-col border-t border-stone-200 xl:border-l xl:border-t-0" aria-label="Selected day">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">{selected === today ? "Today" : formatDayShort(selected)}</h3>
            <p className="text-xs text-stone-500">
              {selected === today ? formatDayShort(selected) : selectedItems.length === 0 ? "Nothing due" : `${selectedItems.length} due`}
            </p>
          </div>
          {newTodoHref && (
            <Link href={`${newTodoHref}${selected}`} className={buttonClass("secondary", "sm")}>
              <Plus className="h-3.5 w-3.5" />
              To-do
            </Link>
          )}
        </div>

        {selectedItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone-700">Nothing due</p>
            <p className="max-w-[14rem] text-xs text-stone-500">To-do deadlines, invoice due dates and project deadlines show here.</p>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-stone-200 overflow-y-auto xl:max-h-[560px]">
            {selectedItems.map((item) => {
              const Icon = KIND_ICON[item.kind];
              const late = isLate(item, today);
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-5 py-3 transition-colors duration-150 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
                  >
                    <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border", pillClass(item, today), "no-underline")}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-sm font-medium", item.done ? "text-stone-400 line-through" : "text-stone-900")}>{item.title}</span>
                      <span className="block text-xs text-stone-500">
                        {KIND_LABEL[item.kind]}
                        {item.done ? " · done" : late ? " · overdue" : ""}
                        {item.detail && ` · ${item.detail}`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {lateCount > 0 && (
          <p className="border-t border-stone-200 px-5 py-3 text-xs text-stone-600">
            <span className="font-semibold text-stone-900">{lateCount}</span> {lateCount === 1 ? "item is" : "items are"} overdue across the calendar.
          </p>
        )}
      </aside>
    </div>
  );
}
