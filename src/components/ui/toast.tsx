"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { StatusIntent } from "@/domain/status";

interface Toast {
  id: string;
  title: string;
  description?: string;
  intent?: Extract<StatusIntent, "success" | "danger" | "info" | "warning">;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const INTENT_ICON: Record<NonNullable<Toast["intent"]>, string> = {
  success: "CheckCircle2",
  danger: "AlertTriangle",
  info: "Info",
  warning: "AlertTriangle",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[12px] border bg-canvas p-3.5 shadow-lift",
              t.intent === "success" && "border-success/30",
              t.intent === "danger" && "border-danger/30",
              t.intent === "warning" && "border-warning/30",
              (!t.intent || t.intent === "info") && "border-info/30",
            )}
          >
            <Icon
              name={INTENT_ICON[t.intent ?? "info"]}
              className={cn(
                "mt-0.5 size-5 shrink-0",
                t.intent === "success" && "text-success",
                t.intent === "danger" && "text-danger",
                t.intent === "warning" && "text-warning",
                (!t.intent || t.intent === "info") && "text-info",
              )}
              aria-hidden
            />
            <div className="flex-1">
              <p className="text-small font-semibold text-text-primary">{t.title}</p>
              {t.description ? (
                <p className="text-xs text-text-secondary">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-text-tertiary hover:text-text-primary"
              aria-label="Dismiss notification"
            >
              <Icon name="X" className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
