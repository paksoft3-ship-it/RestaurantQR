"use client";

import { demoStore } from "@/lib/storage/demo-store";
import type { MenuCategory, MenuProduct } from "@/domain/entities";
import type { Role } from "@/domain/permissions";
import {
  IMPORT_PIPELINE_STAGES,
  SCHEMA_VERSION,
  STAGE_META,
  TERMINAL_STATUSES,
  type ImportConfig,
  type ImportProcessingStatus,
  type ImportResult,
  type MenuImport,
  type MenuImportEvent,
} from "@/domain/menu-import";
import { createId } from "@/lib/utils";
import { buildDeterministicResult } from "./worker/deterministic-extractor";
import { validateImportResult } from "./validation";

function now(): string {
  return new Date().toISOString();
}

function event(
  stage: MenuImportEvent["stage"],
  status: ImportProcessingStatus,
  progress: number,
  message: string,
  extra: Partial<MenuImportEvent> = {},
): MenuImportEvent {
  return { id: createId("evt"), stage, status, progress, message, createdAt: now(), ...extra };
}

export interface CreateImportInput {
  restaurantId: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pdfType: string;
  config: ImportConfig;
  createdBy: string | null;
  idempotencyKey: string;
}

export const menuImportService = {
  listByRestaurant(restaurantId: string): MenuImport[] {
    return demoStore.menuImports
      .where((i) => i.restaurantId === restaurantId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  get(importId: string): MenuImport | null {
    return demoStore.menuImports.byId(importId);
  },

  /** Create a new import. Idempotent on (restaurantId, idempotencyKey). */
  create(input: CreateImportInput): MenuImport {
    const existing = demoStore.menuImports.where(
      (i) => i.restaurantId === input.restaurantId && i.idempotencyKey === input.idempotencyKey,
    )[0];
    if (existing) return existing;

    const record: MenuImport = {
      id: createId("imp"),
      restaurantId: input.restaurantId,
      originalFileName: input.fileName,
      fileHash: null,
      fileSize: input.fileSize,
      pageCount: input.pageCount,
      pdfType: input.pdfType,
      config: input.config,
      schemaVersion: SCHEMA_VERSION,
      processingStatus: "UPLOADED",
      reviewStatus: "NOT_STARTED",
      progress: 0,
      currentStage: null,
      errorCode: null,
      errorSummary: null,
      result: null,
      events: [event("QUEUED", "UPLOADED", 0, "PDF uploaded")],
      idempotencyKey: input.idempotencyKey,
      createdBy: input.createdBy,
      reviewedBy: null,
      approvedBy: null,
      committedMenuRef: null,
      createdAt: now(),
      updatedAt: now(),
      completedAt: null,
      archivedAt: null,
    };
    demoStore.menuImports.create(record);
    return record;
  },

  patch(importId: string, patch: Partial<MenuImport>): MenuImport | null {
    return demoStore.menuImports.update(importId, { ...patch, updatedAt: now() });
  },

  appendEvent(importId: string, evt: MenuImportEvent): void {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec) return;
    demoStore.menuImports.update(importId, {
      events: [...rec.events, evt],
      progress: evt.progress,
      currentStage: evt.stage,
      updatedAt: now(),
    });
  },

  cancel(importId: string): void {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec || TERMINAL_STATUSES.includes(rec.processingStatus)) return;
    this.patch(importId, {
      processingStatus: "CANCELLED",
      currentStage: null,
    });
    this.appendEvent(importId, event("DONE", "CANCELLED", rec.progress, "Import cancelled"));
  },

  /**
   * Run the (deterministic, simulated) extraction pipeline, emitting a real event
   * per stage. The demo extractor is seeded from the restaurant's actual menu so
   * the review workflow has believable content. Not real OCR/vision.
   */
  async startExtraction(
    importId: string,
    opts: { stageDelayMs?: number } = {},
  ): Promise<MenuImport | null> {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec) return null;
    // Idempotent: don't restart a job that's past UPLOADED unless it failed.
    if (rec.processingStatus !== "UPLOADED" && rec.processingStatus !== "FAILED") return rec;

    const delay = opts.stageDelayMs ?? 500;
    this.patch(importId, { processingStatus: "QUEUED", progress: 2, errorCode: null, errorSummary: null });

    const restaurant = demoStore.getRestaurant(rec.restaurantId);
    const categories = demoStore.categories.where((c) => c.restaurantId === rec.restaurantId);
    const products = demoStore.products.where((p) => p.restaurantId === rec.restaurantId);

    for (const stage of IMPORT_PIPELINE_STAGES) {
      const current = demoStore.menuImports.byId(importId);
      if (!current || current.processingStatus === "CANCELLED") return current;
      const meta = STAGE_META[stage];
      this.patch(importId, { processingStatus: stage });
      this.appendEvent(
        importId,
        event(stage, stage, meta.progress, meta.label, {
          totalPages: rec.pageCount,
          page: Math.max(1, Math.round((meta.progress / 100) * rec.pageCount)),
        }),
      );
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    }

    const after = demoStore.menuImports.byId(importId);
    if (!after || after.processingStatus === "CANCELLED") return after;

    const result: ImportResult = buildDeterministicResult({
      importId,
      restaurantId: rec.restaurantId,
      fileName: rec.originalFileName,
      config: rec.config,
      restaurantName: restaurant?.displayName ?? "Restaurant",
      categories,
      products,
    });

    return this.patch(importId, {
      processingStatus: "REVIEW_REQUIRED",
      reviewStatus: "IN_REVIEW",
      reviewedBy: rec.createdBy,
      progress: 100,
      currentStage: "REVIEW_REQUIRED",
      result,
    });
  },

  saveResult(importId: string, result: ImportResult): MenuImport | null {
    return this.patch(importId, { result });
  },

  resolveWarning(importId: string, warningId: string, resolvedBy: string | null): MenuImport | null {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec?.result) return null;
    const warnings = rec.result.warnings.map((w) =>
      w.id === warningId ? { ...w, resolved: true, resolvedBy, resolvedAt: now() } : w,
    );
    return this.patch(importId, { result: { ...rec.result, warnings } });
  },

  approve(importId: string, approvedBy: string | null): { ok: boolean; reason?: string } {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec?.result) return { ok: false, reason: "No extraction result to approve." };
    const outcome = validateImportResult(rec.result);
    if (!outcome.ok) {
      const reason =
        outcome.unresolvedBlocking.length > 0
          ? "Resolve blocking warnings before approval."
          : outcome.schemaErrors[0] ?? "No products selected for import.";
      return { ok: false, reason };
    }
    this.patch(importId, {
      processingStatus: "READY_TO_IMPORT",
      reviewStatus: "APPROVED",
      approvedBy,
    });
    return { ok: true };
  },

  /**
   * Commit approved candidates into the restaurant's DRAFT menu. The published
   * (active) menu is never touched: new categories/products are created with
   * `draft`/`hidden` status. Atomic-ish: builds all records, then writes.
   */
  commit(importId: string, committedBy: { id: string | null; role: Role }): { ok: boolean; reason?: string; created?: { categories: number; products: number } } {
    const rec = demoStore.menuImports.byId(importId);
    if (!rec?.result) return { ok: false, reason: "Nothing to commit." };
    if (rec.processingStatus !== "READY_TO_IMPORT") {
      return { ok: false, reason: "Import must be approved before committing." };
    }
    const outcome = validateImportResult(rec.result);
    if (!outcome.ok) return { ok: false, reason: "Validation failed at commit time." };

    this.patch(importId, { processingStatus: "IMPORTING" });

    const newCategories: MenuCategory[] = [];
    const newProducts: MenuProduct[] = [];

    for (const cat of rec.result.categories) {
      if (!cat.selectedForImport || cat.reviewState === "rejected") continue;
      const catId = createId("cat");
      newCategories.push({
        id: catId,
        restaurantId: rec.restaurantId,
        localizedName: { en: cat.name.value },
        localizedDescription: cat.description ? { en: cat.description.value } : null,
        sortOrder: cat.displayOrder,
        status: "draft",
        image: cat.image?.temporaryUrl ?? null,
      });
      for (const item of cat.items) {
        if (!item.selectedForImport || item.reviewState === "rejected") continue;
        newProducts.push({
          id: createId("prod"),
          categoryId: catId,
          restaurantId: rec.restaurantId,
          slug: item.proposedId.replace(/^item-/, ""),
          localizedName: { en: item.name.value },
          localizedDescription: item.description ? { en: item.description.value } : null,
          price: item.basePrice?.amount ?? 0,
          currency: item.basePrice?.currency ?? rec.result.restaurant.currency,
          image: item.image?.temporaryUrl ?? null,
          availability: item.available ? "available" : "out-of-stock",
          variants: item.variants.map((v) => ({
            id: createId("var"),
            label: v.name,
            priceModifier: v.price.amount - (item.basePrice?.amount ?? v.price.amount),
          })),
          dietaryLabels: item.dietaryLabels,
          allergenNote: item.allergens.length ? item.allergens.join(", ") : null,
          featured: false,
          sortOrder: item.displayOrder,
        });
      }
    }

    // Write (demo store is synchronous; this is the atomic-equivalent step).
    newCategories.forEach((c) => demoStore.categories.create(c));
    newProducts.forEach((p) => demoStore.products.create(p));

    demoStore.recordActivity({
      actorId: committedBy.id ?? "demo",
      actorRole: committedBy.role,
      action: "menu_import.committed",
      resourceType: "menu-import",
      resourceId: importId,
      description: `Imported ${newCategories.length} categories and ${newProducts.length} products into the draft menu`,
    });

    this.patch(importId, {
      processingStatus: "COMPLETED",
      committedMenuRef: `draft:${rec.restaurantId}`,
      completedAt: now(),
      result: {
        ...rec.result,
        statistics: { ...rec.result.statistics, manualCorrections: rec.result.statistics.manualCorrections },
      },
    });
    this.appendEvent(importId, event("DONE", "COMPLETED", 100, "Imported into draft menu"));

    return { ok: true, created: { categories: newCategories.length, products: newProducts.length } };
  },

  archive(importId: string): void {
    this.patch(importId, { processingStatus: "ARCHIVED", archivedAt: now() });
  },
};
