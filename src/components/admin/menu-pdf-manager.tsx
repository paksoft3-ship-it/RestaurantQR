"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";

interface PdfMeta {
  filename: string;
  fileSize: number;
  uploadedAt: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Upload / view / remove a single menu PDF for a restaurant. The PDF is stored
 * in the database and served from `/api/restaurants/[id]/menu-pdf`.
 */
export function MenuPdfManager({ restaurantId }: { restaurantId: string }) {
  const { toast } = useToast();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [meta, setMeta] = useState<PdfMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/restaurants/${restaurantId}/menu-pdf`;

  const loadMeta = async () => {
    try {
      const res = await fetch(`${endpoint}?meta=1`, { cache: "no-store" });
      if (res.ok) setMeta((await res.json()) as PdfMeta | null);
    } catch {
      // leave meta as-is on transient errors
    }
  };

  useEffect(() => {
    void loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const onPick = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ title: "PDF only", description: "Please choose a .pdf file.", intent: "danger" });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: "File too large", description: "The PDF must be 4 MB or smaller.", intent: "danger" });
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        toast({ title: "Menu PDF uploaded", description: file.name, intent: "success" });
        await loadMeta();
      } else {
        toast({ title: "Upload failed", description: data.error ?? "Please try again.", intent: "danger" });
      }
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", intent: "danger" });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setMeta(null);
        toast({ title: "Menu PDF removed", intent: "success" });
      } else {
        toast({ title: "Could not remove", intent: "danger" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {meta ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-border bg-canvas p-3">
          <div className="flex min-w-0 items-center gap-3">
            <Icon name="FileText" className="size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-text-primary">{meta.filename}</p>
              <p className="text-xs text-text-secondary">{formatBytes(meta.fileSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <a href={endpoint} target="_blank" rel="noreferrer">
                View
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={busy}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-small text-text-secondary">No menu PDF uploaded yet.</p>
      )}

      <div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onPick(file);
          }}
        />
        <Button asChild variant="primary" size="sm" disabled={busy}>
          <label htmlFor={inputId} className="cursor-pointer">
            <Icon name="Upload" className="size-4" aria-hidden />
            {busy ? "Uploading…" : meta ? "Replace PDF" : "Upload menu PDF"}
          </label>
        </Button>
        <p className="mt-1.5 text-xs text-text-tertiary">PDF up to 4 MB. Stored and served from your database.</p>
      </div>
    </div>
  );
}
