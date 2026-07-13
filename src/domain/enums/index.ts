/** Controlled vocabularies shared across the domain. */

export const RESTAURANT_TYPES = [
  "fast-food",
  "casual-dining",
  "fine-dining",
  "cafe",
  "bakery",
  "pizzeria",
  "grill",
  "healthy",
  "street-food",
] as const;
export type RestaurantType = (typeof RESTAURANT_TYPES)[number];

export const SERVICE_MODELS = [
  "dine-in",
  "takeaway",
  "delivery",
  "drive-through",
  "catering",
] as const;
export type ServiceModel = (typeof SERVICE_MODELS)[number];

export const STRUCTURE_TYPES = ["single-location", "multi-location", "franchise"] as const;
export type StructureType = (typeof STRUCTURE_TYPES)[number];

export const VISUAL_DIRECTIONS = [
  "modern-fast-food",
  "warm-mediterranean",
  "premium-dining",
  "fresh-healthy",
  "cafe-bakery",
] as const;
export type VisualDirection = (typeof VISUAL_DIRECTIONS)[number];

export const OPERATIONAL_STATUSES = ["active", "paused", "disabled"] as const;
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];

export const SETUP_STATUSES = [
  "not-started",
  "collecting-info",
  "in-design",
  "menu-prep",
  "review",
  "ready",
] as const;
export type SetupStatus = (typeof SETUP_STATUSES)[number];

export const PROJECT_STATUSES = ["lead", "onboarding", "live", "maintenance", "offboarding"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PUBLISHING_STATUSES = [
  "draft",
  "in-review",
  "changes-pending",
  "published",
  "archived",
] as const;
export type PublishingStatus = (typeof PUBLISHING_STATUSES)[number];

export const MENU_STATUSES = ["draft", "active", "hidden"] as const;
export type MenuStatus = (typeof MENU_STATUSES)[number];

export const AVAILABILITY_STATUSES = ["available", "limited", "out-of-stock", "hidden"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const CUSTOMER_ACTION_TYPES = [
  "call-order",
  "pick-your-meal",
  "online-order",
  "visit-us",
  "whatsapp",
  "save-contact",
  "email",
  "instagram",
  "share",
  "custom",
] as const;
export type CustomerActionType = (typeof CUSTOMER_ACTION_TYPES)[number];

export const DESTINATION_TYPES = ["internal", "external", "phone", "whatsapp", "email", "map"] as const;
export type DestinationType = (typeof DESTINATION_TYPES)[number];

export const QR_STATUSES = ["draft", "active", "paused", "retired"] as const;
export type QRStatus = (typeof QR_STATUSES)[number];

export const NFC_ASSIGNMENT_STATUSES = ["unassigned", "assigned", "reassign-pending"] as const;
export type NFCAssignmentStatus = (typeof NFC_ASSIGNMENT_STATUSES)[number];

export const ARTWORK_STATUSES = ["not-started", "in-progress", "ready", "printed"] as const;
export type ArtworkStatus = (typeof ARTWORK_STATUSES)[number];

export const CAMPAIGN_STATUSES = ["draft", "scheduled", "active", "ended", "archived"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ENQUIRY_STATUSES = ["new", "in-review", "contacted", "qualified", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_TYPES = [
  "quote",
  "demo",
  "qr-product",
  "nfc-product",
  "multi-location",
  "existing-project",
  "general",
] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const REVIEW_STATUSES = ["not-submitted", "in-review", "approved", "changes-requested"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const RIGHTS_STATUSES = ["unknown", "licensed", "owned", "needs-review"] as const;
export type RightsStatus = (typeof RIGHTS_STATUSES)[number];

export const ASSET_STATUSES = ["pending", "ready", "archived"] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const LEGAL_PAGE_TYPES = ["privacy", "cookies", "terms", "campaign-terms"] as const;
export type LegalPageType = (typeof LEGAL_PAGE_TYPES)[number];

export const MEDIA_TYPES = ["food", "restaurant", "logo", "cover", "qr", "nfc", "campaign", "avatar"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
