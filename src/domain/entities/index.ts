import type { LocalizedText, Locale } from "@/lib/i18n/locales";
import type {
  ArtworkStatus,
  AssetStatus,
  AvailabilityStatus,
  CampaignStatus,
  CustomerActionType,
  DayOfWeek,
  DestinationType,
  EnquiryStatus,
  EnquiryType,
  LegalPageType,
  MediaType,
  MenuStatus,
  NFCAssignmentStatus,
  OperationalStatus,
  ProjectStatus,
  PublishingStatus,
  QRStatus,
  RestaurantType,
  ReviewStatus,
  RightsStatus,
  ServiceModel,
  SetupStatus,
  StructureType,
  VisualDirection,
} from "@/domain/enums";
import type { Permission, Role } from "@/domain/permissions";

/** Brand color palette stored against a restaurant. */
export interface BrandColors {
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
  text: string;
}

export interface Restaurant {
  id: string;
  internalId: string;
  name: string;
  displayName: string;
  legalName: string | null;
  slug: string;
  tagline: LocalizedText | null;
  descriptions: { public: LocalizedText | null; internal: string | null };
  restaurantTypes: RestaurantType[];
  cuisines: string[];
  serviceModels: ServiceModel[];
  structureType: StructureType;
  numberOfLocations: number;
  primaryLanguage: Locale;
  additionalLanguages: Locale[];
  visualDirection: VisualDirection;
  operationalStatus: OperationalStatus;
  setupStatus: SetupStatus;
  projectStatus: ProjectStatus;
  publishingStatus: PublishingStatus;
  assignedTeams: string[];
  tags: string[];
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantLocation {
  id: string;
  restaurantId: string;
  locationName: string;
  country: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string | null;
  timezone: string | null;
  publicLabel: string | null;
  internalNotes: string | null;
}

export interface OpeningPeriod {
  open: string; // HH:mm
  close: string; // HH:mm
}

export interface OpeningHours {
  day: DayOfWeek;
  status: "open" | "closed";
  periods: OpeningPeriod[];
  specialHours?: string | null;
  timezone?: string | null;
}

export interface Branding {
  restaurantId: string;
  visualDirection: VisualDirection;
  logo: string | null;
  lightLogo: string | null;
  darkLogo: string | null;
  symbol: string | null;
  coverImage: string | null;
  socialImage: string | null;
  favicon: string | null;
  colors: BrandColors;
  typography: { headingFont: string; bodyFont: string };
  buttonStyle: "rounded" | "pill" | "square";
  cardStyle: "soft" | "bordered" | "elevated";
  iconStyle: "line" | "filled";
  imageDirection: string | null;
  backgroundStyle: string | null;
  rightsStatus: RightsStatus;
  readiness: number; // 0-100
  version: number;
  reviewStatus: ReviewStatus;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  localizedName: LocalizedText;
  localizedDescription: LocalizedText | null;
  sortOrder: number;
  status: MenuStatus;
  image: string | null;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceModifier: number;
}

export interface MenuProduct {
  id: string;
  categoryId: string;
  restaurantId: string;
  slug: string;
  localizedName: LocalizedText;
  localizedDescription: LocalizedText | null;
  price: number;
  currency: string;
  image: string | null;
  availability: AvailabilityStatus;
  variants: ProductVariant[];
  dietaryLabels: string[];
  allergenNote: string | null;
  featured: boolean;
  sortOrder: number;
}

export interface CustomerAction {
  id: string;
  restaurantId: string;
  type: CustomerActionType;
  label: LocalizedText;
  destinationType: DestinationType;
  destination: string | null;
  /**
   * Optional admin-chosen icon override. Either a lucide icon name (e.g.
   * "MapPin") or an uploaded image URL ("https://…" / "/…"). When null/absent
   * the public UI falls back to the built-in icon for the action type.
   */
  icon?: string | null;
  enabled: boolean;
  status: "configured" | "needs-config";
  sortOrder: number;
}

export interface QRCodeRecord {
  id: string;
  restaurantId: string;
  displayIdentifier: string;
  placement: string;
  destination: string;
  status: QRStatus;
  artworkStatus: ArtworkStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NFCProduct {
  id: string;
  displayIdentifier: string;
  restaurantId: string | null;
  productType: "table-stand" | "card" | "sticker" | "window";
  placement: string;
  destination: string | null;
  assignmentStatus: NFCAssignmentStatus;
  operationalStatus: OperationalStatus;
  artworkStatus: ArtworkStatus;
}

export interface CampaignReward {
  title: LocalizedText;
  description: LocalizedText | null;
  type: "discount" | "free-item" | "points" | "voucher";
  value: string | null;
}

export interface Campaign {
  id: string;
  restaurantId: string;
  slug: string;
  localizedTitle: LocalizedText;
  localizedDescription: LocalizedText | null;
  status: CampaignStatus;
  startDate: string | null;
  endDate: string | null;
  claimDeadline: string | null;
  reward: CampaignReward;
  eligibility: string | null;
  attemptRules: string | null;
  termsVersion: string;
  organizer: string | null;
  publishingStatus: PublishingStatus;
}

export interface Enquiry {
  id: string;
  restaurantName: string;
  contactPerson: string;
  phone: string | null;
  email: string;
  city: string | null;
  country: string | null;
  restaurantType: RestaurantType | null;
  enquiryType: EnquiryType;
  packageInterest: string | null;
  featureInterest: string[];
  productInterest: string[];
  preferredContactMethod: "email" | "phone" | "whatsapp";
  message: string | null;
  status: EnquiryStatus;
  assignedTeam: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  status: "active" | "inactive" | "locked";
  permissions: Permission[];
}

export interface ActivityRecord {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface LegalSection {
  id: string;
  title: string;
  body: string; // structured markdown-ish content
}

export interface LegalPage {
  id: string;
  type: LegalPageType;
  locale: Locale;
  version: string;
  effectiveDate: string | null;
  lastUpdated: string | null;
  status: PublishingStatus;
  sections: LegalSection[];
}

export interface MediaAsset {
  id: string;
  restaurantId: string | null;
  type: MediaType;
  filename: string;
  publicUrl: string;
  altText: string | null;
  rightsStatus: RightsStatus;
  status: AssetStatus;
  metadata?: Record<string, string>;
}

/** A managed marketing-website content block (Part 2 Website CMS). */
export interface WebsiteContentBlock {
  id: string;
  page: string; // e.g. "home", "about", "features"
  section: string; // e.g. "hero", "faq"
  title: string;
  body: string;
  status: PublishingStatus;
  updatedAt: string;
}

/** A managed visual-direction template shown in the public templates gallery. */
export interface Template {
  id: string;
  name: string;
  direction: VisualDirection;
  description: string;
  bestFor: string;
  image: string | null;
  status: PublishingStatus;
  sortOrder: number;
}

/** A managed package/plan shown on the public packages page (no fixed price). */
export interface PackagePlan {
  id: string;
  name: string;
  summary: string;
  features: string[];
  highlighted: boolean;
  badge: string | null;
  status: PublishingStatus;
  sortOrder: number;
}

/** A managed FAQ entry shown on the public FAQ page. */
export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  status: PublishingStatus;
  sortOrder: number;
}

/** Global platform + SEO settings (Part 2 Settings). */
export interface PlatformSettings {
  siteName: string;
  defaultLocale: string;
  supportEmail: string | null;
  supportPhone: string | null;
  seoTitleTemplate: string;
  seoDescription: string;
  socialImage: string | null;
  maintenanceMode: boolean;
  updatedAt: string;
}
