/**
 * Calendar-date helpers for the admin. Dates are plain "YYYY-MM-DD" strings and
 * "today" is the business day in Dubai — never the server's or the browser's.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isIsoDate = (value: unknown): value is string =>
  typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** Today's calendar date in Dubai, as YYYY-MM-DD. */
export const todayInDubai = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "1 Sep 2026", or "—" when there's no date. */
export const formatDate = (isoDate: string | null | undefined) =>
  isIsoDate(isoDate)
    ? new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    : "—";

/** "Mon 1 Sep" — for lists where the year is obvious. */
export const formatDayShort = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/** "2026-09" shifted by n months. */
export function shiftMonth(ym: string, n: number): string {
  const [year, month] = ym.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + n, 1)).toISOString().slice(0, 7);
}

export const lastDayOf = (ym: string) => {
  const [year, month] = ym.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const monthName = (ym: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });

/**
 * The weeks a month calendar shows for "YYYY-MM": Monday-first rows of seven
 * dates, padded with the neighbouring months' days.
 */
export function monthGrid(ym: string): string[][] {
  const first = `${ym}-01`;
  // getUTCDay(): 0 = Sunday … 6 = Saturday → days since Monday
  const lead = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const weeks = Math.ceil((lead + lastDayOf(ym)) / 7);
  const start = addDays(first, -lead);
  return Array.from({ length: weeks }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
}
