/** Centralized roles and permission constants. */

export const PERMISSIONS = {
  RESTAURANT_VIEW: "restaurant.view",
  RESTAURANT_CREATE: "restaurant.create",
  RESTAURANT_EDIT: "restaurant.edit",
  RESTAURANT_DISABLE: "restaurant.disable",
  RESTAURANT_ARCHIVE: "restaurant.archive",
  BRANDING_VIEW: "branding.view",
  BRANDING_EDIT: "branding.edit",
  BRANDING_APPROVE: "branding.approve",
  MENU_VIEW: "menu.view",
  MENU_EDIT: "menu.edit",
  MENU_PUBLISH: "menu.publish",
  QR_VIEW: "qr.view",
  QR_MANAGE: "qr.manage",
  NFC_VIEW: "nfc.view",
  NFC_MANAGE: "nfc.manage",
  CAMPAIGN_VIEW: "campaign.view",
  CAMPAIGN_EDIT: "campaign.edit",
  ANALYTICS_VIEW: "analytics.view",
  ENQUIRY_VIEW: "enquiry.view",
  ENQUIRY_EDIT: "enquiry.edit",
  WEBSITE_EDIT: "website.edit",
  LEGAL_EDIT: "legal.edit",
  ADMIN_MANAGE: "admin.manage",
  ACTIVITY_VIEW: "activity.view",
  // Menu PDF import
  MENU_IMPORT_VIEW: "menu_import.view",
  MENU_IMPORT_CREATE: "menu_import.create",
  MENU_IMPORT_UPLOAD: "menu_import.upload",
  MENU_IMPORT_PROCESS: "menu_import.process",
  MENU_IMPORT_REVIEW: "menu_import.review",
  MENU_IMPORT_EDIT: "menu_import.edit",
  MENU_IMPORT_APPROVE: "menu_import.approve",
  MENU_IMPORT_COMMIT: "menu_import.commit",
  MENU_IMPORT_CANCEL: "menu_import.cancel",
  MENU_IMPORT_RETRY: "menu_import.retry",
  MENU_IMPORT_EXPORT: "menu_import.export",
  MENU_IMPORT_ARCHIVE: "menu_import.archive",
  MENU_IMPORT_OVERRIDE_BLOCKING_WARNING: "menu_import.override_blocking_warning",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLES = [
  "super-administrator",
  "administrator",
  "restaurant-setup-manager",
  "content-manager",
  "menu-editor",
  "brand-designer",
  "media-manager",
  "qr-nfc-operations-manager",
  "campaign-manager",
  "analyst",
  "support-team",
  "website-content-manager",
  "legal-content-manager",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  "super-administrator": "Super Administrator",
  administrator: "Administrator",
  "restaurant-setup-manager": "Restaurant Setup Manager",
  "content-manager": "Content Manager",
  "menu-editor": "Menu Editor",
  "brand-designer": "Brand Designer",
  "media-manager": "Media Manager",
  "qr-nfc-operations-manager": "QR/NFC Operations Manager",
  "campaign-manager": "Campaign Manager",
  analyst: "Analyst",
  "support-team": "Support Team",
  "website-content-manager": "Website Content Manager",
  "legal-content-manager": "Legal Content Manager",
};

const ALL: Permission[] = Object.values(PERMISSIONS);

/** Default permission grants per role. Server-side enforcement is the source of truth. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "super-administrator": ALL,
  administrator: ALL,
  "restaurant-setup-manager": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.RESTAURANT_CREATE,
    PERMISSIONS.RESTAURANT_EDIT,
    PERMISSIONS.BRANDING_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.QR_VIEW,
    PERMISSIONS.NFC_VIEW,
    PERMISSIONS.ENQUIRY_VIEW,
    PERMISSIONS.ACTIVITY_VIEW,
    PERMISSIONS.MENU_IMPORT_VIEW,
    PERMISSIONS.MENU_IMPORT_CREATE,
    PERMISSIONS.MENU_IMPORT_UPLOAD,
    PERMISSIONS.MENU_IMPORT_PROCESS,
    PERMISSIONS.MENU_IMPORT_REVIEW,
    PERMISSIONS.MENU_IMPORT_EDIT,
    PERMISSIONS.MENU_IMPORT_EXPORT,
  ],
  "content-manager": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.WEBSITE_EDIT,
    PERMISSIONS.MENU_IMPORT_VIEW,
    PERMISSIONS.MENU_IMPORT_REVIEW,
    PERMISSIONS.MENU_IMPORT_EDIT,
  ],
  "menu-editor": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.MENU_VIEW,
    PERMISSIONS.MENU_EDIT,
    PERMISSIONS.MENU_IMPORT_VIEW,
    PERMISSIONS.MENU_IMPORT_CREATE,
    PERMISSIONS.MENU_IMPORT_UPLOAD,
    PERMISSIONS.MENU_IMPORT_PROCESS,
    PERMISSIONS.MENU_IMPORT_REVIEW,
    PERMISSIONS.MENU_IMPORT_EDIT,
    PERMISSIONS.MENU_IMPORT_APPROVE,
    PERMISSIONS.MENU_IMPORT_COMMIT,
    PERMISSIONS.MENU_IMPORT_CANCEL,
    PERMISSIONS.MENU_IMPORT_RETRY,
    PERMISSIONS.MENU_IMPORT_EXPORT,
    PERMISSIONS.MENU_IMPORT_ARCHIVE,
  ],
  "brand-designer": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.BRANDING_VIEW,
    PERMISSIONS.BRANDING_EDIT,
  ],
  "media-manager": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.BRANDING_VIEW,
    PERMISSIONS.MENU_IMPORT_VIEW,
    PERMISSIONS.MENU_IMPORT_REVIEW,
  ],
  "qr-nfc-operations-manager": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.QR_VIEW,
    PERMISSIONS.QR_MANAGE,
    PERMISSIONS.NFC_VIEW,
    PERMISSIONS.NFC_MANAGE,
  ],
  "campaign-manager": [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.CAMPAIGN_EDIT,
  ],
  analyst: [
    PERMISSIONS.RESTAURANT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.MENU_IMPORT_VIEW,
    PERMISSIONS.MENU_IMPORT_EXPORT,
  ],
  "support-team": [PERMISSIONS.RESTAURANT_VIEW, PERMISSIONS.ENQUIRY_VIEW, PERMISSIONS.ENQUIRY_EDIT],
  "website-content-manager": [PERMISSIONS.WEBSITE_EDIT],
  "legal-content-manager": [PERMISSIONS.LEGAL_EDIT],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return permissionsForRole(role).includes(permission);
}
