# PDF Menu Import — Troubleshooting

## Error codes

`INVALID_PDF`, `PDF_ENCRYPTED`, `PDF_PASSWORD_REQUIRED`, `PDF_CORRUPT`,
`PDF_TOO_LARGE`, `PAGE_LIMIT_EXCEEDED`, `UNSAFE_PDF`, `TEXT_EXTRACTION_FAILED`,
`OCR_FAILED`, `LAYOUT_ANALYSIS_FAILED`, `IMAGE_EXTRACTION_FAILED`,
`AI_PROVIDER_FAILED`, `SCHEMA_VALIDATION_FAILED`, `STORAGE_FAILED`, `JOB_TIMEOUT`,
`JOB_CANCELLED`, `IMPORT_CONFLICT`, `DATABASE_IMPORT_FAILED`, `PERMISSION_DENIED`.

Users see a human-readable error + failed stage + retry availability + a support
reference id. Technical detail stays in server logs.

## Common issues

| Symptom | Likely cause | Fix |
|---|---|---|
| "Feature disabled" empty state | `NEXT_PUBLIC_MENU_PDF_IMPORT=false` | enable the flag |
| Upload rejected | over `MAX_FILE_SIZE_MB`, not `application/pdf`, or > `MAX_PAGE_COUNT` | adjust limits or the file |
| Stuck before `REVIEW_REQUIRED` | (prod) worker/queue down | check worker `/health`, queue, `MENU_IMPORT_JOB_TIMEOUT_SECONDS` |
| Scanned PDF → mostly empty + `OCR_LOW_CONFIDENCE` warning | OCR not enabled | install `[ocr]` extra + tesseract/poppler; set `MENU_IMPORT_OCR_LANGUAGES` |
| Turkish characters garbled | missing `tur` language pack | add `tesseract-ocr-tur` |
| Approve button disabled | unresolved BLOCKING warnings or no products selected | resolve warnings / select products |
| Commit "must be approved" | not in `READY_TO_IMPORT` | approve first |
| 401 from worker | secret mismatch | align `MENU_IMPORT_WORKER_SECRET` on both sides |
| Demo: imports vanished | demo store reset / version bump | re-run import (demo persists in `localStorage`) |

## Demo notes

- Extraction is **simulated** in this build (deterministic, seeded from the
  restaurant's real menu). It is not real OCR — do not interpret results as a real
  parse. Scanned-PDF accuracy requires the production OCR path.
- Demo persistence is `localStorage`; "Reset Demo Data" clears it.

## Worker logs

Structured logs include import id, restaurant id, job id, stage, page, duration,
retry count, warning count, extraction method, OCR pages, AI calls, error code,
correlation id. Tail the container logs and check `/health` / `/ready`.
