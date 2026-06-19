# PDF Menu Import — Architecture

## Hybrid design

```
┌──────────────────────────── Next.js (Vercel) ────────────────────────────┐
│ Upload UI · config · progress · review workspace · validation · approval  │
│ commit-to-draft · history · audit · permissions · feature flag            │
│                                                                           │
│  MenuExtractionWorker interface  ──┐                                       │
│    • demo: deterministic in-app    │  same canonical schema (v1.0.0)       │
│    • prod: HTTP/queue → Python  ───┼──────────────────────────────────┐   │
└────────────────────────────────────┘                                  │   │
                                                                         ▼   │
┌──────────────── Python worker (container, independent) ───────────────────┐
│ preflight · native text + coords · OCR* · layout* · images* · matching*    │
│ price normalization · structuring · confidence · validation                │
│  (* pluggable / production)                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

Heavy PDF/OCR work runs in the **container**, never in Vercel functions.

## Pipeline stages

`VALIDATING → PREFLIGHT → EXTRACTING_TEXT → RUNNING_OCR → ANALYZING_LAYOUT → EXTRACTING_IMAGES → MATCHING_IMAGES → STRUCTURING_DATA → VALIDATING_OUTPUT → REVIEW_REQUIRED`. Each emits a progress event (`MenuImportEvent`) with a nominal % (`STAGE_META`). Progress is shown as stage names + estimated state — never a fabricated countdown.

## Data layer

- **This demo:** the `MenuImport` record (with the embedded canonical `result`) is persisted in the browser **demo store** (`localStorage`), versioned + corruption-safe. Commit creates **draft** `MenuCategory`/`MenuProduct` records via the same store; the published (active) menu is untouched.
- **Production:** map `MenuImport` + `MenuImportPage` + `*Candidate` + `MenuImportWarning` + `MenuImportEvent` to the project's ORM; store rendered pages/images in object storage (not DB blobs); run extraction as a queued background job; commit inside a single DB transaction.

## Schema alignment

`SCHEMA_VERSION = "1.0.0"` is the contract. TS (`Zod`) and Python (`Pydantic`)
mirror each other; the JSON example in `menu-pdf-import.md` + the shared schema
tests are the alignment check. Bump the version on any breaking change and keep
both sides in lockstep.

## Replaceability

Swap the demo extractor for the worker by implementing `MenuExtractionWorker.extract`
to POST to `/internal/menu-imports/process` (or enqueue a job) and stream events
back via the project's real-time pattern (SSE/WebSocket/poll). No page/UI changes
required — they depend only on the service + schema.

## AI assistance

`MenuExtractionAIProvider` (TS) / `MenuExtractionAIProvider` (Python Protocol) is
provider-agnostic, env-configured, schema-validated, retried with limits, with a
deterministic fallback. Disabled by default; no keys in source; send only the
minimum page data. No import is ever based solely on AI output.
