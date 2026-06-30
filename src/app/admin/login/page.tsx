"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { loginAdmin } from "@/app/admin/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // Call the Server Action
    const result = await loginAdmin(null, formData);

    if (result.success) {
      // Force hard refresh or route push to load the layout properly
      router.push("/admin");
      router.refresh();
    } else {
      setIsSubmitting(false);
      setError(result.error || "Invalid credentials. Please try again.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-11 pr-4 py-3 font-sans text-sm text-white placeholder-zinc-600 transition-all duration-300 focus:border-[#df8326] focus:outline-none focus:ring-1 focus:ring-[#df8326]/50 disabled:opacity-50";

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-[#050508] px-6 text-white overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="grain-texture absolute inset-0 pointer-events-none" />
      <div className="absolute -left-20 top-1/4 h-[400px] w-[400px] rounded-full bg-[#df8326]/10 blur-[150px] pointer-events-none" />
      <div className="absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#8b5cf6]/8 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand logo/badge */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 mb-4">
            <span className="h-2 w-2 rounded-full bg-[#df8326] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-300">
              YARI Administrative Control
            </span>
          </div>
          <h1 className="font-syne text-3xl font-bold uppercase tracking-tight text-white">
            Access Portal
          </h1>
          <p className="mt-2 font-sans text-sm text-zinc-400">
            Sign in to access inquiries and the CRM pipeline.
          </p>
        </div>

        {/* Login form card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0a0a0d]/90 p-7 shadow-2xl backdrop-blur-xl md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Authorized Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
                <input
                  required
                  disabled={isSubmitting}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yari.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Lock className="h-4.5 w-4.5" strokeWidth={1.8} />
                </span>
                <input
                  required
                  disabled={isSubmitting}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-xs text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#df8326] to-[#C57019] py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_rgba(197,112,25,0.25)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Authenticate"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        {/* Back to main website link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white"
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </main>
  );
}
