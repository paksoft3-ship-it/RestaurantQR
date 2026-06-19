# Implementation Plan — Part 1

## Approach

Single Next.js 16 App Router app, feature-oriented structure, repository-abstracted data, demo-mode persistence, mock auth. Built milestone by milestone. Designs in `Part1/*` are the visual source of truth.

## Milestones

- **M0 — Foundation**: scaffold, deps, design tokens (Tailwind v4 `@theme`), self-hosted fonts, config, i18n, domain (entities/enums/schemas/permissions/status), repository contracts + mock repos, demo seed (Pizza House + 4), demo localStorage store, auth abstraction + mock adapter, proxy route guard, route helpers, UI primitives, global states, docs.
- **M1 — Shared public foundation**: marketing shell (header/mobile nav/footer), restaurant public shell, legal layout + sticky TOC, form transport + enquiry form, cookie preferences, loading/error/empty states.
- **M2 — Public pages**: all marketing + legal + Pizza House restaurant routes, fully designed (not wireframes).
- **M3 — Admin foundation**: login, auth protection, sidebar/topbar, dashboard components, tables/filters/status/dialogs/toasts, `PermissionGate`, `PendingPartTwoPage`.
- **M4 — Restaurant administration**: dashboard, restaurants list, add restaurant, detail workspace, general editor, branding editor — wired to mock repos + demo store.
- **M5 — Refinement**: responsive/a11y/RTL, metadata + noindex, unit + e2e tests, quality gates, docs + Part 2 map, final report.

## Quality gate (each milestone)

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` + Playwright smoke for completed route groups.

## Key decisions

- Tailwind v4 token names mirror Stitch exports for near-direct design porting.
- Fonts vendored locally (Fontsource) — offline/CI safe.
- Server reads via `getRepositories()`; admin demo writes via `demoStore` (localStorage) — both behind repository-shaped APIs, replaceable by a real backend.
- Mock auth gated to non-production; signed HttpOnly cookie.
