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
 * A full snapshot of every admin-editable collection, loaded once from the DB
 * and used to hydrate the client-side admin store cache. Mirrors the demo
 * store's internal `DemoData` shape (minus the localStorage version field).
 */
export interface AdminSnapshot {
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

/** Array-backed collections that share the generic create/update/remove API. */
export type ArrayCollectionKey =
  | "categories"
  | "products"
  | "customerActions"
  | "locations"
  | "campaigns"
  | "qr"
  | "nfc"
  | "media"
  | "enquiries"
  | "team"
  | "audit"
  | "websiteContent"
  | "templates"
  | "packages"
  | "faq"
  | "legal"
  | "menuImports";

/**
 * A single persistence instruction sent from the client store to the server.
 * The client updates its cache optimistically and forwards the same change here
 * so the database stays the source of truth.
 */
export type PersistOp =
  | { kind: "create"; collection: ArrayCollectionKey; item: unknown }
  | { kind: "update"; collection: ArrayCollectionKey; id: string; next: unknown }
  | { kind: "remove"; collection: ArrayCollectionKey; id: string }
  | { kind: "setAll"; collection: ArrayCollectionKey; items: unknown[] }
  | { kind: "restaurant.create"; item: Restaurant }
  | { kind: "restaurant.update"; id: string; next: Restaurant }
  | { kind: "branding.set"; restaurantId: string; value: Branding }
  | { kind: "openingHours.set"; restaurantId: string; hours: OpeningHours[] }
  | { kind: "settings.set"; value: PlatformSettings };
