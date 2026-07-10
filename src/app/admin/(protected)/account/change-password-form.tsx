"use client";

import { useState } from "react";
import { AdminSection } from "@/components/admin/admin-section";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { changePassword } from "./actions";

export function ChangePasswordForm({ realAuth }: { realAuth: boolean }) {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit =
    realAuth && !submitting && current.length > 0 && next.length >= 8 && confirm === next;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await changePassword(current, next);
      if (result.ok) {
        toast({ title: "Password updated", description: "Use it the next time you sign in.", intent: "success" });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        toast({ title: "Could not change password", description: result.error, intent: "danger" });
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", intent: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <AdminSection title="Change password" icon="KeyRound">
        {!realAuth ? (
          <div className="mb-4 flex items-start gap-3 rounded-[12px] border border-warning/30 bg-warning/5 p-3">
            <p className="text-small text-text-secondary">
              This deployment uses demo login (mock auth). Changing passwords requires real auth
              (<code>AUTH_MODE=real</code> with a database).
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <Field label="Current password" htmlFor="current-password">
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              disabled={!realAuth}
            />
          </Field>

          <Field
            label="New password"
            htmlFor="new-password"
            error={tooShort ? "At least 8 characters." : undefined}
          >
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              disabled={!realAuth}
              aria-invalid={tooShort || undefined}
            />
          </Field>

          <Field
            label="Confirm new password"
            htmlFor="confirm-password"
            error={mismatch ? "Passwords do not match." : undefined}
          >
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={!realAuth}
              aria-invalid={mismatch || undefined}
            />
          </Field>

          <div className="pt-1">
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </div>
        </div>
      </AdminSection>
    </form>
  );
}
