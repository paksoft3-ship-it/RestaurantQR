import "server-only";
import { computeSnapshot } from "@/data/analytics/compute";
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
import type { Enquiry, Restaurant } from "@/domain/entities";
import { getLegalPage } from "@/content/legal";
import { createId } from "@/lib/utils";
import {
  seedActivity,
  seedBranding,
  seedCampaigns,
  seedCategories,
  seedCustomerActions,
  seedEnquiries,
  seedFaqEntries,
  seedMedia,
  seedNFCProducts,
  seedOpeningHours,
  seedPackages,
  seedProducts,
  seedQRCodes,
  seedRestaurants,
  seedLocations,
  seedAdminUsers,
  seedSettings,
  seedTemplates,
  seedWebsiteContent,
} from "@/data/seed";

/**
 * In-memory mock store for server-side reads (public pages and admin SSR).
 * Persistent admin mutations in demo mode happen client-side via the demo
 * store; this layer is deliberately seed-backed and replaceable by a real
 * backend implementing the same repository interfaces.
 */

const restaurants = [...seedRestaurants];
const enquiries = [...seedEnquiries];

function paginate<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

const restaurantRepo: RestaurantRepository = {
  async list(query: RestaurantListQuery = {}) {
    let items = restaurants.filter((r) =>
      query.includeArchived ? true : r.publishingStatus !== "archived",
    );
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
    return restaurants.find((r) => r.id === id) ?? null;
  },
  async getBySlug(slug) {
    return restaurants.find((r) => r.slug === slug) ?? null;
  },
  async isSlugAvailable(slug, exceptId) {
    return !restaurants.some((r) => r.slug === slug && r.id !== exceptId);
  },
  async create(input) {
    const stamp = new Date().toISOString();
    const created: Restaurant = { ...input, id: createId("rest"), createdAt: stamp, updatedAt: stamp };
    restaurants.unshift(created);
    return created;
  },
  async update(id, patch) {
    const idx = restaurants.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Restaurant not found");
    restaurants[idx] = { ...restaurants[idx], ...patch, updatedAt: new Date().toISOString() };
    return restaurants[idx];
  },
  async disable(id) {
    return restaurantRepo.update(id, { operationalStatus: "disabled" });
  },
  async archive(id) {
    return restaurantRepo.update(id, { publishingStatus: "archived" });
  },
  async locations(restaurantId) {
    return seedLocations.filter((l) => l.restaurantId === restaurantId);
  },
  async openingHours(restaurantId) {
    return seedOpeningHours[restaurantId] ?? [];
  },
};

const brandingRepo: BrandingRepository = {
  async get(restaurantId) {
    return seedBranding.find((b) => b.restaurantId === restaurantId) ?? null;
  },
  async update(restaurantId, patch) {
    const idx = seedBranding.findIndex((b) => b.restaurantId === restaurantId);
    if (idx < 0) throw new Error("Branding not found");
    seedBranding[idx] = { ...seedBranding[idx], ...patch };
    return seedBranding[idx];
  },
};

const menuRepo: MenuRepository = {
  async categories(restaurantId) {
    return seedCategories.filter((c) => c.restaurantId === restaurantId).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async products(restaurantId) {
    return seedProducts.filter((p) => p.restaurantId === restaurantId);
  },
  async productBySlug(restaurantId, slug) {
    return seedProducts.find((p) => p.restaurantId === restaurantId && p.slug === slug) ?? null;
  },
  async customerActions(restaurantId) {
    return seedCustomerActions.filter((a) => a.restaurantId === restaurantId).sort((a, b) => a.sortOrder - b.sortOrder);
  },
};

const campaignRepo: CampaignRepository = {
  async listByRestaurant(restaurantId) {
    return seedCampaigns.filter((c) => c.restaurantId === restaurantId);
  },
  async getBySlug(restaurantId, slug) {
    return seedCampaigns.find((c) => c.restaurantId === restaurantId && c.slug === slug) ?? null;
  },
};

const qrRepo: QRCodeRepository = {
  async listByRestaurant(restaurantId) {
    return seedQRCodes.filter((q) => q.restaurantId === restaurantId);
  },
  async countByRestaurant(restaurantId) {
    return seedQRCodes.filter((q) => q.restaurantId === restaurantId).length;
  },
};

const nfcRepo: NFCProductRepository = {
  async listByRestaurant(restaurantId) {
    return seedNFCProducts.filter((n) => n.restaurantId === restaurantId);
  },
  async countByRestaurant(restaurantId) {
    return seedNFCProducts.filter((n) => n.restaurantId === restaurantId).length;
  },
};

const enquiryRepo: EnquiryRepository = {
  async list() {
    return [...enquiries];
  },
  async create(input) {
    const created: Enquiry = { ...input, id: createId("enq"), status: "new", createdAt: new Date().toISOString() };
    enquiries.unshift(created);
    return created;
  },
};

// No database configured → no interaction events yet, so analytics are empty
// (real numbers appear once the DB-backed events pipeline is receiving traffic).
const analyticsRepo: AnalyticsRepository = {
  async restaurantSnapshot() {
    return computeSnapshot([], Date.now());
  },
  async platformSnapshot() {
    return computeSnapshot([], Date.now());
  },
};

const legalRepo: LegalContentRepository = {
  async get(type) {
    return getLegalPage(type);
  },
};

const mediaRepo: MediaRepository = {
  async listByRestaurant(restaurantId) {
    return seedMedia.filter((m) => m.restaurantId === restaurantId);
  },
};

const activityRepo: ActivityRepository = {
  async recent(limit = 10) {
    return [...seedActivity].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
  },
  async byRestaurant(restaurantId, limit = 10) {
    return seedActivity.filter((a) => a.resourceId === restaurantId).slice(0, limit);
  },
  async record(input) {
    const created = { ...input, id: createId("act"), timestamp: new Date().toISOString() };
    seedActivity.unshift(created);
    return created;
  },
};

const authRepo: AuthRepository = {
  async findByEmail(email) {
    return seedAdminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async verifyCredentials() {
    // The in-memory mock backend stores no password hashes. Real auth
    // (AUTH_MODE=real) therefore fails closed unless a database is configured;
    // mock-mode sign-in uses the mock secret path in `signIn`, not this method.
    return null;
  },
};

const contentRepo: ContentRepository = {
  async settings() {
    return seedSettings;
  },
  async websiteContent() {
    return seedWebsiteContent.filter((w) => w.status === "published");
  },
  async templates() {
    return seedTemplates.filter((t) => t.status === "published").sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async packages() {
    return seedPackages.filter((p) => p.status === "published").sort((a, b) => a.sortOrder - b.sortOrder);
  },
  async faq() {
    return seedFaqEntries.filter((f) => f.status === "published").sort((a, b) => a.sortOrder - b.sortOrder);
  },
};

export const repositories: RepositoryBundle = {
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
