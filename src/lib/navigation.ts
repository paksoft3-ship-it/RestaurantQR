import { routes } from "@/lib/routes";
import { PERMISSIONS, type Permission } from "@/domain/permissions";

/** Centralized navigation definitions (no inline nav arrays in components). */

export interface NavItem {
  labelKey: string;
  label: string;
  href: string;
}

/** Full navigation — shown in the mobile menu and reflected in the footer. */
export const marketingNav: NavItem[] = [
  { labelKey: "nav.howItWorks", label: "How It Works", href: routes.marketing.howItWorks() },
  { labelKey: "nav.features", label: "Features", href: routes.marketing.features() },
  { labelKey: "nav.qrNfc", label: "QR & NFC Products", href: routes.marketing.qrNfcProducts() },
  { labelKey: "nav.examples", label: "Restaurant Examples", href: routes.marketing.restaurantExamples() },
  { labelKey: "nav.templates", label: "Templates", href: routes.marketing.templates() },
  { labelKey: "nav.packages", label: "Packages", href: routes.marketing.packages() },
  { labelKey: "nav.faq", label: "FAQ", href: routes.marketing.faq() },
  { labelKey: "nav.contact", label: "Contact", href: routes.marketing.contact() },
];

/**
 * Curated subset shown on the desktop top bar so it stays uncluttered alongside
 * the CTAs. The remaining items are always reachable via the mobile menu and footer.
 */
export const primaryMarketingNav: NavItem[] = [
  marketingNav[0], // How It Works
  marketingNav[1], // Features
  marketingNav[2], // QR & NFC Products
  marketingNav[5], // Packages
  marketingNav[6], // FAQ
];

export const footerNav = {
  platform: [
    { label: "How It Works", href: routes.marketing.howItWorks() },
    { label: "Features", href: routes.marketing.features() },
    { label: "QR & NFC Products", href: routes.marketing.qrNfcProducts() },
    { label: "Templates", href: routes.marketing.templates() },
    { label: "Packages", href: routes.marketing.packages() },
  ],
  company: [
    { label: "About", href: routes.marketing.about() },
    { label: "Restaurant Examples", href: routes.marketing.restaurantExamples() },
    { label: "FAQ", href: routes.marketing.faq() },
    { label: "Contact", href: routes.marketing.contact() },
  ],
  legal: [
    { label: "Privacy Policy", href: routes.marketing.privacy() },
    { label: "Cookie Policy", href: routes.marketing.cookies() },
    { label: "Terms of Service", href: routes.marketing.terms() },
    { label: "Campaign Terms", href: routes.marketing.campaignTerms() },
  ],
};

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
  partTwo?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    label: "Primary",
    items: [
      { label: "Dashboard", href: routes.admin.dashboard(), icon: "LayoutDashboard" },
      { label: "Restaurants", href: routes.admin.restaurants(), icon: "Store", permission: PERMISSIONS.RESTAURANT_VIEW },
      { label: "Menus", href: routes.admin.menus(), icon: "BookOpen", permission: PERMISSIONS.MENU_VIEW },
      { label: "QR Codes", href: routes.admin.qrCodes(), icon: "QrCode", permission: PERMISSIONS.QR_VIEW },
      { label: "NFC Products", href: routes.admin.nfcProducts(), icon: "Nfc", permission: PERMISSIONS.NFC_VIEW },
      { label: "Campaigns", href: routes.admin.campaigns(), icon: "Megaphone", permission: PERMISSIONS.CAMPAIGN_VIEW },
      { label: "Analytics", href: routes.admin.analytics(), icon: "ChartColumn", permission: PERMISSIONS.ANALYTICS_VIEW },
      { label: "Enquiries", href: routes.admin.enquiries(), icon: "Inbox", permission: PERMISSIONS.ENQUIRY_VIEW },
      { label: "Media Library", href: routes.admin.mediaLibrary(), icon: "Image" },
    ],
  },
  {
    label: "Platform Content",
    items: [
      { label: "Website CMS", href: routes.admin.websiteCms(), icon: "Globe", permission: PERMISSIONS.WEBSITE_EDIT },
      { label: "Templates", href: routes.admin.templates(), icon: "LayoutTemplate" },
      { label: "Packages", href: routes.admin.packages(), icon: "Package" },
      { label: "FAQ", href: routes.admin.faq(), icon: "HelpCircle" },
      { label: "Legal Pages", href: routes.admin.legalPages(), icon: "Scale", permission: PERMISSIONS.LEGAL_EDIT },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Team Access", href: routes.admin.teamAccess(), icon: "Users", permission: PERMISSIONS.ADMIN_MANAGE },
      { label: "Activity Log", href: routes.admin.activityLog(), icon: "ScrollText", permission: PERMISSIONS.ACTIVITY_VIEW },
      { label: "Settings", href: routes.admin.settings(), icon: "Settings" },
    ],
  },
];
