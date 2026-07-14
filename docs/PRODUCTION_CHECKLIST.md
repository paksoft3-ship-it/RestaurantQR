# Production / Vercel checklist

Everything in the admin (dashboard → settings, every option) now reads and writes
**real data** when a database is configured. This is the list of environment
variables and one-time steps to make the deployed site fully functional.

## Required environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Value | Why |
|---|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (`...-pooler...`) | The whole app (public reads + admin writes + analytics). Without it, everything falls back to per-browser demo data. |
| `AUTH_SECRET` | `openssl rand -base64 32` | Signs the admin session cookie. Without it, sessions use an insecure demo secret. |
| `AUTH_MODE` | `real` | Enables real password (scrypt) login. |
| `ENABLE_MOCK_AUTH` | `false` | Turn off demo login. |
| `ALLOW_MOCK_AUTH_IN_PRODUCTION` | `false` | Keep demo login off in prod. |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Removes the "Demo Mode" banner/labels. (Build-time — redeploy after changing.) |
| `NEXT_PUBLIC_BASE_URL` | `https://<your-domain>` | Correct absolute URLs, SEO, and email links. |
| `BLOB_READ_WRITE_TOKEN` | (auto) | Image uploads (logos, product/media images, action icons, social image). Add a **Vercel Blob store** to the project and this is set automatically. Without it, uploads fall back to temporary previews only. |

## Email (enquiries + team invites) — Resend

Enquiries always save to `/admin/enquiries`. To also **send email**:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | From [resend.com](https://resend.com) (free tier is fine) |
| `EMAIL_FROM` | A verified sender, e.g. `YourPlatform <hello@yourdomain.com>` |
| `ENQUIRY_NOTIFY_EMAIL` | (optional) where new-enquiry emails go; defaults to `EMAIL_FROM` |

Steps: create a Resend account → add & verify your sending domain → create an API
key → set the three vars above → redeploy. If unset, nothing breaks — email just
doesn't send.

## One-time database steps

Run these once against the production DB (use the Neon **direct/unpooled** URL for
migrations):

```bash
DATABASE_URL="<unpooled url>" pnpm db:migrate    # applies all migrations incl. events table (0004)
pnpm auth:set-password <admin-email> "<password>"  # set a real admin password
```

(The events/analytics table `0004` has already been applied to the current DB.)

## Analytics

Real analytics start collecting as soon as the site has `DATABASE_URL` and visitors
open **published** restaurant pages / tap buttons (respecting cookie consent). To
attribute the arrival channel, append `?via=qr` or `?via=nfc` to the QR/NFC
destination URLs (there's a hint on each restaurant's QR / NFC tab).

## Known limitation (not demo data, needs separate infra)

- **Menu PDF → OCR import** (`/admin/.../menu/import`) uses Tesseract + Poppler,
  which **cannot run on Vercel serverless**. The simpler **"upload a menu PDF"**
  feature (shown on the public menu page) works in production. Real OCR import
  would need a separate worker service (`MENU_IMPORT_WORKER_URL`).

## After setting everything

Redeploy. Then in the admin: log in with the real password, and **Publish** any
restaurants you want publicly visible (only `pizza-house` is published today;
new/other restaurants are hidden until you press Publish).
