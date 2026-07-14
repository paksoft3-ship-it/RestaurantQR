import "server-only";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { computeSnapshot, type EventRow } from "@/data/analytics/compute";
import type {
  ActivityRepository,
  AnalyticsRepository,
  AuthRepository,
  BrandingRepository,
  CampaignRepository,
  ContentRepository,
  EnquiryRepository,
  LegalContentRepository,
  MediaRepository,
  MenuRepository,
  NFCProductRepository,
  Paginated,
  QRCodeRepository,
  RepositoryBundle,
  RestaurantListQuery,
  RestaurantRepository,
} from "@/domain/repositories";
import type { ActivityRecord, Branding, Enquiry, Restaurant } from "@/domain/entities";
import { getLegalPage } from "@/content/legal";
import { createId } from "@/lib/utils";
import { verifyPassword } from "@/lib/auth/password";
import { getDb, schema } from "@/data/db/client";
import { PLATFORM_SETTINGS_ID } from "@/data/db/schema";
import { seedSettings } from "@/data/seed";

/**
 * Database-backed implementation of the repository contracts (Drizzle + Postgres).
 * Returns the domain entities stored in each table's `data` jsonb payload, so it
 * is a drop-in replacement for the in-memory mock behind `getRepositories()`.
 *
 * Analytics is still computed (no events pipeline yet) and legal content is
 * authored (not seeded), so those two delegate to the existing static sources.
 */

function paginate<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

const restaurantRepo: RestaurantRepository = {
  async list(query: RestaurantListQuery = {}) {
    const rows = await getDb().select({ data: schema.restaurants.data }).from(schema.restaurants);
    let items = rows.map((r) => r.data);
    items = items.filter((r) => (query.includeArchived ? true : r.publishingStatus !== "archived"));
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.slug.includes(q) ||
          r.internalId.toLowerCase().includes(q),
      );
    }
    if (query.operationalStatus) items = items.filter((r) => r.operationalStatus === query.operationalStatus);
    if (query.publishingStatus) items = items.filter((r) => r.publishingStatus === query.publishingStatus);
    if (query.setupStatus) items = items.filter((r) => r.setupStatus === query.setupStatus);
    if (query.visualDirection) items = items.filter((r) => r.visualDirection === query.visualDirection);
    if (query.sort === "name") items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (query.sort === "recent") items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return paginate(items, query.page, query.pageSize ?? 25);
  },
  async getById(id) {
    const [row] = await getDb()
      .select({ data: schema.restaurants.data })
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id))
      .limit(1);
    return row?.data ?? null;
  },
  async getBySlug(slug) {
    const [row] = await getDb()
      .select({ data: schema.restaurants.data })
      .from(schema.restaurants)
      .where(eq(schema.restaurants.slug, slug))
      .limit(1);
    return row?.data ?? null;
  },
  async isSlugAvailable(slug, exceptId) {
    const rows = await getDb()
      .select({ id: schema.restaurants.id })
      .from(schema.restaurants)
      .where(eq(schema.restaurants.slug, slug));
    return !rows.some((r) => r.id !== exceptId);
  },
  async create(input) {
    const stamp = new Date().toISOString();
    const created: Restaurant = { ...input, id: createId("rest"), createdAt: stamp, updatedAt: stamp };
    await getDb().insert(schema.restaurants).values({
      id: created.id,
      internalId: created.internalId,
      slug: created.slug,
      name: created.name,
      operationalStatus: created.operationalStatus,
      publishingStatus: created.publishingStatus,
      setupStatus: created.setupStatus,
      visualDirection: created.visualDirection,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      data: created,
    });
    return created;
  },
  async update(id, patch) {
    const current = await restaurantRepo.getById(id);
    if (!current) throw new Error("Restaurant not found");
    const next: Restaurant = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await getDb()
      .update(schema.restaurants)
      .set({
        internalId: next.internalId,
        slug: next.slug,
        name: next.name,
        operationalStatus: next.operationalStatus,
        publishingStatus: next.publishingStatus,
        setupStatus: next.setupStatus,
        visualDirection: next.visualDirection,
        updatedAt: next.updatedAt,
        data: next,
      })
      .where(eq(schema.restaurants.id, id));
    return next;
  },
  async disable(id) {
    return restaurantRepo.update(id, { operationalStatus: "disabled" });
  },
  async archive(id) {
    return restaurantRepo.update(id, { publishingStatus: "archived" });
  },
  async locations(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.restaurantLocations.data })
      .from(schema.restaurantLocations)
      .where(eq(schema.restaurantLocations.restaurantId, restaurantId));
    return rows.map((r) => r.data);
  },
  async openingHours(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.openingHours.data })
      .from(schema.openingHours)
      .where(eq(schema.openingHours.restaurantId, restaurantId))
      .orderBy(asc(schema.openingHours.sortOrder));
    return rows.map((r) => r.data);
  },
};

const brandingRepo: BrandingRepository = {
  async get(restaurantId) {
    const [row] = await getDb()
      .select({ data: schema.branding.data })
      .from(schema.branding)
      .where(eq(schema.branding.restaurantId, restaurantId))
      .limit(1);
    return row?.data ?? null;
  },
  async update(restaurantId, patch) {
    const current = await brandingRepo.get(restaurantId);
    if (!current) throw new Error("Branding not found");
    const next: Branding = { ...current, ...patch };
    await getDb()
      .update(schema.branding)
      .set({ data: next })
      .where(eq(schema.branding.restaurantId, restaurantId));
    return next;
  },
};

const menuRepo: MenuRepository = {
  async categories(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.menuCategories.data })
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.restaurantId, restaurantId))
      .orderBy(asc(schema.menuCategories.sortOrder));
    return rows.map((r) => r.data);
  },
  async products(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.menuProducts.data })
      .from(schema.menuProducts)
      .where(eq(schema.menuProducts.restaurantId, restaurantId))
      .orderBy(asc(schema.menuProducts.sortOrder));
    return rows.map((r) => r.data);
  },
  async productBySlug(restaurantId, slug) {
    const [row] = await getDb()
      .select({ data: schema.menuProducts.data })
      .from(schema.menuProducts)
      .where(and(eq(schema.menuProducts.restaurantId, restaurantId), eq(schema.menuProducts.slug, slug)))
      .limit(1);
    return row?.data ?? null;
  },
  async customerActions(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.customerActions.data })
      .from(schema.customerActions)
      .where(eq(schema.customerActions.restaurantId, restaurantId))
      .orderBy(asc(schema.customerActions.sortOrder));
    return rows.map((r) => r.data);
  },
};

const campaignRepo: CampaignRepository = {
  async listByRestaurant(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.campaigns.data })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.restaurantId, restaurantId));
    return rows.map((r) => r.data);
  },
  async getBySlug(restaurantId, slug) {
    const [row] = await getDb()
      .select({ data: schema.campaigns.data })
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.restaurantId, restaurantId), eq(schema.campaigns.slug, slug)))
      .limit(1);
    return row?.data ?? null;
  },
};

const qrRepo: QRCodeRepository = {
  async listByRestaurant(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.qrCodes.data })
      .from(schema.qrCodes)
      .where(eq(schema.qrCodes.restaurantId, restaurantId));
    return rows.map((r) => r.data);
  },
  async countByRestaurant(restaurantId) {
    return (await qrRepo.listByRestaurant(restaurantId)).length;
  },
};

const nfcRepo: NFCProductRepository = {
  async listByRestaurant(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.nfcProducts.data })
      .from(schema.nfcProducts)
      .where(eq(schema.nfcProducts.restaurantId, restaurantId));
    return rows.map((r) => r.data);
  },
  async countByRestaurant(restaurantId) {
    return (await nfcRepo.listByRestaurant(restaurantId)).length;
  },
};

const enquiryRepo: EnquiryRepository = {
  async list() {
    const rows = await getDb()
      .select({ data: schema.enquiries.data })
      .from(schema.enquiries)
      .orderBy(desc(schema.enquiries.createdAt));
    return rows.map((r) => r.data);
  },
  async create(input) {
    const created: Enquiry = {
      ...input,
      id: createId("enq"),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    await getDb()
      .insert(schema.enquiries)
      .values({ id: created.id, status: created.status, createdAt: created.createdAt, data: created });
    return created;
  },
};

/** Load raw interaction events (last ~31 days) for aggregation. */
async function loadEventRows(restaurantId?: string): Promise<EventRow[]> {
  const cutoff = new Date(Date.now() - 31 * 86_400_000).toISOString();
  const cols = {
    type: schema.events.type,
    channel: schema.events.channel,
    actionType: schema.events.actionType,
    target: schema.events.target,
    createdAt: schema.events.createdAt,
  };
  const where = restaurantId
    ? and(eq(schema.events.restaurantId, restaurantId), gte(schema.events.createdAt, cutoff))
    : gte(schema.events.createdAt, cutoff);
  return getDb().select(cols).from(schema.events).where(where);
}

const analyticsRepo: AnalyticsRepository = {
  async restaurantSnapshot(restaurantId) {
    return computeSnapshot(await loadEventRows(restaurantId), Date.now());
  },
  async platformSnapshot() {
    return computeSnapshot(await loadEventRows(), Date.now());
  },
};

const legalRepo: LegalContentRepository = {
  async get(type) {
    const rows = await getDb().select({ data: schema.legalPages.data }).from(schema.legalPages);
    const match = rows.map((r) => r.data).find((l) => l.type === type && l.status === "published");
    // Fall back to the authored static content if nothing is published in the DB.
    return match ?? getLegalPage(type);
  },
};

const contentRepo: ContentRepository = {
  async settings() {
    const [row] = await getDb()
      .select({ data: schema.platformSettings.data })
      .from(schema.platformSettings)
      .where(eq(schema.platformSettings.id, PLATFORM_SETTINGS_ID))
      .limit(1);
    return row?.data ?? seedSettings;
  },
  async websiteContent() {
    const rows = await getDb().select({ data: schema.websiteContent.data }).from(schema.websiteContent);
    return rows.map((r) => r.data).filter((w) => w.status === "published");
  },
  async templates() {
    const rows = await getDb()
      .select({ data: schema.templates.data })
      .from(schema.templates)
      .orderBy(asc(schema.templates.sortOrder));
    return rows.map((r) => r.data).filter((t) => t.status === "published");
  },
  async packages() {
    const rows = await getDb()
      .select({ data: schema.packages.data })
      .from(schema.packages)
      .orderBy(asc(schema.packages.sortOrder));
    return rows.map((r) => r.data).filter((p) => p.status === "published");
  },
  async faq() {
    const rows = await getDb()
      .select({ data: schema.faqEntries.data })
      .from(schema.faqEntries)
      .orderBy(asc(schema.faqEntries.sortOrder));
    return rows.map((r) => r.data).filter((f) => f.status === "published");
  },
};

const mediaRepo: MediaRepository = {
  async listByRestaurant(restaurantId) {
    const rows = await getDb()
      .select({ data: schema.media.data })
      .from(schema.media)
      .where(eq(schema.media.restaurantId, restaurantId));
    return rows.map((r) => r.data);
  },
};

const activityRepo: ActivityRepository = {
  async recent(limit = 10) {
    const rows = await getDb()
      .select({ data: schema.activity.data })
      .from(schema.activity)
      .orderBy(desc(schema.activity.timestamp))
      .limit(limit);
    return rows.map((r) => r.data);
  },
  async byRestaurant(restaurantId, limit = 10) {
    const rows = await getDb()
      .select({ data: schema.activity.data })
      .from(schema.activity)
      .where(eq(schema.activity.resourceId, restaurantId))
      .orderBy(desc(schema.activity.timestamp))
      .limit(limit);
    return rows.map((r) => r.data);
  },
  async record(input) {
    const created: ActivityRecord = {
      ...input,
      id: createId("act"),
      timestamp: new Date().toISOString(),
    };
    await getDb()
      .insert(schema.activity)
      .values({ id: created.id, resourceId: created.resourceId, timestamp: created.timestamp, data: created });
    return created;
  },
};

const authRepo: AuthRepository = {
  async findByEmail(email) {
    const rows = await getDb().select({ data: schema.adminUsers.data }).from(schema.adminUsers);
    return rows.map((r) => r.data).find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async verifyCredentials(email, password) {
    // Real auth: match the email, then verify the stored scrypt password hash.
    const rows = await getDb()
      .select({ data: schema.adminUsers.data, passwordHash: schema.adminUsers.passwordHash })
      .from(schema.adminUsers);
    const match = rows.find((r) => r.data.email.toLowerCase() === email.toLowerCase());
    if (!match) return null;
    const ok = await verifyPassword(password, match.passwordHash);
    return ok ? match.data : null;
  },
};

export const dbRepositories: RepositoryBundle = {
  restaurants: restaurantRepo,
  branding: brandingRepo,
  menus: menuRepo,
  campaigns: campaignRepo,
  qr: qrRepo,
  nfc: nfcRepo,
  enquiries: enquiryRepo,
  analytics: analyticsRepo,
  legal: legalRepo,
  media: mediaRepo,
  activity: activityRepo,
  auth: authRepo,
  content: contentRepo,
};
