import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import type {
  ActivityRecord,
  AdminUser,
  Branding,
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
  PlatformSettings,
  QRCodeRecord,
  Restaurant,
  RestaurantLocation,
  Template,
  WebsiteContentBlock,
} from "@/domain/entities";
import type { MenuImport } from "@/domain/menu-import";

/**
 * Relational schema backing the real repositories.
 *
 * Strategy: every table carries typed key columns for the fields we actually
 * query/sort/filter on, plus a `data` jsonb column holding the full validated
 * domain entity. This preserves 100% fidelity with `src/domain/entities` while
 * keeping the schema small and evolvable — individual fields can be promoted to
 * real columns later without changing the repository contract.
 */

export const restaurants = pgTable("restaurants", {
  id: text("id").primaryKey(),
  internalId: text("internal_id").notNull(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  operationalStatus: text("operational_status").notNull(),
  publishingStatus: text("publishing_status").notNull(),
  setupStatus: text("setup_status").notNull(),
  visualDirection: text("visual_direction").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  data: jsonb("data").$type<Restaurant>().notNull(),
});

export const restaurantLocations = pgTable("restaurant_locations", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  data: jsonb("data").$type<RestaurantLocation>().notNull(),
});

export const openingHours = pgTable(
  "opening_hours",
  {
    restaurantId: text("restaurant_id").notNull(),
    day: text("day").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    data: jsonb("data").$type<OpeningHours>().notNull(),
  },
  (t) => [primaryKey({ columns: [t.restaurantId, t.day] })],
);

export const branding = pgTable("branding", {
  restaurantId: text("restaurant_id").primaryKey(),
  data: jsonb("data").$type<Branding>().notNull(),
});

export const menuCategories = pgTable("menu_categories", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").notNull(),
  data: jsonb("data").$type<MenuCategory>().notNull(),
});

export const menuProducts = pgTable("menu_products", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  categoryId: text("category_id").notNull(),
  slug: text("slug").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<MenuProduct>().notNull(),
});

export const customerActions = pgTable("customer_actions", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  type: text("type").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<CustomerAction>().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  slug: text("slug").notNull(),
  status: text("status").notNull(),
  data: jsonb("data").$type<Campaign>().notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  data: jsonb("data").$type<QRCodeRecord>().notNull(),
});

export const nfcProducts = pgTable("nfc_products", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id"),
  data: jsonb("data").$type<NFCProduct>().notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  data: jsonb("data").$type<Enquiry>().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id"),
  data: jsonb("data").$type<MediaAsset>().notNull(),
});

export const activity = pgTable("activity", {
  id: text("id").primaryKey(),
  resourceId: text("resource_id").notNull(),
  timestamp: text("timestamp").notNull(),
  data: jsonb("data").$type<ActivityRecord>().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  // scrypt password hash for real auth (AUTH_MODE=real). Never returned to the
  // client — the AdminUser domain entity (in `data`) has no password field.
  passwordHash: text("password_hash"),
  data: jsonb("data").$type<AdminUser>().notNull(),
});

// Team directory (managed staff shown in /admin/team). Distinct from the auth
// users in `admin_users`, mirroring the separate `seedTeam` / `seedAdminUsers`.
export const team = pgTable("team", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  data: jsonb("data").$type<AdminUser>().notNull(),
});

export const websiteContent = pgTable("website_content", {
  id: text("id").primaryKey(),
  page: text("page").notNull(),
  section: text("section").notNull(),
  status: text("status").notNull(),
  data: jsonb("data").$type<WebsiteContentBlock>().notNull(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<Template>().notNull(),
});

export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<PackagePlan>().notNull(),
});

export const faqEntries = pgTable("faq_entries", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  data: jsonb("data").$type<FaqEntry>().notNull(),
});

export const legalPages = pgTable("legal_pages", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  locale: text("locale").notNull(),
  status: text("status").notNull(),
  data: jsonb("data").$type<LegalPage>().notNull(),
});

export const menuImports = pgTable("menu_imports", {
  id: text("id").primaryKey(),
  restaurantId: text("restaurant_id").notNull(),
  processingStatus: text("processing_status").notNull(),
  createdAt: text("created_at").notNull(),
  data: jsonb("data").$type<MenuImport>().notNull(),
});

// Global platform settings — single row keyed by a constant id.
export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey(),
  data: jsonb("data").$type<PlatformSettings>().notNull(),
});

export const PLATFORM_SETTINGS_ID = "global";
