# Data Model

Source of truth: `src/domain/entities/index.ts` (types) + `src/domain/enums/index.ts` (vocabularies) + `src/domain/schemas/index.ts` (Zod).

## Entities

- **Restaurant** — identity, classification, languages, visual direction, operational/setup/project/publishing statuses, assigned teams, internal notes.
- **RestaurantLocation** — address, geo, map, timezone, public label.
- **OpeningHours** — per-day status + periods + special hours.
- **Branding** — logos/symbol/cover/social/favicon, `BrandColors`, typography, button/card/icon styles, rights status, readiness, version, review status.
- **MenuCategory / MenuProduct** — localized name/desc, price/currency, availability, variants, dietary labels, allergen note, featured, sort.
- **CustomerAction** — type (call/menu/online/visit/whatsapp/...), destination type + value, enabled, status.
- **QRCodeRecord** — display identifier, placement, destination, status, artwork status. (No signing secrets.)
- **NFCProduct** — display identifier, product type, placement, destination, assignment/operational/artwork status. (No chip secrets.)
- **Campaign** — localized title/desc, schedule, claim deadline, `CampaignReward`, eligibility, attempt rules, terms version, organizer, publishing status.
- **Enquiry** — contact + restaurant info, enquiry type, interests, preferred contact, message, status.
- **AdminUser** — display name, email, role, status, permissions.
- **ActivityRecord** — actor, action, resource, description, timestamp.
- **LegalPage** — type, locale, version, dates, status, sections.
- **MediaAsset** — type, filename, public URL, alt text, rights status, status.

## Enums

restaurant types, service models, structure types, visual directions, operational/setup/project/publishing statuses, menu/availability statuses, customer action + destination types, QR/NFC/artwork statuses, campaign/enquiry/review/rights/asset statuses, legal page + media types, days of week.

## Localization

`LocalizedText = { en: string } & Partial<Record<Locale, string>>` — English always present; other locales optional with safe fallback.

## Notes

- No payment, cart, owner-account, or customer-account entities exist by design.
- Public-facing types deliberately exclude QR signing secrets and NFC chip secrets.
