# PDF Menu Import

Convert a restaurant menu PDF into structured, **reviewable** JSON and import the
approved result into the restaurant's **draft** menu. The published menu is never
touched until you separately publish.

> **Extraction is real (on-device OCR).** Uploaded PDFs are rasterised with
> Poppler's `pdftoppm` and read with **Tesseract** via the API route
> `POST /api/menu-import/extract` (Node runtime). The route calls `ocrPdf()`
> (`src/features/menu-import/worker/tesseract-runner.ts`) then the pure parser
> `parseOcrToResult()` (`.../worker/ocr-parser.ts`) to produce a reviewable
> `ImportResult`. Prices and structure recover well; **item names on dense scanned
> menus are noisy and must be corrected during review.** Persistence is still the
> demo store, and a real **Python worker scaffold**
> (`services/menu-extraction-worker`) remains for a production queue/storage setup.
> Nothing is auto-imported — human review and approval are mandatory.
>
> **Prerequisites:** `tesseract` and `pdftoppm` (poppler) must be on PATH —
> `brew install tesseract poppler` (macOS) or the distro equivalent. If a tool is
> missing the route returns `503 OCR_FAILED` with an actionable message and the
> import is marked `FAILED` (re-upload to retry). The legacy deterministic
> extractor (`buildDeterministicResult`) is retained but no longer on the upload
> path.

## Workflow

```
Select restaurant → Upload PDF → Validate → Configure → Start extraction
→ (background, staged progress) → Structured draft → Review (categories, products,
prices, images, warnings) → Resolve blocking warnings → Approve → Commit to draft
menu → Audit recorded. Published menu unchanged.
```

Human review is mandatory: low-confidence and warning-flagged fields must be
reviewed; blocking warnings prevent import until resolved (or overridden by an
authorized user).

## Where things live

| Concern | Path |
|---|---|
| Canonical schema (Zod) + version | `src/domain/menu-import/schema.ts` (`SCHEMA_VERSION = 1.0.0`) |
| Enums, status models, warning/error codes | `src/domain/menu-import/enums.ts` |
| Status badge metadata | `src/domain/menu-import/status.ts` |
| Import record entity | `src/domain/menu-import/entities.ts` |
| Worker + AI provider interfaces | `src/features/menu-import/worker/types.ts` |
| Deterministic demo extractor | `src/features/menu-import/worker/deterministic-extractor.ts` |
| Price normalization | `src/features/menu-import/price-normalization.ts` |
| Validation + quality report | `src/features/menu-import/validation.ts` |
| Client service (create→commit) | `src/features/menu-import/service.ts` |
| Demo persistence | `src/lib/storage/demo-store.ts` (`menuImports` collection) |
| Routes | `/admin/restaurants/[id]/menu/import` (+ `/[importId]`) |
| Python worker | `services/menu-extraction-worker/` |
| Permissions | `src/domain/permissions` (`MENU_IMPORT_*`) |
| Feature flag + limits | `src/lib/config/app-config.ts` (`features.menuPdfImport`, `menuImport.*`) |

## Status models (kept separate)

- **Processing**: `UPLOADED → VALIDATING → QUEUED → PREFLIGHT → EXTRACTING_TEXT → RUNNING_OCR → ANALYZING_LAYOUT → EXTRACTING_IMAGES → MATCHING_IMAGES → STRUCTURING_DATA → VALIDATING_OUTPUT → REVIEW_REQUIRED → READY_TO_IMPORT → IMPORTING → COMPLETED / PARTIALLY_COMPLETED / FAILED / CANCELLED / ARCHIVED`.
- **Review**: `NOT_STARTED → IN_REVIEW → CHANGES_REQUIRED → APPROVED → REJECTED`.

## Canonical JSON (v1.0.0)

```json
{
  "schemaVersion": "1.0.0",
  "importId": "imp_01HXYZ",
  "restaurantId": "RST-00024",
  "source": { "fileName": "pizza-house-menu.pdf", "pageCount": 8, "pdfType": "mixed", "detectedLanguages": ["tr"], "detectedCurrencies": ["TRY"], "processedAt": "2026-06-19T12:00:00Z" },
  "restaurant": { "name": { "value": "Pizza House", "confidence": 0.95 }, "currency": "TRY", "defaultLanguage": "tr" },
  "categories": [
    { "candidateId": "cat_1", "proposedId": "cat-pizzas", "name": { "value": "Pizzas", "confidence": 0.99 }, "displayOrder": 1, "sourcePages": [1,2], "confidence": 0.99, "reviewState": "pending", "selectedForImport": true, "items": [
      { "candidateId": "item_1", "proposedId": "item-margherita", "name": { "value": "Margherita Pizza", "confidence": 0.98 }, "description": { "value": "Tomato, mozzarella, basil", "confidence": 0.91 }, "basePrice": { "originalText": "240 ₺", "amount": 240, "currency": "TRY", "type": "BASE", "confidence": 0.99 }, "variants": [ { "name": "Large", "price": { "amount": 310, "currency": "TRY" } } ], "ingredients": [], "allergens": ["Gluten","Milk"], "dietaryLabels": ["Vegetarian"], "available": true, "displayOrder": 1, "confidence": 0.93, "reviewState": "pending", "selectedForImport": true, "warnings": [] }
    ] }
  ],
  "unassignedCandidates": [],
  "warnings": [],
  "statistics": { "categoryCount": 1, "productCount": 1, "imageCount": 0, "highConfidenceFields": 12, "mediumConfidenceFields": 2, "lowConfidenceFields": 0, "estimatedCompleteness": 0.93 }
}
```

The Python worker's Pydantic models (`services/menu-extraction-worker/app/schemas/menu_import.py`) mirror this exactly.

## Confidence

`HIGH ≥ 0.90`, `MEDIUM ≥ 0.70`, else `LOW` (thresholds configurable). Shown as
text + colour + numeric %, never colour alone. Completeness is presented as
**"estimated extraction completeness"**, never guaranteed accuracy.

## Permissions

`MENU_IMPORT_VIEW/CREATE/UPLOAD/PROCESS/REVIEW/EDIT/APPROVE/COMMIT/CANCEL/RETRY/EXPORT/ARCHIVE/OVERRIDE_BLOCKING_WARNING`. Granted to Menu Editor, Restaurant Setup Manager, Media Manager (review/images), Content Manager (review/edit), Analyst (view/export), and admins.

## Limits & flags

`NEXT_PUBLIC_MENU_PDF_IMPORT` (feature flag), `NEXT_PUBLIC_MENU_IMPORT_MAX_FILE_SIZE_MB`, `…MAX_PAGE_COUNT`, `…MAX_IMAGE_COUNT`, `…CONFIDENCE_HIGH/MEDIUM`. Worker secrets are server-only (see `docs/menu-pdf-import-deployment.md`).

See also: architecture, deployment, security, troubleshooting docs in this folder.
