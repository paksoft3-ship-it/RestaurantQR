# Backend Integration Contract

The UI depends only on the interfaces in `src/domain/repositories/index.ts`. A production backend must satisfy these. Swap the implementation in `src/data/repositories/index.ts` (`getRepositories()`) and, for admin writes, replace `demoStore` usage with server actions/API calls.

## Conventions

- All methods are async and return domain entities (`src/domain/entities`).
- Validate inputs with the Zod schemas in `src/domain/schemas` at the boundary.
- Errors: throw typed errors; never leak secrets. Auth uses generic invalid-credentials messaging.

## Expected endpoints (illustrative REST mapping)

| Contract method | Method + path | Notes |
|---|---|---|
| `restaurants.list(query)` | `GET /restaurants?search&status&page&pageSize` | returns `Paginated<Restaurant>` |
| `restaurants.getById` | `GET /restaurants/:id` | |
| `restaurants.getBySlug` | `GET /restaurants/by-slug/:slug` | published only for public |
| `restaurants.isSlugAvailable` | `GET /restaurants/slug-available?slug&exceptId` | |
| `restaurants.create` | `POST /restaurants` | creates **draft**; never publishes |
| `restaurants.update` | `PATCH /restaurants/:id` | never auto-publishes |
| `restaurants.disable/archive` | `POST /restaurants/:id/(disable|archive)` | |
| `branding.get/update` | `GET/PATCH /restaurants/:id/branding` | update = draft |
| `menus.categories/products/productBySlug/customerActions` | `GET /restaurants/:id/menu/*` | |
| `campaigns.listByRestaurant/getBySlug` | `GET /restaurants/:id/campaigns[/:slug]` | |
| `qr.listByRestaurant/countByRestaurant` | `GET /restaurants/:id/qr` | no signing secrets in payload |
| `nfc.listByRestaurant/countByRestaurant` | `GET /restaurants/:id/nfc` | no chip secrets in payload |
| `enquiries.list/create` | `GET/POST /enquiries` | create from public form |
| `analytics.restaurantSnapshot/platformSnapshot` | `GET /analytics/*` | |
| `legal.get(type)` | `GET /legal/:type` | |
| `media.listByRestaurant` | `GET /restaurants/:id/media` | |
| `activity.recent/byRestaurant/record` | `GET/POST /activity` | |
| `auth.findByEmail/verifyCredentials` | provider-specific | replace mock adapter |

## Forms

`FORM_TRANSPORT=configured` should POST to a server action / API / email / CRM. While `mock`, submissions are simulated and clearly labelled; no email is claimed to be sent.

## Publishing

Publishing is always an explicit, reviewed transition — the backend must not publish on create/update.
