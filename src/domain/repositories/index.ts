import type {
  ActivityRecord,
  AdminUser,
  Branding,
  Campaign,
  CustomerAction,
  Enquiry,
  LegalPage,
  MediaAsset,
  MenuCategory,
  MenuProduct,
  NFCProduct,
  OpeningHours,
  QRCodeRecord,
  Restaurant,
  RestaurantLocation,
} from "@/domain/entities";
import type { LegalPageType } from "@/domain/enums";

/**
 * Repository contracts. UI accesses data only through these interfaces so the
 * mock implementation can be swapped for a real backend without touching pages.
 */

export interface RestaurantListQuery {
  search?: string;
  operationalStatus?: string;
  publishingStatus?: string;
  setupStatus?: string;
  visualDirection?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RestaurantRepository {
  list(query?: RestaurantListQuery): Promise<Paginated<Restaurant>>;
  getById(id: string): Promise<Restaurant | null>;
  getBySlug(slug: string): Promise<Restaurant | null>;
  isSlugAvailable(slug: string, exceptId?: string): Promise<boolean>;
  create(input: Omit<Restaurant, "id" | "createdAt" | "updatedAt">): Promise<Restaurant>;
  update(id: string, patch: Partial<Restaurant>): Promise<Restaurant>;
  disable(id: string): Promise<Restaurant>;
  archive(id: string): Promise<Restaurant>;
  locations(restaurantId: string): Promise<RestaurantLocation[]>;
  openingHours(restaurantId: string): Promise<OpeningHours[]>;
}

export interface BrandingRepository {
  get(restaurantId: string): Promise<Branding | null>;
  update(restaurantId: string, patch: Partial<Branding>): Promise<Branding>;
}

export interface MenuRepository {
  categories(restaurantId: string): Promise<MenuCategory[]>;
  products(restaurantId: string): Promise<MenuProduct[]>;
  productBySlug(restaurantId: string, slug: string): Promise<MenuProduct | null>;
  customerActions(restaurantId: string): Promise<CustomerAction[]>;
}

export interface CampaignRepository {
  listByRestaurant(restaurantId: string): Promise<Campaign[]>;
  getBySlug(restaurantId: string, slug: string): Promise<Campaign | null>;
}

export interface QRCodeRepository {
  listByRestaurant(restaurantId: string): Promise<QRCodeRecord[]>;
  countByRestaurant(restaurantId: string): Promise<number>;
}

export interface NFCProductRepository {
  listByRestaurant(restaurantId: string): Promise<NFCProduct[]>;
  countByRestaurant(restaurantId: string): Promise<number>;
}

export interface EnquiryRepository {
  list(): Promise<Enquiry[]>;
  create(input: Omit<Enquiry, "id" | "createdAt" | "status">): Promise<Enquiry>;
}

export interface AnalyticsSnapshot {
  totalScans: number;
  totalTaps: number;
  menuViews: number;
  actionClicks: number;
  series: { label: string; value: number }[];
}

export interface AnalyticsRepository {
  restaurantSnapshot(restaurantId: string): Promise<AnalyticsSnapshot>;
  platformSnapshot(): Promise<AnalyticsSnapshot>;
}

export interface LegalContentRepository {
  get(type: LegalPageType): Promise<LegalPage | null>;
}

export interface MediaRepository {
  listByRestaurant(restaurantId: string): Promise<MediaAsset[]>;
}

export interface ActivityRepository {
  recent(limit?: number): Promise<ActivityRecord[]>;
  byRestaurant(restaurantId: string, limit?: number): Promise<ActivityRecord[]>;
  record(input: Omit<ActivityRecord, "id" | "timestamp">): Promise<ActivityRecord>;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<AdminUser | null>;
  verifyCredentials(email: string, password: string): Promise<AdminUser | null>;
}

export interface RepositoryBundle {
  restaurants: RestaurantRepository;
  branding: BrandingRepository;
  menus: MenuRepository;
  campaigns: CampaignRepository;
  qr: QRCodeRepository;
  nfc: NFCProductRepository;
  enquiries: EnquiryRepository;
  analytics: AnalyticsRepository;
  legal: LegalContentRepository;
  media: MediaRepository;
  activity: ActivityRepository;
  auth: AuthRepository;
}
