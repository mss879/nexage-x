/**
 * Admin UI primitives — the light workspace from DESIGN.md §9.
 * Stone neutrals + logo gold as the single accent. Every admin screen is built
 * from these; don't restyle inline.
 */
import React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/* ── Button ─────────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gold-500 text-stone-900 hover:bg-gold-400 border border-gold-600/40 shadow-sm",
  secondary: "bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50",
  ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    FOCUS_RING,
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

/* ── Form controls ──────────────────────────────────────────────────────── */

const CONTROL =
  "w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-150 hover:border-stone-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/25 disabled:opacity-50";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "h-10", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, "h-10 pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "py-2.5 leading-relaxed", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-stone-600">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Surfaces ───────────────────────────────────────────────────────────── */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-stone-200 bg-white", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  /** Draws the value in gold — use for the one number that matters most. */
  emphasis?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-stone-400" />}
      </div>
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums",
          emphasis ? "text-gold-700" : "text-stone-900"
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-stone-500">{hint}</span>}
    </Card>
  );
}

/* ── Badge ──────────────────────────────────────────────────────────────── */

/** State is carried by weight, not hue: outline → gold tint → solid gold; muted = closed/lost. */
export type BadgeTone = "outline" | "soft" | "solid" | "muted";

const BADGE_TONES: Record<BadgeTone, string> = {
  outline: "border-stone-300 bg-white text-stone-700",
  soft: "border-gold-200 bg-gold-50 text-gold-700",
  solid: "border-gold-500 bg-gold-500 text-stone-900",
  muted: "border-stone-200 bg-stone-100 text-stone-500",
};

export function Badge({
  tone = "outline",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Feedback ───────────────────────────────────────────────────────────── */

export function ErrorBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="text-sm font-medium text-stone-700">{title}</p>
      {description && <p className="max-w-xs text-xs text-stone-500">{description}</p>}
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────── */

export function Modal({
  title,
  description,
  onClose,
  children,
  className,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/30" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 cursor-pointer",
              FOCUS_RING
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/** Selectable pill (filters, interest tags). */
export function Chip({
  selected,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-150 cursor-pointer",
        FOCUS_RING,
        selected
          ? "border-gold-500 bg-gold-50 text-gold-700"
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50",
        className
      )}
      {...props}
    />
  );
}
