# Environment Variables

Copy `.env.example` → `.env.local`. Never commit real secrets. `NEXT_PUBLIC_*` are exposed to the browser — keep secrets out of them.

## Public

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | YourPlatform | Brand name |
| `NEXT_PUBLIC_BASE_URL` | http://localhost:3000 | Canonical/metadata base |
| `NEXT_PUBLIC_DEMO_MODE` | true | Enables demo indicators + localStorage persistence |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | en | Default UI locale |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | en,tr,ar | Active locales |
| `NEXT_PUBLIC_SUPPORT_EMAIL/PHONE`, `WHATSAPP_NUMBER`, `BUSINESS_ADDRESS`, `WORKING_HOURS`, `LEGAL_COMPANY_NAME`, `PRIVACY_CONTACT`, `SOCIAL_*` | blank | Business values; blank ⇒ "To be confirmed" |

## Server-only (secrets)

| Var | Default (dev) | Purpose |
|---|---|---|
| `AUTH_SECRET` | dev-insecure-secret | HMAC session signing. Set a strong value in prod. |
| `ENABLE_MOCK_AUTH` | true | Mock auth toggle. **Ignored in production.** |
| `MOCK_ADMIN_EMAIL` | admin@yourplatform.test | Demo login email |
| `MOCK_ADMIN_PASSWORD` | demo1234 | Demo login password |
| `FORM_TRANSPORT` | mock | `mock` \| `configured` |
| `ANALYTICS_MODE` | mock | `off` \| `mock` \| `configured` |

## PDF Menu Import (feature)

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MENU_PDF_IMPORT` | true | Feature flag (hide actions + block server-side when false) |
| `NEXT_PUBLIC_MENU_IMPORT_MAX_FILE_SIZE_MB` | 25 | Upload size limit |
| `NEXT_PUBLIC_MENU_IMPORT_MAX_PAGE_COUNT` | 40 | Page-count limit |
| `NEXT_PUBLIC_MENU_IMPORT_MAX_IMAGE_COUNT` | 200 | Embedded-image limit |
| `NEXT_PUBLIC_MENU_IMPORT_CONFIDENCE_HIGH/MEDIUM` | 0.9 / 0.7 | Confidence thresholds |
| `MENU_IMPORT_WORKER_URL` | blank | Python worker URL (blank ⇒ in-app deterministic extractor) |
| `MENU_IMPORT_WORKER_SECRET` | blank | Service-to-service shared secret (must match worker) |
| `MENU_IMPORT_QUEUE_URL`, `…_STORAGE_BUCKET` | blank | Production queue + object storage |
| `MENU_IMPORT_TEMP_RETENTION_HOURS` | 72 | Temp-artifact retention |
| `MENU_IMPORT_JOB_TIMEOUT_SECONDS`, `…_PAGE_TIMEOUT_SECONDS` | 900 / 120 | Timeouts |
| `MENU_IMPORT_OCR_LANGUAGES` | tur,eng,ara | OCR language packs |
| `MENU_IMPORT_AI_ENABLED`, `…_AI_PROVIDER`, `…_AI_MODEL`, `…_AI_MAX_PAGES` | false / blank | Optional AI assistance |

See `docs/menu-pdf-import*.md`. Worker secrets/AI keys are server-only — never `NEXT_PUBLIC_`.

## Production notes

- Mock auth never activates in production (guarded by `NODE_ENV`).
- Set `NEXT_PUBLIC_DEMO_MODE=false` to suppress fabricated stats and demo persistence.
- Provide a real `AUTH_SECRET`.
