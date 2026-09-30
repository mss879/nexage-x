"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { Button, Card } from "@/components/admin/ui";

/** A valid login that isn't (or is no longer) an active team member. */
export default function NoAccess() {
  const router = useRouter();

  const signOut = async () => {
    await logoutAdmin();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Card className="w-full max-w-sm p-6 text-center shadow-sm">
        <h1 className="text-base font-semibold text-stone-900">This account doesn&rsquo;t have admin access</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          It may have been deactivated. Ask the super admin to add you back on the Team page, then sign in again.
        </p>
        <Button variant="secondary" onClick={signOut} className="mt-5 w-full">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </Card>
    </main>
  );
}
