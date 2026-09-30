"use client";

import React, { useId, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { changeMyPassword } from "@/app/admin/actions";
import { Button, ErrorBanner, Field, Input, Modal } from "@/components/admin/ui";

/** Anyone on the team can replace the starting password they were given. */
export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const uid = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, startSaving] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== repeat) {
      setError("The two new passwords don't match.");
      return;
    }
    startSaving(async () => {
      const res = await changeMyPassword(current, next);
      if (!res.success) setError(res.error ?? "Couldn't change the password.");
      else setDone(true);
    });
  };

  if (done) {
    return (
      <Modal title="Password changed" onClose={onClose} className="max-w-md">
        <p className="flex items-center gap-2 text-sm text-stone-700">
          <Check className="h-4 w-4 text-gold-600" />
          Use the new password the next time you sign in.
        </p>
        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Change your password" description="Only you will know the new one." onClose={onClose} className="max-w-md">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Field label="Current password" htmlFor={`${uid}-current`}>
          <Input
            id={`${uid}-current`}
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </Field>
        <Field label="New password (10 characters or more)" htmlFor={`${uid}-next`}>
          <Input
            id={`${uid}-next`}
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={72}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="New password again" htmlFor={`${uid}-repeat`}>
          <Input
            id={`${uid}-repeat`}
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={72}
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Change password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
