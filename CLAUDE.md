@AGENTS.md

# CLAUDE.md — YourPlatform (Managed QR/NFC Restaurant Platform)

Continuation guide for future Claude Code sessions. Read this first, then `docs/IMPLEMENTATION_STATUS.md`.

> Next.js 16 has breaking changes vs older versions (see AGENTS.md). When unsure of an API, read `node_modules/next/dist/docs/`. Notably: the request `middleware` convention is renamed to **`proxy`** (`src/proxy.ts`), and `cookies()` is async.

## What this is

A single Next.js (App Router) application with three surfaces:

1. **Public marketing website** for YourPlatform.
2. **Public customer-facing restaurant experiences** (QR/NFC landing pages).
3. **Private admin** for authorized YourPlatform staff only.

YourPlatform is a **fully managed service**.

## Permanent business rules (invariants — never violate)

- **No restaurant-owner accounts**: no owner registration, login, dashboard, CMS, invitations, subscriptions, or self-service purchase.
- **No customer accounts / login.**
- **No internal checkout / cart / payment forms / POS / waiter-call / kitchen tools.**
- **"Online Order with Pay" opens an EXTERNAL restaurant ordering site** — never an internal cart.
- **No public QR generator / NFC programming.** No gambling/casino mechanics.
- **No fabricated data**: no fake contacts, legal entities, client claims, or verified stats. Unknown business values render as "To be confirmed" / "To be added".
- **No automatic publishing** — admin actions create drafts; publishing is a separate, reviewed step.
- The four primary restaurant actions: **Call Order, Pick Your Meal, Online Order with Pay, Visit Us.**

## Tech

Next 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 (CSS `@theme`) · Zod 4 · React Hook Form · TanStack Table · Recharts · lucide-react · Vitest + RTL · Playwright · pnpm. Fonts are **self-hosted** (Fontsource woff2 via `next/font/local`) — do NOT switch to `next/font/google` (offline/CI builds have no Google Fonts access). Manrope = headings, Inter = body.

## Architecture conventions

- **Repositories only.** Pages never import seed JSON. Server reads go through `getRepositories()` (`src/data/repositories`). Client/admin demo persistence goes through `demoStore` (`src/lib/storage/demo-store.ts`, localStorage). Both honor the contracts in `src/domain/repositories`.
- **Domain layer** (`src/domain`): `entities`, `enums`, `schemas` (Zod), `permissions`, `status`, `repositories`.
- **Routes**: always build with `routes.*` helpers (`src/lib/routes.ts`). Never hand-concatenate.
- **Status**: always from `src/domain/status` via `<StatusBadge group value />`. Status is never color-only (icon + text always).
- **Permissions**: constants in `src/domain/permissions`; gate admin UI with `<PermissionGate>`. Frontend checks are UX-only; server boundaries are the source of truth.
- **Config**: `src/lib/config/app-config.ts`; render missing values via `displayValue()`.
- **i18n**: `src/lib/i18n` (en/tr/ar + de prepared). `LocaleProvider` sets `lang`/`dir`; Arabic = RTL. Use `LocalizedText` + `resolveText()`.
- **Design tokens**: `src/app/globals.css` `@theme`. Token names mirror the Stitch exports (`bg-primary`, `text-text-primary`, `font-display`, `text-h1`, `surface-warm`, etc.).
- Server Components by default; Client Components only for interaction/state/forms/storage/charts.
- Keep pages thin: extract feature components under `src/components/<area>`. No giant page files. No `any`.

## Auth (demo)

- `src/lib/auth`: `getCurrentAdminUser`, `requireAdminUser`, `hasPermission`, `requirePermission`, `signIn`, `signOut`.
- Mock auth is **non-production only** + `ENABLE_MOCK_AUTH=true`. Signed HttpOnly cookie (HMAC over `AUTH_SECRET`). Never works silently in production. Demo login: `admin@yourplatform.test` / `demo1234`.
- `src/proxy.ts` guards `/admin/*` (redirects to login, sets `noindex`). Full session verification happens in the admin layout.

## Demo safety

`NEXT_PUBLIC_DEMO_MODE=true` ⇒ show "Demo Mode" indicator in admin, label illustrative stats as "Demo Data", state form submissions are simulated, state uploads are temporary. When false, never show fabricated stats or simulate email delivery.

## Design system (canonical)

Primary `#F04424`, Primary Dark `#C9341A`, Navy `#111827`, Surface `#F8FAFC`, Warm `#FFF1EB`, Accent `#FFC533`. Success `#16A34A` / Warning `#D97706` / Danger `#DC2626` / Info `#2563EB`. Radii: controls 12px, cards 16px, panels 20px, pills full. One elevation level. Public = bold/appetizing/mobile-first; Admin = calm/operational. Full detail in `docs/DESIGN_SYSTEM.md`; source designs in `Part1/*/code.html` + `screen.png` (visual source of truth; `Part1/modern_fast_food/DESIGN.md` is the design language).

## Part 1 route inventory

Marketing: `/`, `/how-it-works`, `/features`, `/qr-nfc-products`, `/restaurant-examples`, `/templates`, `/packages`, `/about`, `/faq`, `/contact`. Legal: `/privacy`, `/cookies`, `/terms`, `/campaign-terms`. Restaurant: `/restaurants/[slug]`, `/menu`, `/menu/[product]`, `/contact`, `/campaigns/[c]`, `/campaigns/[c]/terms`. Admin: `/admin/login`, `/admin`, `/admin/restaurants`, `/admin/restaurants/new`, `/admin/restaurants/[id]`, `/admin/restaurants/[id]/edit`, `/admin/restaurants/[id]/branding`.

## Part 2 (specs 27–44) — implemented

All Part 2 admin pages are built and wired: restaurant-scoped editors under `/admin/restaurants/[id]/{contact-location,opening-hours,page-builder,menu,menu/categories/[cid],menu/products/[pid],media,customer-actions,qr-codes,nfc-products,campaigns,campaigns/[cid],analytics}` and global `/admin/{website,enquiries,platform-settings,team,audit-log}`. They are client components using the generic **demo-store collection API** (`demoStore.products/categories/campaigns/qr/nfc/media/customerActions/locations/enquiries/team/audit/websiteContent` each with `all/byId/where/create/update/remove/reorder/setAll`; plus `getOpeningHours/setOpeningHours`, `getSettings/updateSettings`, `recordActivity`). Editor Zod schemas live in `src/domain/schemas`. Designs: `Part2/*/code.html` + `screen.png`; specs in `All44Prompts.md` (pages 27–44). The restaurant workspace tabs link to all of them. Saves are draft-only and never auto-publish. A few **global cross-restaurant** routes not in the 44-page spec (`/admin/menus`, `/admin/qr-codes`, `/admin/nfc-products`, `/admin/campaigns`, `/admin/analytics`, `/admin/media`, `/admin/templates`, `/admin/packages`, `/admin/faq`, `/admin/legal`) still use `PendingPartTwoPage`.

When extending further, do NOT rewrite the admin shell, restaurant workspace tabs, repository contracts, status/permission systems, demo store, forms, tables, or tokens. See `docs/PART_2_INTEGRATION.md`.

## PDF Menu Import (added feature)

Admin feature to convert a menu PDF → reviewable structured JSON → commit into the **draft** menu (published menu untouched; human review required; nothing auto-imported). Built against the demo architecture with replaceable interfaces. Key paths: canonical Zod schema `src/domain/menu-import/schema.ts` (`SCHEMA_VERSION 1.0.0`), enums/status `src/domain/menu-import/{enums,status,entities}.ts`, worker/AI interfaces + deterministic demo extractor + price-normalization + validation + client service `src/features/menu-import/*`, demo persistence via `demoStore.menuImports`, UI under `/admin/restaurants/[id]/menu/import[/[importId]]`, permissions `MENU_IMPORT_*`, flag `appConfig.features.menuPdfImport`. **Extraction is simulated** (no real OCR) — labelled as such in the UI. A real Python worker scaffold lives in `services/menu-extraction-worker/` (FastAPI + Pydantic mirror of the Zod schema + real pdfplumber text extractor; OCR/AI/queue/storage pluggable). Docs: `docs/menu-pdf-import*.md`. Tests: `src/features/menu-import/*.test.ts` + `services/menu-extraction-worker/tests/`.

## Commands

`pnpm dev | build | start | lint | typecheck | test | test:watch | test:e2e | format`. Before marking a milestone done: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Definition of done

See section 47 of the master prompt and `docs/IMPLEMENTATION_STATUS.md`. Every route exists with loading/error/empty/not-found states; admin protected; demo isolated; forms validate + preserve data; cookie prefs persist; a11y + RTL basics; no admin indexing; lint/typecheck/test/build pass.
