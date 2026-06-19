# menu-extraction-worker

Containerized PDF → structured-menu extraction worker for YourPlatform. Internal,
service-to-service only. Heavy PDF/OCR work lives here (never in Vercel functions).

## What is real vs. pluggable

| Capability | Status |
|---|---|
| PDF preflight (classify text/scanned/mixed) | ✅ real (pdfplumber) |
| Native text + coordinate extraction | ✅ real (pdfplumber) |
| Typography-based category/product detection | ✅ real (basic, deterministic) |
| Price normalization (TR/EUR/USD/…) | ✅ real (mirrors the TS impl) |
| Canonical schema (Pydantic ⇄ Zod) | ✅ aligned |
| OCR for scanned pages | 🔌 pluggable — enable `[ocr]` extra + tesseract/poppler |
| Visual layout / image extraction / matching | 🔌 stubbed (raises/no-op, wired for production) |
| AI-assisted analysis | 🔌 provider abstraction (`app/providers`), disabled by default |
| Queue / job state | 🔌 owned by the Next.js app |

It never fabricates a "complete" extraction for scanned PDFs — it flags that OCR
is required and returns what it can with provenance + confidence.

## Run locally

```bash
cd services/menu-extraction-worker
pip install -e ".[dev,ocr]"
uvicorn app.main:app --reload --port 8000
# health:
curl localhost:8000/health
```

Process a PDF (base64), with the shared secret header:

```bash
curl -X POST localhost:8000/internal/menu-imports/process \
  -H "x-worker-secret: $MENU_IMPORT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"importId":"imp_1","restaurantId":"r1","fileName":"menu.pdf","pdfBase64":"<...>"}'
```

## Endpoints

- `GET /health`, `GET /ready`
- `POST /internal/menu-imports/process` → `ImportResult` (auth required)
- `GET /internal/menu-imports/{id}/health` (auth required)

## Config (env, prefix `MENU_IMPORT_`)

`WORKER_SECRET`, `MAX_FILE_SIZE_MB`, `MAX_PAGE_COUNT`, `MAX_IMAGE_COUNT`,
`JOB_TIMEOUT_SECONDS`, `PAGE_TIMEOUT_SECONDS`, `OCR_LANGUAGES`, `AI_ENABLED`,
`AI_PROVIDER`, `AI_MODEL`, `AI_MAX_PAGES`, `CONFIDENCE_HIGH`, `CONFIDENCE_MEDIUM`,
`TEMP_DIR`.

## Tests

```bash
pytest
```

## Docker

```bash
docker build -t menu-extraction-worker .
docker run -p 8000:8000 -e MENU_IMPORT_WORKER_SECRET=... menu-extraction-worker
```

Runs as a non-root user, ships tesseract language packs (eng/tur/ara) and poppler,
with a writable `/tmp/menu-imports` temp dir and a health check.
