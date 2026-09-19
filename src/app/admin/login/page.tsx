"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginAdmin } from "@/app/admin/actions";
import { Button, Card, ErrorBanner, Field, Input } from "@/components/admin/ui";

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

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <Image src="/yari-logo-black.png" alt="YARI" width={120} height={38} className="h-8 w-auto" />
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-stone-900">Sign in to the admin</h1>
          <p className="mt-1 text-sm text-stone-500">Inquiries, CRM pipeline and site analytics.</p>
        </div>

        <Card className="p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="admin-email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="admin-email"
                  required
                  disabled={isSubmitting}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yariagency.com"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="admin-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input
                  id="admin-password"
                  required
                  disabled={isSubmitting}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </Field>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-stone-500 transition-colors hover:text-stone-900">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
