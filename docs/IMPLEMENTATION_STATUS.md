# Implementation Status

Statuses: Not Started · In Progress · Implemented · Tested · Blocked · Waiting for Part 2 Design

## Foundation (M0)

| Item | Status |
|---|---|
| Next.js app + deps + scripts | Implemented |
| Design tokens (Tailwind v4 @theme) | Implemented |
| Self-hosted fonts (Manrope/Inter) | Implemented |
| App config + .env.example | Implemented |
| i18n (en/tr/ar, RTL, provider) | Implemented |
| Domain enums | Implemented |
| Domain entities | Implemented |
| Zod schemas | Implemented |
| Permissions + roles | Implemented |
| Status system | Implemented |
| Repository contracts | Implemented |
| Mock repositories (server) | Implemented |
| Demo seed data (5 restaurants) | Implemented |
| Demo localStorage store | Implemented |
| Auth abstraction + mock adapter | Implemented |
| Proxy route guard | Implemented |
| Route helpers | Implemented |
| UI primitives (Button/Badge/Card/...) | Implemented |
| Global states (not-found/error/loading) | Implemented |
| Vitest + Playwright config | Implemented |
| Docs | Implemented |

## M1 — Shared public foundation

| Item | Status |
|---|---|
| PublicHeader + MobilePublicNavigation | Implemented |
| PublicFooter | Implemented |
| Shared marketing sections/cards | Implemented |
| Restaurant public shell | Implemented |
| Legal layout + sticky TOC | Implemented |
| Form transport + enquiry form | Implemented |
| Cookie preferences | Implemented |

## M2 — Public pages

| Route | Status |
|---|---|
| `/` Homepage | Implemented |
| `/how-it-works` | Implemented |
| `/features` | Implemented |
| `/qr-nfc-products` | Implemented |
| `/restaurant-examples` | Implemented |
| `/templates` | Implemented |
| `/packages` | Implemented |
| `/about` | Implemented |
| `/faq` | Implemented |
| `/contact` | Implemented |
| `/privacy` `/cookies` `/terms` `/campaign-terms` | Implemented |
| `/restaurants/pizza-house` | Implemented |
| `/restaurants/[slug]/menu` | Implemented |
| `/restaurants/[slug]/menu/[product]` | Implemented |
| `/restaurants/[slug]/contact` | Implemented |
| `/restaurants/[slug]/campaigns/[c]` (+ /terms) | Implemented |

## M3 — Admin foundation

| Item | Status |
|---|---|
| `/admin/login` | Implemented |
| Admin shell (sidebar/topbar) | Implemented |
| Dashboard components | Implemented |
| Data table / filters / dialogs / toasts | Implemented |
| PendingPartTwoPage | Implemented |

## M4 — Restaurant administration

| Route | Status |
|---|---|
| `/admin` Dashboard | Implemented |
| `/admin/restaurants` | Implemented |
| `/admin/restaurants/new` | Implemented |
| `/admin/restaurants/[id]` | Implemented |
| `/admin/restaurants/[id]/edit` | Implemented |
| `/admin/restaurants/[id]/branding` | Implemented |

## M5 — Refinement

| Item | Status |
|---|---|
| Metadata + noindex | Implemented |
| Unit tests (32) | Tested |
| E2E smoke tests (public 18, admin 6, part2 3) | Tested |
| Quality gates (lint/typecheck/build) | Implemented |
| Final report | Implemented |

## Part 2 — Admin pages (specs 27–44)

All implemented, wired to the demo-store collections + editor schemas, reachable via the restaurant workspace tabs and sidebar. Quality gates green.

| Page | Route | Status |
|---|---|---|
| 27 Contact & Location Editor | `/admin/restaurants/[id]/contact-location` | Implemented |
| 28 Opening Hours Editor | `/admin/restaurants/[id]/opening-hours` | Implemented |
| 29 Page Builder | `/admin/restaurants/[id]/page-builder` | Implemented |
| 30 Digital Menu Manager | `/admin/restaurants/[id]/menu` | Implemented |
| 31 Menu Category Editor | `/admin/restaurants/[id]/menu/categories/[cid]` | Implemented |
| 32 Menu Product Editor | `/admin/restaurants/[id]/menu/products/[pid]` | Implemented |
| 33 Media Library | `/admin/restaurants/[id]/media` | Implemented |
| 34 Customer Actions Editor | `/admin/restaurants/[id]/customer-actions` | Implemented |
| 35 QR Code Management | `/admin/restaurants/[id]/qr-codes` | Implemented |
| 36 NFC Product Management | `/admin/restaurants/[id]/nfc-products` | Implemented |
| 37 Campaigns List | `/admin/restaurants/[id]/campaigns` | Implemented |
| 38 Campaign Editor | `/admin/restaurants/[id]/campaigns/[cid]` | Implemented |
| 39 Restaurant Analytics | `/admin/restaurants/[id]/analytics` | Implemented |
| 40 Public Website CMS | `/admin/website` | Implemented |
| 41 Leads / Enquiries | `/admin/enquiries` | Implemented |
| 42 Global SEO & Settings | `/admin/platform-settings` | Implemented |
| 43 Users & Team | `/admin/team` | Implemented |
| 44 Audit Log | `/admin/audit-log` | Implemented |

### Global cross-restaurant views (sidebar primary nav)

Beyond the 44-page spec, the sidebar's global items are now real **cross-restaurant aggregate** pages (list everything across all restaurants + link into the per-restaurant editors): `/admin/menus`, `/admin/qr-codes`, `/admin/nfc-products`, `/admin/campaigns`, `/admin/analytics`, `/admin/media` — **Implemented**.

Platform-content CMS pages are also implemented: `/admin/templates`, `/admin/packages`, `/admin/faq`, `/admin/legal` (managed via demo-store collections seeded from the public content + `content/legal`). **No admin route uses `PendingPartTwoPage` anymore** — every sidebar item leads to a working page. (`PendingPartTwoPage` remains as a reusable component for any future additions.)
