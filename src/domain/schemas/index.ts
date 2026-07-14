import { z } from "zod";
import {
  RESTAURANT_TYPES,
  SERVICE_MODELS,
  STRUCTURE_TYPES,
  VISUAL_DIRECTIONS,
  ENQUIRY_TYPES,
  MENU_STATUSES,
  AVAILABILITY_STATUSES,
  CUSTOMER_ACTION_TYPES,
  DESTINATION_TYPES,
  QR_STATUSES,
  ARTWORK_STATUSES,
  NFC_ASSIGNMENT_STATUSES,
  OPERATIONAL_STATUSES,
  CAMPAIGN_STATUSES,
  ENQUIRY_STATUSES,
  DAYS_OF_WEEK,
  RIGHTS_STATUSES,
  ASSET_STATUSES,
  MEDIA_TYPES,
} from "@/domain/enums";
import { ROLES } from "@/domain/permissions";
import { LOCALES } from "@/lib/i18n/locales";

/** A URL-safe slug: lowercase letters, numbers and single hyphens. */
export const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(60, "Slug must be at most 60 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

export function isValidSlug(value: string): boolean {
  return slugSchema.safeParse(value).success;
}

/** Hex color, 3 or 6 digits. */
export const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a valid hex color (e.g. #F04424)");

export const brandColorsSchema = z.object({
  primary: hexColorSchema,
  primaryDark: hexColorSchema,
  accent: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
});
export type BrandColorsInput = z.infer<typeof brandColorsSchema>;

/** Admin login form. */
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  keepSignedIn: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

const localeEnum = z.enum(LOCALES);

/** Public contact / restaurant enquiry form. */
export const enquirySchema = z.object({
  restaurantName: z.string().min(2, "Restaurant name is required"),
  contactPerson: z.string().min(2, "Contact name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  restaurantType: z.enum(RESTAURANT_TYPES).optional(),
  enquiryType: z.enum(ENQUIRY_TYPES),
  packageInterest: z.string().optional().or(z.literal("")),
  featureInterest: z.array(z.string()).optional().default([]),
  productInterest: z.array(z.string()).optional().default([]),
  preferredContactMethod: z.enum(["email", "phone", "whatsapp"]).default("email"),
  message: z.string().max(2000, "Message is too long").optional().or(z.literal("")),
  // Honeypot: must stay empty.
  company: z.string().max(0, "Unexpected value").optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, "Please accept the privacy notice"),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

/** Add Restaurant multi-section form. */
export const restaurantCreateSchema = z.object({
  // Basic information
  name: z.string().min(2, "Restaurant name is required"),
  displayName: z.string().min(2, "Display name is required"),
  legalName: z.string().optional().or(z.literal("")),
  slug: slugSchema,
  tagline: z.string().max(120, "Keep the tagline short").optional().or(z.literal("")),
  publicDescription: z.string().max(600).optional().or(z.literal("")),
  // Classification
  restaurantTypes: z.array(z.enum(RESTAURANT_TYPES)).min(1, "Select at least one type"),
  cuisines: z.array(z.string()).optional().default([]),
  serviceModels: z.array(z.enum(SERVICE_MODELS)).min(1, "Select at least one service model"),
  structureType: z.enum(STRUCTURE_TYPES),
  numberOfLocations: z.coerce.number().int().min(1).max(999).default(1),
  // Branding
  visualDirection: z.enum(VISUAL_DIRECTIONS),
  // Contact
  publicPhone: z.string().optional().or(z.literal("")),
  publicEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  // Location
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  // Languages
  primaryLanguage: localeEnum,
  additionalLanguages: z.array(localeEnum).optional().default([]),
  // Project scope / internal
  projectStatus: z.enum(["lead", "onboarding", "live", "maintenance", "offboarding"]),
  assignedTeams: z.array(z.string()).optional().default([]),
  internalNotes: z.string().max(2000).optional().or(z.literal("")),
});
export type RestaurantCreateInput = z.infer<typeof restaurantCreateSchema>;

/** General Information editor (subset that can be edited post-creation). */
export const restaurantGeneralSchema = restaurantCreateSchema
  .pick({
    name: true,
    displayName: true,
    legalName: true,
    slug: true,
    tagline: true,
    publicDescription: true,
    restaurantTypes: true,
    cuisines: true,
    serviceModels: true,
    structureType: true,
    numberOfLocations: true,
    visualDirection: true,
    primaryLanguage: true,
    additionalLanguages: true,
    projectStatus: true,
    assignedTeams: true,
    internalNotes: true,
  })
  .extend({
    operationalStatus: z.enum(["active", "paused", "disabled"]),
    setupStatus: z.enum([
      "not-started",
      "collecting-info",
      "in-design",
      "menu-prep",
      "review",
      "ready",
    ]),
  });
export type RestaurantGeneralInput = z.infer<typeof restaurantGeneralSchema>;

/** Branding editor form. */
export const brandingEditSchema = z.object({
  visualDirection: z.enum(VISUAL_DIRECTIONS),
  colors: brandColorsSchema,
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
  buttonStyle: z.enum(["rounded", "pill", "square"]),
  cardStyle: z.enum(["soft", "bordered", "elevated"]),
  iconStyle: z.enum(["line", "filled"]),
  rightsStatus: z.enum(["unknown", "licensed", "owned", "needs-review"]),
  internalNotes: z.string().max(2000).optional().or(z.literal("")),
});
export type BrandingEditInput = z.infer<typeof brandingEditSchema>;

/* ------------------------------------------------------------------ *
 * Part 2 editor schemas
 * ------------------------------------------------------------------ */

/** Menu Category Editor. */
export const menuCategorySchema = z.object({
  nameEn: z.string().min(1, "Category name is required"),
  descriptionEn: z.string().max(400).optional().or(z.literal("")),
  status: z.enum(MENU_STATUSES),
  sortOrder: z.coerce.number().int().min(0).default(0),
});
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;

/** Menu Product Editor. */
export const menuProductSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  nameEn: z.string().min(1, "Product name is required"),
  descriptionEn: z.string().max(800).optional().or(z.literal("")),
  slug: slugSchema,
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  currency: z.string().min(1).default("USD"),
  availability: z.enum(AVAILABILITY_STATUSES),
  dietaryLabels: z.array(z.string()).optional().default([]),
  allergenNote: z.string().max(400).optional().or(z.literal("")),
  featured: z.boolean().optional().default(false),
  variants: z
    .array(z.object({ label: z.string().min(1), priceModifier: z.coerce.number() }))
    .optional()
    .default([]),
});
export type MenuProductInput = z.infer<typeof menuProductSchema>;

/** Customer Actions Editor (single action row). */
export const customerActionSchema = z.object({
  type: z.enum(CUSTOMER_ACTION_TYPES),
  labelEn: z.string().min(1, "Label is required"),
  destinationType: z.enum(DESTINATION_TYPES),
  destination: z.string().max(400).optional().or(z.literal("")),
  icon: z.string().max(400).optional().or(z.literal("")),
  topLabelEn: z.string().max(200).optional().or(z.literal("")),
  topIcon: z.string().max(400).optional().or(z.literal("")),
  enabled: z.boolean().default(true),
});
export type CustomerActionInput = z.infer<typeof customerActionSchema>;

/** Contact & Location Editor. */
export const contactLocationSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  country: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  mapUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  publicLabel: z.string().optional().or(z.literal("")),
  publicPhone: z.string().optional().or(z.literal("")),
  publicEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
});
export type ContactLocationInput = z.infer<typeof contactLocationSchema>;

/** Opening Hours Editor (one day row). */
export const openingDaySchema = z.object({
  day: z.enum(DAYS_OF_WEEK),
  status: z.enum(["open", "closed"]),
  periods: z
    .array(z.object({ open: z.string().regex(/^\d{2}:\d{2}$/), close: z.string().regex(/^\d{2}:\d{2}$/) }))
    .default([]),
  specialHours: z.string().max(200).optional().or(z.literal("")),
});
export const openingHoursSchema = z.object({ days: z.array(openingDaySchema) });
export type OpeningHoursInput = z.infer<typeof openingHoursSchema>;

/** QR Code record editor. */
export const qrCodeSchema = z.object({
  displayIdentifier: z.string().min(1, "Identifier is required"),
  placement: z.string().min(1, "Placement is required"),
  destination: z.string().min(1, "Destination is required"),
  status: z.enum(QR_STATUSES),
  artworkStatus: z.enum(ARTWORK_STATUSES),
});
export type QRCodeInput = z.infer<typeof qrCodeSchema>;

/** NFC product editor + assignment. */
export const nfcProductSchema = z.object({
  displayIdentifier: z.string().min(1, "Identifier is required"),
  productType: z.enum(["table-stand", "card", "sticker", "window"]),
  placement: z.string().min(1, "Placement is required"),
  destination: z.string().optional().or(z.literal("")),
  assignmentStatus: z.enum(NFC_ASSIGNMENT_STATUSES),
  operationalStatus: z.enum(OPERATIONAL_STATUSES),
  artworkStatus: z.enum(ARTWORK_STATUSES),
});
export type NFCProductInput = z.infer<typeof nfcProductSchema>;

/** Campaign editor. */
export const campaignSchema = z.object({
  titleEn: z.string().min(1, "Title is required"),
  slug: slugSchema,
  descriptionEn: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(CAMPAIGN_STATUSES),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  claimDeadline: z.string().optional().or(z.literal("")),
  rewardTitleEn: z.string().min(1, "Reward title is required"),
  rewardType: z.enum(["discount", "free-item", "points", "voucher"]),
  rewardValue: z.string().optional().or(z.literal("")),
  eligibility: z.string().max(600).optional().or(z.literal("")),
  attemptRules: z.string().max(600).optional().or(z.literal("")),
  organizer: z.string().optional().or(z.literal("")),
});
export type CampaignInput = z.infer<typeof campaignSchema>;

/** Media Library asset editor. */
export const mediaAssetSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  type: z.enum(MEDIA_TYPES),
  altText: z.string().max(300).optional().or(z.literal("")),
  rightsStatus: z.enum(RIGHTS_STATUSES),
  status: z.enum(ASSET_STATUSES),
});
export type MediaAssetInput = z.infer<typeof mediaAssetSchema>;

/** Enquiry / lead status update. */
export const enquiryUpdateSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
  assignedTeam: z.string().optional().or(z.literal("")),
});
export type EnquiryUpdateInput = z.infer<typeof enquiryUpdateSchema>;

/** Website CMS content block editor. */
export const websiteContentSchema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  status: z.enum(["draft", "in-review", "changes-pending", "published", "archived"]),
});
export type WebsiteContentInput = z.infer<typeof websiteContentSchema>;

/** Global SEO + platform settings. */
export const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  defaultLocale: z.enum(LOCALES),
  supportEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  supportPhone: z.string().optional().or(z.literal("")),
  seoTitleTemplate: z.string().min(1),
  seoDescription: z.string().max(300),
  maintenanceMode: z.boolean().default(false),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

const publishingEnum = z.enum([
  "draft",
  "in-review",
  "changes-pending",
  "published",
  "archived",
]);

/** Template (visual direction) editor. */
export const templatePresetSchema = z.object({
  colors: brandColorsSchema,
  headingFont: z.string().min(1),
  bodyFont: z.string().min(1),
  buttonStyle: z.enum(["rounded", "pill", "square"]),
  cardStyle: z.enum(["soft", "bordered", "elevated"]),
  iconStyle: z.enum(["line", "filled"]),
});

export const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  direction: z.enum(VISUAL_DIRECTIONS),
  description: z.string().min(1, "Description is required").max(600),
  bestFor: z.string().min(1, "Add who it's best for").max(300),
  preset: templatePresetSchema,
  status: publishingEnum,
});
export type TemplateInput = z.infer<typeof templateSchema>;

/** Package / plan editor. */
export const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  summary: z.string().min(1, "Summary is required").max(400),
  features: z.array(z.string().min(1)).min(1, "Add at least one feature"),
  highlighted: z.boolean().default(false),
  badge: z.string().max(40).optional().or(z.literal("")),
  status: publishingEnum,
});
export type PackageInput = z.infer<typeof packageSchema>;

/** FAQ entry editor. */
export const faqSchema = z.object({
  category: z.string().min(1, "Category is required"),
  question: z.string().min(1, "Question is required").max(300),
  answer: z.string().min(1, "Answer is required").max(2000),
  status: publishingEnum,
});
export type FaqInput = z.infer<typeof faqSchema>;

/** Legal page metadata editor (section bodies edited inline). */
export const legalPageMetaSchema = z.object({
  version: z.string().min(1, "Version is required"),
  effectiveDate: z.string().optional().or(z.literal("")),
  status: publishingEnum,
});
export type LegalPageMetaInput = z.infer<typeof legalPageMetaSchema>;

/** Team member editor. */
export const teamUserSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(ROLES),
  status: z.enum(["active", "inactive", "locked"]),
});
export type TeamUserInput = z.infer<typeof teamUserSchema>;
