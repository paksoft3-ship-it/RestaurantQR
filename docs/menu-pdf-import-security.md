# PDF Menu Import — Security

## Trust boundaries

- The worker is **internal only** — never exposed to public users. Authenticate
  every call with `x-worker-secret` (constant-time compare; see `app/core/security.py`).
- All admin actions are permission-checked. Frontend `PermissionGate` is UX only;
  enforce `MENU_IMPORT_*` server-side at the API/worker boundary in production.

## File handling

- Validate **server-side**: MIME, PDF magic bytes (`%PDF-`), size, page count,
  encryption/password, corruption, suspicious object counts, decompression-bomb risk.
  Do not trust the browser MIME type alone.
- Use **signed upload URLs**; do not proxy large PDFs through web-server memory.
- Reject unsafe/unsupported files with a clear, non-leaking message.

## Sandboxing the worker

- Runs as a **non-root** user (uid 10001). App files read-only; only `/tmp/menu-imports`
  is writable (and `tmpfs` in compose). Set CPU/memory limits + job/stage timeouts.
- Clean temporary artifacts after each job (and via a retention job).
- Restrict network egress where practical. Never run embedded PDF JavaScript or
  execute embedded files. Never shell out with unsanitized file names. Prevent
  path traversal and archive/image decompression bombs.

## AI privacy

- Do not send original PDFs or unrelated restaurant/customer data to AI providers
  unless the configured provider + privacy policy explicitly permit it. Send the
  minimum page text/region required.
- No API keys in source — env only. Aggregate token/cost logging; no raw secrets logged.

## Secrets & logging

- `MENU_IMPORT_WORKER_SECRET`, AI keys, storage creds: env only, never committed,
  never in exports or error messages. Show users human-readable errors + a support
  reference ID; keep stack traces server-side.
- Audit every meaningful action (`recordActivity` in the app): upload, create,
  process, cancel, retry, OCR/AI used, corrections, merges, warning resolution,
  blocking-warning override, approve, commit, archive, export — with actor, role,
  restaurant, import id, before/after summary, reason, timestamp, correlation id.

## Privacy & retention

Configurable retention for original PDF, rendered pages, OCR text, extracted images,
raw AI responses, reviewed JSON, failed imports, temp artifacts. Don't retain temp
artifacts indefinitely. Support archive (non-destructive) over hard delete; honor
legal hold where the project supports it.

## Separation of duties

Where required, a user may not approve their own **blocking-warning override**
(`MENU_IMPORT_OVERRIDE_BLOCKING_WARNING`). Overrides require a recorded reason.
