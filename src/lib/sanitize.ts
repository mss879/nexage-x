/**
 * Small coercion helpers for server-side validation. Server actions never trust
 * what the browser sends — everything passes through these first. No Node
 * imports, so client components can use them too.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

/** A uuid, or null for anything else ("", undefined, junk). */
export const uuidOrNull = (value: unknown): string | null => (isUuid(value) ? value : null);

/** Trimmed text, cut to `max` characters. Non-strings become "". */
export const cleanText = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** A finite number clamped to 0…max. Anything else becomes 0. */
export const cleanAmount = (value: unknown, max = 1_000_000_000) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (value: string) => value.length <= 254 && EMAIL.test(value);

/** One of `allowed`, else the fallback. */
export const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;
