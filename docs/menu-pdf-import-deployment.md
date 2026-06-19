# PDF Menu Import — Deployment

## Components

1. **Next.js app** → Vercel (existing). Provides UI, review, approval, commit, audit.
2. **menu-extraction-worker** → any container host (Fly.io, Render, Cloud Run, ECS, a VM). Independent of the app's host.

## Local development

```bash
# App (uses the deterministic in-app extractor by default — no worker needed):
pnpm dev

# Worker (optional, to exercise the real text extractor):
docker compose up menu-extraction-worker
# or:
cd services/menu-extraction-worker && pip install -e ".[dev,ocr]" && uvicorn app.main:app --reload
```

`docker-compose.yml` wires `web` ⇄ `menu-extraction-worker` for a fully self-hosted
setup. On Vercel, keep the app serverless and host the worker separately.

## Environment variables

App (`.env.example` has all): `NEXT_PUBLIC_MENU_PDF_IMPORT`, `…MAX_FILE_SIZE_MB`,
`…MAX_PAGE_COUNT`, `…MAX_IMAGE_COUNT`, `…CONFIDENCE_HIGH/MEDIUM`, and server-only
`MENU_IMPORT_WORKER_URL`, `MENU_IMPORT_WORKER_SECRET`, `MENU_IMPORT_QUEUE_URL`,
`MENU_IMPORT_STORAGE_BUCKET`, `MENU_IMPORT_TEMP_RETENTION_HOURS`,
`MENU_IMPORT_JOB_TIMEOUT_SECONDS`, `MENU_IMPORT_PAGE_TIMEOUT_SECONDS`,
`MENU_IMPORT_OCR_LANGUAGES`, `MENU_IMPORT_AI_*`.

Worker (prefix `MENU_IMPORT_`): `WORKER_SECRET` (must match the app), `OCR_LANGUAGES`,
limits, `AI_*`, `TEMP_DIR`.

> Never commit real secrets. `MENU_IMPORT_WORKER_SECRET` must be a strong random value
> in production and identical on both sides.

## Wiring the worker (production)

1. Set `MENU_IMPORT_WORKER_URL` + `MENU_IMPORT_WORKER_SECRET` on the app.
2. Implement a `MenuExtractionWorker` that POSTs the PDF to
   `POST {WORKER_URL}/internal/menu-imports/process` with header
   `x-worker-secret: {secret}` and persists the returned `ImportResult`.
3. Run extraction as a background job (queue) and stream progress events to the UI.
4. Move uploads to signed object-storage URLs; render pages/images to storage.

## OCR language packs

The Dockerfile installs `tesseract-ocr-eng/tur/ara` + `poppler-utils`. Add packs
for any additional `MENU_IMPORT_OCR_LANGUAGES`.

## Scaling

Set worker CPU/memory limits (see `docker-compose.yml` comments), per-job
concurrency, and job/stage timeouts. The worker is stateless; scale horizontally.
