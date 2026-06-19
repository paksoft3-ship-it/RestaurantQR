/**
 * Centralized route builders. Never concatenate paths by hand in components.
 */

export const routes = {
  marketing: {
    home: () => "/",
    howItWorks: () => "/how-it-works",
    features: () => "/features",
    qrNfcProducts: () => "/qr-nfc-products",
    restaurantExamples: () => "/restaurant-examples",
    templates: () => "/templates",
    packages: () => "/packages",
    about: () => "/about",
    faq: () => "/faq",
    contact: () => "/contact",
    privacy: () => "/privacy",
    cookies: () => "/cookies",
    terms: () => "/terms",
    campaignTerms: () => "/campaign-terms",
  },
  restaurant: {
    home: (slug: string) => `/restaurants/${slug}`,
    menu: (slug: string) => `/restaurants/${slug}/menu`,
    product: (slug: string, productSlug: string) =>
      `/restaurants/${slug}/menu/${productSlug}`,
    contact: (slug: string) => `/restaurants/${slug}/contact`,
    campaign: (slug: string, campaignSlug: string) =>
      `/restaurants/${slug}/campaigns/${campaignSlug}`,
    campaignTerms: (slug: string, campaignSlug: string) =>
      `/restaurants/${slug}/campaigns/${campaignSlug}/terms`,
  },
  admin: {
    login: () => "/admin/login",
    dashboard: () => "/admin",
    restaurants: () => "/admin/restaurants",
    restaurantNew: () => "/admin/restaurants/new",
    restaurant: (id: string) => `/admin/restaurants/${id}`,
    restaurantGeneral: (id: string) => `/admin/restaurants/${id}/edit`,
    restaurantBranding: (id: string) => `/admin/restaurants/${id}/branding`,
    // Part 2 restaurant-scoped editors.
    restaurantContact: (id: string) => `/admin/restaurants/${id}/contact-location`,
    restaurantHours: (id: string) => `/admin/restaurants/${id}/opening-hours`,
    restaurantPageBuilder: (id: string) => `/admin/restaurants/${id}/page-builder`,
    restaurantMenu: (id: string) => `/admin/restaurants/${id}/menu`,
    restaurantMenuImport: (id: string) => `/admin/restaurants/${id}/menu/import`,
    restaurantMenuImportDetail: (id: string, importId: string) =>
      `/admin/restaurants/${id}/menu/import/${importId}`,
    restaurantCategory: (id: string, categoryId: string) =>
      `/admin/restaurants/${id}/menu/categories/${categoryId}`,
    restaurantProduct: (id: string, productId: string) =>
      `/admin/restaurants/${id}/menu/products/${productId}`,
    restaurantMedia: (id: string) => `/admin/restaurants/${id}/media`,
    restaurantActions: (id: string) => `/admin/restaurants/${id}/customer-actions`,
    restaurantQr: (id: string) => `/admin/restaurants/${id}/qr-codes`,
    restaurantNfc: (id: string) => `/admin/restaurants/${id}/nfc-products`,
    restaurantCampaigns: (id: string) => `/admin/restaurants/${id}/campaigns`,
    restaurantCampaign: (id: string, campaignId: string) =>
      `/admin/restaurants/${id}/campaigns/${campaignId}`,
    restaurantAnalytics: (id: string) => `/admin/restaurants/${id}/analytics`,
    // Part 2 global pages.
    website: () => "/admin/website",
    enquiries: () => "/admin/enquiries",
    platformSettings: () => "/admin/platform-settings",
    team: () => "/admin/team",
    auditLog: () => "/admin/audit-log",
    // Sidebar-level destinations (cross-restaurant placeholders remain Part-2 stubs).
    menus: () => "/admin/menus",
    qrCodes: () => "/admin/qr-codes",
    nfcProducts: () => "/admin/nfc-products",
    campaigns: () => "/admin/campaigns",
    analytics: () => "/admin/analytics",
    mediaLibrary: () => "/admin/media",
    websiteCms: () => "/admin/website",
    templates: () => "/admin/templates",
    packages: () => "/admin/packages",
    faq: () => "/admin/faq",
    legalPages: () => "/admin/legal",
    teamAccess: () => "/admin/team",
    activityLog: () => "/admin/audit-log",
    settings: () => "/admin/platform-settings",
  },
} as const;

export type Routes = typeof routes;
