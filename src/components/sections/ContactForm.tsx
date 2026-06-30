"use client";

import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { submitInquiry } from "@/app/contact/actions";

const INTERESTS = [
  "Software",
  "E-commerce",
  "Automation",
  "Odoo / Zoho",
  "Logistics",
  "Branding",
];

const BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+"];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await submitInquiry({
      name: form.name,
      email: form.email,
      company: form.company,
      budget: form.budget,
      message: form.message,
      interests,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-3.5 font-sans text-sm text-white placeholder-zinc-600 transition-all duration-300 focus:border-[#df8326] focus:outline-none focus:ring-1 focus:ring-[#df8326]/50 disabled:opacity-50";

  return (
    <Reveal y={40} className="lg:col-span-7">
      <div className="rounded-3xl border border-white/[0.08] bg-[#0a0a0d] p-7 md:p-10">
        {submitted ? (
          <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#df8326]/40 bg-[#df8326]/10 text-[#df8326]">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="font-syne text-2xl font-bold uppercase tracking-tight">
              Message received
            </h3>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-zinc-400">
              Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}. We'll be in touch within
              one business day. Watch your inbox.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", company: "", budget: "", message: "" });
                setInterests([]);
                setError(null);
              }}
              className="mt-2 rounded-full border border-white/15 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-[#df8326] hover:text-white cursor-pointer"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Name *
                </label>
                <input
                  required
                  disabled={isSubmitting}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Email *
                </label>
                <input
                  required
                  disabled={isSubmitting}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@brand.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Company
              </label>
              <input
                disabled={isSubmitting}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Your brand"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                What do you need?
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => {
                  const on = interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer ${
                        on
                          ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326]"
                          : "border-white/[0.1] text-zinc-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Budget
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setForm({ ...form, budget: b })}
                    className={`rounded-xl border px-3 py-2.5 font-mono text-[11px] tracking-wide transition-all duration-300 cursor-pointer ${
                      form.budget === b
                        ? "border-[#df8326] bg-[#df8326]/10 text-[#df8326]"
                        : "border-white/[0.1] text-zinc-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Project details
              </label>
              <textarea
                rows={4}
                disabled={isSubmitting}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what you're building..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#df8326] to-[#C57019] px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(197,112,25,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send message"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        )}
      </div>
    </Reveal>
  );
}
