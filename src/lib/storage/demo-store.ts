"use client";

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
import {
  SEED_VERSION,
  seedActivity,
  seedBranding,
  seedCampaigns,
  seedCategories,
  seedCustomerActions,
  seedEnquiries,
  seedFaqEntries,
  seedLegalPages,
  seedMedia,
  seedNFCProducts,
  seedOpeningHours,
  seedPackages,
  seedProducts,
  seedQRCodes,
  seedRestaurants,
  seedLocations,
  seedSettings,
  seedTeam,
  seedTemplates,
  seedWebsiteContent,
} from "@/data/seed";
import { appConfig } from "@/lib/config/app-config";

/**
 * Browser-local demo persistence. In demo mode, admin create/edit operations
 * persist here so changes survive navigation. This is NOT a production database
 * — it is gated behind the repository-shaped API and clearly labelled in the UI.
 *
 * Backed by a single versioned, corruption-safe localStorage record. Each entity
 * collection is exposed through a typed array API (all/byId/where/create/update/
 * remove/reorder/setAll), plus singleton helpers for settings/opening-hours.
 */

const STORAGE_KEY = "yp_demo_store";
const CHANGE_EVENT = "yp-demo-store-change";

interface DemoData {
  version: number;
  restaurants: Restaurant[];
  branding: Branding[];
  categories: MenuCategory[];
  products: MenuProduct[];
  customerActions: CustomerAction[];
  locations: RestaurantLocation[];
  openingHours: Record<string, OpeningHours[]>;
  campaigns: Campaign[];
  qr: QRCodeRecord[];
  nfc: NFCProduct[];
  media: MediaAsset[];
  enquiries: Enquiry[];
  team: AdminUser[];
  audit: ActivityRecord[];
  websiteContent: WebsiteContentBlock[];
  templates: Template[];
  packages: PackagePlan[];
  faq: FaqEntry[];
  legal: LegalPage[];
  menuImports: MenuImport[];
  settings: PlatformSettings;
}

type ArrayCollections = {
  [K in keyof DemoData]: DemoData[K] extends Array<infer _> ? K : never;
}[keyof DemoData];

function freshData(): DemoData {
  return {
    version: SEED_VERSION,
    restaurants: structuredClone(seedRestaurants),
    branding: structuredClone(seedBranding),
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    customerActions: structuredClone(seedCustomerActions),
    locations: structuredClone(seedLocations),
    openingHours: structuredClone(seedOpeningHours),
    campaigns: structuredClone(seedCampaigns),
    qr: structuredClone(seedQRCodes),
    nfc: structuredClone(seedNFCProducts),
    media: structuredClone(seedMedia),
    enquiries: structuredClone(seedEnquiries),
    team: structuredClone(seedTeam),
    audit: structuredClone(seedActivity),
    websiteContent: structuredClone(seedWebsiteContent),
    templates: structuredClone(seedTemplates),
    packages: structuredClone(seedPackages),
    faq: structuredClone(seedFaqEntries),
    legal: structuredClone(seedLegalPages),
    menuImports: [],
    settings: structuredClone(seedSettings),
  };
}

function read(): DemoData {
  if (typeof window === "undefined") return freshData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = freshData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as DemoData;
    if (!parsed || parsed.version !== SEED_VERSION || !Array.isArray(parsed.restaurants)) {
      const seeded = freshData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed;
  } catch {
    return freshData();
  }
}

function write(data: DemoData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage may be unavailable (private mode); fail soft.
  }
}

interface ArrayApi<T> {
  all(): T[];
  byId(id: string): T | null;
  where(predicate: (item: T) => boolean): T[];
  create(item: T): T;
  update(id: string, patch: Partial<T>): T | null;
  remove(id: string): boolean;
  reorder(ids: string[]): void;
  setAll(items: T[]): void;
}

function arrayApi<T extends { id: string }>(key: ArrayCollections): ArrayApi<T> {
  const list = (d: DemoData) => d[key] as unknown as T[];
  return {
    all: () => list(read()),
    byId: (id) => list(read()).find((x) => x.id === id) ?? null,
    where: (predicate) => list(read()).filter(predicate),
    create: (item) => {
      const d = read();
      (d[key] as unknown as T[]).unshift(item);
      write(d);
      return item;
    },
    update: (id, patch) => {
      const d = read();
      const arr = d[key] as unknown as T[];
      const idx = arr.findIndex((x) => x.id === id);
      if (idx < 0) return null;
      arr[idx] = { ...arr[idx], ...patch };
      write(d);
      return arr[idx];
    },
    remove: (id) => {
      const d = read();
      const arr = d[key] as unknown as T[];
      const next = arr.filter((x) => x.id !== id);
      if (next.length === arr.length) return false;
      (d[key] as unknown as T[]) = next;
      write(d);
      return true;
    },
    reorder: (ids) => {
      const d = read();
      const arr = d[key] as unknown as T[];
      const byId = new Map(arr.map((x) => [x.id, x]));
      const ordered = ids.map((id) => byId.get(id)).filter((x): x is T => Boolean(x));
      const rest = arr.filter((x) => !ids.includes(x.id));
      (d[key] as unknown as T[]) = [...ordered, ...rest];
      write(d);
    },
    setAll: (items) => {
      const d = read();
      (d[key] as unknown as T[]) = items;
      write(d);
    },
  };
}

export const demoStore = {
  isEnabled(): boolean {
    return appConfig.demoMode;
  },

  // ---- Restaurants (Part 1 API — keep stable) ----
  listRestaurants: (): Restaurant[] => read().restaurants,
  getRestaurant: (id: string): Restaurant | null =>
    read().restaurants.find((r) => r.id === id) ?? null,
  isSlugAvailable: (slug: string, exceptId?: string): boolean =>
    !read().restaurants.some((r) => r.slug === slug && r.id !== exceptId),
  createRestaurant: (restaurant: Restaurant): Restaurant => {
    const d = read();
    d.restaurants = [restaurant, ...d.restaurants];
    write(d);
    return restaurant;
  },
  updateRestaurant: (id: string, patch: Partial<Restaurant>): Restaurant | null => {
    const d = read();
    const idx = d.restaurants.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    d.restaurants[idx] = { ...d.restaurants[idx], ...patch, updatedAt: new Date().toISOString() };
    write(d);
    return d.restaurants[idx];
  },
  getBranding: (restaurantId: string): Branding | null =>
    read().branding.find((b) => b.restaurantId === restaurantId) ?? null,
  updateBranding: (restaurantId: string, patch: Partial<Branding>): Branding | null => {
    const d = read();
    const idx = d.branding.findIndex((b) => b.restaurantId === restaurantId);
    if (idx < 0) {
      const created = { restaurantId, ...patch } as Branding;
      d.branding.push(created);
      write(d);
      return created;
    }
    d.branding[idx] = { ...d.branding[idx], ...patch };
    write(d);
    return d.branding[idx];
  },

  // ---- Part 2 entity collections ----
  categories: arrayApi<MenuCategory>("categories"),
  products: arrayApi<MenuProduct>("products"),
  customerActions: arrayApi<CustomerAction>("customerActions"),
  locations: arrayApi<RestaurantLocation>("locations"),
  campaigns: arrayApi<Campaign>("campaigns"),
  qr: arrayApi<QRCodeRecord>("qr"),
  nfc: arrayApi<NFCProduct>("nfc"),
  media: arrayApi<MediaAsset>("media"),
  enquiries: arrayApi<Enquiry>("enquiries"),
  team: arrayApi<AdminUser>("team"),
  audit: arrayApi<ActivityRecord>("audit"),
  websiteContent: arrayApi<WebsiteContentBlock>("websiteContent"),
  templates: arrayApi<Template>("templates"),
  packages: arrayApi<PackagePlan>("packages"),
  faq: arrayApi<FaqEntry>("faq"),
  legal: arrayApi<LegalPage>("legal"),
  menuImports: arrayApi<MenuImport>("menuImports"),

  // ---- Opening hours (keyed by restaurantId) ----
  getOpeningHours: (restaurantId: string): OpeningHours[] => read().openingHours[restaurantId] ?? [],
  setOpeningHours: (restaurantId: string, hours: OpeningHours[]): void => {
    const d = read();
    d.openingHours[restaurantId] = hours;
    write(d);
  },

  // ---- Settings (singleton) ----
  getSettings: (): PlatformSettings => read().settings,
  updateSettings: (patch: Partial<PlatformSettings>): PlatformSettings => {
    const d = read();
    d.settings = { ...d.settings, ...patch, updatedAt: new Date().toISOString() };
    write(d);
    return d.settings;
  },

  // ---- Audit helper ----
  recordActivity: (entry: Omit<ActivityRecord, "id" | "timestamp">): ActivityRecord => {
    const created: ActivityRecord = {
      ...entry,
      id: `act_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const d = read();
    d.audit = [created, ...d.audit];
    write(d);
    return created;
  },

  reset(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    read();
    window.dispatchEvent(new Event(CHANGE_EVENT));
  },
};

export const DEMO_STORE_EVENT = CHANGE_EVENT;
