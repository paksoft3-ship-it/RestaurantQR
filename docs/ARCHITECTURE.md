# Architecture

## Layers

```
app/         App Router routes (route groups: (marketing), restaurants, admin)
components/  ui (primitives), shared, marketing, restaurant, admin, legal, forms, charts, previews
features/    feature-scoped composition (optional)
domain/      entities, enums, schemas (Zod), permissions, status, repositories (contracts)
data/        seed (demo data), repositories (mock server impl)
lib/         auth, config, i18n, routes, storage (demo store), utils, fonts
content/     legal (structured), marketing/restaurant-demo content
```

## Data access

- **Reads (server)**: `getRepositories()` → mock impl over seed. Replace this one accessor to connect a real backend.
- **Writes (admin, demo)**: `demoStore` (localStorage), versioned + corruption-safe + resettable. Both conform to `src/domain/repositories` contracts.
- Pages never import seed JSON directly.

## Rendering

Server Components by default. Client Components for forms (RHF), interactive filters, charts (Recharts), storage access, dialogs, cookie/locale state.

## Auth

Signed HttpOnly cookie (HMAC/`AUTH_SECRET`). `proxy.ts` does a cheap cookie-presence guard + noindex; the admin layout does full `requireAdminUser()` verification. Mock adapter is non-production only.

## i18n / RTL

`LocaleProvider` (client) persists locale and sets `<html lang/dir>`. `LocalizedText` carries per-locale strings with English fallback via `resolveText()`. Arabic ⇒ RTL.

## Status & permissions

Centralized registries (`domain/status`, `domain/permissions`) so labels/colors/grants live in one place. `StatusBadge` (icon+text+intent) and `PermissionGate` consume them.

## Replaceability

A production backend implements the same repository interfaces (REST/GraphQL/Server Actions/Prisma/Supabase). See `BACKEND_INTEGRATION_CONTRACT.md`.
