import { eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import * as schema from "@/data/db/schema";
import { PLATFORM_SETTINGS_ID } from "@/data/db/schema";
import { seedSettings } from "@/data/seed";
import type { Database } from "@/data/db/client";
import type {
  ActivityRecord,
  AdminUser,
  Campaign,
  CustomerAction,
  Enquiry,
  FaqEntry,
  LegalPage,
  MediaAsset,
  MenuCategory,
  MenuProduct,
  NFCProduct,
  OpeningHours,
  PackagePlan,
  QRCodeRecord,
  RestaurantLocation,
  Template,
  WebsiteContentBlock,
} from "@/domain/entities";
import type { MenuImport } from "@/domain/menu-import";
import type { AdminSnapshot, ArrayCollectionKey, PersistOp } from "./types";

/**
 * Pure database logic for the admin store, decoupled from authentication and
 * from the server-only connection singleton (the `Database` is injected). This
 * keeps the auth-gated server action (`adminPersist`) as the ONLY network-
 * exposed mutation entry point, and makes the persistence logic testable in
 * isolation against any database handle.
 */

interface CollectionOps {
  create(item: unknown): Promise<void>;
  update(item: unknown): Promise<void>;
  remove(id: string): Promise<void>;
  replaceAll(items: unknown[]): Promise<void>;
}

type StoreTable = PgTable & { id: PgColumn; data: PgColumn };

function makeOps<TEntity extends { id: string }, TTable extends StoreTable>(
  db: Database,
  table: TTable,
  toRow: (entity: TEntity) => TTable["$inferInsert"],
): CollectionOps {
  return {
    async create(item) {
      await db.insert(table).values(toRow(item as TEntity));
    },
    async update(item) {
      const entity = item as TEntity;
      await db.update(table).set(toRow(entity)).where(eq(table.id, entity.id));
    },
    async remove(id) {
      await db.delete(table).where(eq(table.id, id));
    },
    async replaceAll(items) {
      await db.delete(table);
      const rows = (items as TEntity[]).map(toRow);
      if (rows.length) await db.insert(table).values(rows);
    },
  };
}

function opsFor(db: Database, collection: ArrayCollectionKey): CollectionOps {
  switch (collection) {
    case "categories":
      return makeOps(db, schema.menuCategories, (c: MenuCategory) => ({
        id: c.id,
        restaurantId: c.restaurantId,
        sortOrder: c.sortOrder,
        status: c.status,
        data: c,
      }));
    case "products":
      return makeOps(db, schema.menuProducts, (p: MenuProduct) => ({
        id: p.id,
        restaurantId: p.restaurantId,
        categoryId: p.categoryId,
        slug: p.slug,
        sortOrder: p.sortOrder,
        data: p,
      }));
    case "customerActions":
      return makeOps(db, schema.customerActions, (a: CustomerAction) => ({
        id: a.id,
        restaurantId: a.restaurantId,
        type: a.type,
        enabled: a.enabled,
        status: a.status,
        sortOrder: a.sortOrder,
        data: a,
      }));
    case "locations":
      return makeOps(db, schema.restaurantLocations, (l: RestaurantLocation) => ({
        id: l.id,
        restaurantId: l.restaurantId,
        data: l,
      }));
    case "campaigns":
      return makeOps(db, schema.campaigns, (c: Campaign) => ({
        id: c.id,
        restaurantId: c.restaurantId,
        slug: c.slug,
        status: c.status,
        data: c,
      }));
    case "qr":
      return makeOps(db, schema.qrCodes, (q: QRCodeRecord) => ({
        id: q.id,
        restaurantId: q.restaurantId,
        data: q,
      }));
    case "nfc":
      return makeOps(db, schema.nfcProducts, (n: NFCProduct) => ({
        id: n.id,
        restaurantId: n.restaurantId,
        data: n,
      }));
    case "media":
      return makeOps(db, schema.media, (m: MediaAsset) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        data: m,
      }));
    case "enquiries":
      return makeOps(db, schema.enquiries, (e: Enquiry) => ({
        id: e.id,
        status: e.status,
        createdAt: e.createdAt,
        data: e,
      }));
    case "team":
      return makeOps(db, schema.team, (u: AdminUser) => ({ id: u.id, email: u.email, data: u }));
    case "audit":
      return makeOps(db, schema.activity, (a: ActivityRecord) => ({
        id: a.id,
        resourceId: a.resourceId,
        timestamp: a.timestamp,
        data: a,
      }));
    case "websiteContent":
      return makeOps(db, schema.websiteContent, (w: WebsiteContentBlock) => ({
        id: w.id,
        page: w.page,
        section: w.section,
        status: w.status,
        data: w,
      }));
    case "templates":
      return makeOps(db, schema.templates, (t: Template) => ({
        id: t.id,
        status: t.status,
        sortOrder: t.sortOrder,
        data: t,
      }));
    case "packages":
      return makeOps(db, schema.packages, (p: PackagePlan) => ({
        id: p.id,
        status: p.status,
        sortOrder: p.sortOrder,
        data: p,
      }));
    case "faq":
      return makeOps(db, schema.faqEntries, (f: FaqEntry) => ({
        id: f.id,
        category: f.category,
        status: f.status,
        sortOrder: f.sortOrder,
        data: f,
      }));
    case "legal":
      return makeOps(db, schema.legalPages, (l: LegalPage) => ({
        id: l.id,
        type: l.type,
        locale: l.locale,
        status: l.status,
        data: l,
      }));
    case "menuImports":
      return makeOps(db, schema.menuImports, (m: MenuImport) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        processingStatus: m.processingStatus,
        createdAt: m.createdAt,
        data: m,
      }));
    default: {
      const never: never = collection;
      throw new Error(`Unknown collection: ${String(never)}`);
    }
  }
}

/** Apply a single persist instruction to the given database. */
export async function applyPersist(db: Database, op: PersistOp): Promise<void> {
  switch (op.kind) {
    case "create":
      await opsFor(db, op.collection).create(op.item);
      return;
    case "update":
      await opsFor(db, op.collection).update(op.next);
      return;
    case "remove":
      await opsFor(db, op.collection).remove(op.id);
      return;
    case "setAll":
      await opsFor(db, op.collection).replaceAll(op.items);
      return;
    case "restaurant.create": {
      const r = op.item;
      await db.insert(schema.restaurants).values({
        id: r.id,
        internalId: r.internalId,
        slug: r.slug,
        name: r.name,
        operationalStatus: r.operationalStatus,
        publishingStatus: r.publishingStatus,
        setupStatus: r.setupStatus,
        visualDirection: r.visualDirection,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        data: r,
      });
      return;
    }
    case "restaurant.update": {
      const r = op.next;
      await db
        .update(schema.restaurants)
        .set({
          internalId: r.internalId,
          slug: r.slug,
          name: r.name,
          operationalStatus: r.operationalStatus,
          publishingStatus: r.publishingStatus,
          setupStatus: r.setupStatus,
          visualDirection: r.visualDirection,
          updatedAt: r.updatedAt,
          data: r,
        })
        .where(eq(schema.restaurants.id, r.id));
      return;
    }
    case "branding.set":
      await db
        .insert(schema.branding)
        .values({ restaurantId: op.restaurantId, data: op.value })
        .onConflictDoUpdate({ target: schema.branding.restaurantId, set: { data: op.value } });
      return;
    case "openingHours.set":
      await db.delete(schema.openingHours).where(eq(schema.openingHours.restaurantId, op.restaurantId));
      if (op.hours.length) {
        await db.insert(schema.openingHours).values(
          op.hours.map((h: OpeningHours, index: number) => ({
            restaurantId: op.restaurantId,
            day: h.day,
            sortOrder: index,
            data: h,
          })),
        );
      }
      return;
    case "settings.set":
      await db
        .insert(schema.platformSettings)
        .values({ id: PLATFORM_SETTINGS_ID, data: op.value })
        .onConflictDoUpdate({ target: schema.platformSettings.id, set: { data: op.value } });
      return;
    default: {
      const never: never = op;
      throw new Error(`Unknown persist op: ${String(never)}`);
    }
  }
}

/** Load a full snapshot of admin-editable data from the given database. */
export async function loadSnapshot(db: Database): Promise<AdminSnapshot> {
  const [
    restaurants,
    branding,
    categories,
    products,
    customerActions,
    locations,
    openingHoursRows,
    campaigns,
    qr,
    nfc,
    media,
    enquiries,
    team,
    audit,
    websiteContent,
    templates,
    packages,
    faq,
    legal,
    menuImports,
    settingsRows,
  ] = await Promise.all([
    db.select({ data: schema.restaurants.data }).from(schema.restaurants),
    db.select({ data: schema.branding.data }).from(schema.branding),
    db.select({ data: schema.menuCategories.data }).from(schema.menuCategories),
    db.select({ data: schema.menuProducts.data }).from(schema.menuProducts),
    db.select({ data: schema.customerActions.data }).from(schema.customerActions),
    db.select({ data: schema.restaurantLocations.data }).from(schema.restaurantLocations),
    db
      .select({
        restaurantId: schema.openingHours.restaurantId,
        sortOrder: schema.openingHours.sortOrder,
        data: schema.openingHours.data,
      })
      .from(schema.openingHours),
    db.select({ data: schema.campaigns.data }).from(schema.campaigns),
    db.select({ data: schema.qrCodes.data }).from(schema.qrCodes),
    db.select({ data: schema.nfcProducts.data }).from(schema.nfcProducts),
    db.select({ data: schema.media.data }).from(schema.media),
    db.select({ data: schema.enquiries.data }).from(schema.enquiries),
    db.select({ data: schema.team.data }).from(schema.team),
    db.select({ data: schema.activity.data }).from(schema.activity),
    db.select({ data: schema.websiteContent.data }).from(schema.websiteContent),
    db.select({ data: schema.templates.data }).from(schema.templates),
    db.select({ data: schema.packages.data }).from(schema.packages),
    db.select({ data: schema.faqEntries.data }).from(schema.faqEntries),
    db.select({ data: schema.legalPages.data }).from(schema.legalPages),
    db.select({ data: schema.menuImports.data }).from(schema.menuImports),
    db
      .select({ data: schema.platformSettings.data })
      .from(schema.platformSettings)
      .where(eq(schema.platformSettings.id, PLATFORM_SETTINGS_ID))
      .limit(1),
  ]);

  const openingHours: Record<string, OpeningHours[]> = {};
  for (const row of [...openingHoursRows].sort((a, b) => a.sortOrder - b.sortOrder)) {
    (openingHours[row.restaurantId] ??= []).push(row.data);
  }

  return {
    restaurants: restaurants.map((r) => r.data),
    branding: branding.map((r) => r.data),
    categories: categories.map((r) => r.data),
    products: products.map((r) => r.data),
    customerActions: customerActions.map((r) => r.data),
    locations: locations.map((r) => r.data),
    openingHours,
    campaigns: campaigns.map((r) => r.data),
    qr: qr.map((r) => r.data),
    nfc: nfc.map((r) => r.data),
    media: media.map((r) => r.data),
    enquiries: enquiries.map((r) => r.data),
    team: team.map((r) => r.data),
    audit: audit.map((r) => r.data),
    websiteContent: websiteContent.map((r) => r.data),
    templates: templates.map((r) => r.data),
    packages: packages.map((r) => r.data),
    faq: faq.map((r) => r.data),
    legal: legal.map((r) => r.data),
    menuImports: menuImports.map((r) => r.data),
    settings: settingsRows[0]?.data ?? seedSettings,
  };
}
