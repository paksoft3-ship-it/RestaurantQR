# YourPlatform — Managed QR/NFC Restaurant Platform (Part 1)

A single Next.js 16 application with three surfaces: a public marketing site, public QR/NFC restaurant experiences, and a private admin for authorized YourPlatform staff. **Fully managed service — no restaurant-owner accounts, no internal checkout.**

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

Demo admin login (dev only): `admin@yourplatform.test` / `demo1234` at `/admin/login`.

## Scripts

```bash
pnpm dev | build | start
pnpm lint | typecheck
pnpm test | test:watch
pnpm test:e2e | test:e2e:ui
pnpm format | format:check
```

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4, Zod, React Hook Form, TanStack Table, Recharts, lucide-react, Vitest + Testing Library, Playwright, pnpm. Self-hosted Manrope + Inter fonts.

## Documentation

- `CLAUDE.md` — start here (architecture + invariants).
- `docs/IMPLEMENTATION_PLAN.md`, `docs/IMPLEMENTATION_STATUS.md`
- `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/DESIGN_SYSTEM.md`
- `docs/ROUTE_MATRIX.md`, `docs/BACKEND_INTEGRATION_CONTRACT.md`
- `docs/PART_2_INTEGRATION.md`, `docs/ENVIRONMENT_VARIABLES.md`

## Deployment

Targets Vercel. No writable FS or in-memory persistence required in production. Set a strong `AUTH_SECRET`; mock auth is disabled in production automatically. Admin routes are `noindex`.
# RestaurantQR
