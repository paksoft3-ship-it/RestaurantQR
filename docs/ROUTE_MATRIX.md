# Route Matrix — Part 1

| Route | Surface | Type | Auth | Index | Data repos |
|---|---|---|---|---|---|
| `/` | Marketing | Server | Public | Yes | — |
| `/how-it-works` | Marketing | Server | Public | Yes | — |
| `/features` | Marketing | Server | Public | Yes | — |
| `/qr-nfc-products` | Marketing | Server | Public | Yes | — |
| `/restaurant-examples` | Marketing | Server | Public | Yes | restaurants |
| `/templates` | Marketing | Server | Public | Yes | — |
| `/packages` | Marketing | Server | Public | Yes | — |
| `/about` | Marketing | Server | Public | Yes | — |
| `/faq` | Marketing | Server | Public | Yes | — |
| `/contact` | Marketing | Server+Client form | Public | Yes | enquiries |
| `/privacy` `/cookies` `/terms` `/campaign-terms` | Legal | Server | Public | Yes | legal |
| `/restaurants/[slug]` | Restaurant | Server | Public | Yes (if published) | restaurants, menus, campaigns |
| `/restaurants/[slug]/menu` | Restaurant | Server+Client filter | Public | Yes | restaurants, menus |
| `/restaurants/[slug]/menu/[product]` | Restaurant | Server | Public | Yes | menus |
| `/restaurants/[slug]/contact` | Restaurant | Server | Public | Yes | restaurants |
| `/restaurants/[slug]/campaigns/[c]` | Restaurant | Server+Client | Public | Yes | campaigns |
| `/restaurants/[slug]/campaigns/[c]/terms` | Restaurant | Server | Public | Yes | campaigns, legal |
| `/admin/login` | Admin | Client form | Public→auth | noindex | auth |
| `/admin` | Admin | Server+Client | Required | noindex | all |
| `/admin/restaurants` | Admin | Client (demo store) | Required | noindex | restaurants |
| `/admin/restaurants/new` | Admin | Client form | Required | noindex | restaurants |
| `/admin/restaurants/[id]` | Admin | Client | Required | noindex | restaurants, branding, menus, qr, nfc, campaigns, analytics, activity |
| `/admin/restaurants/[id]/edit` | Admin | Client form | Required | noindex | restaurants |
| `/admin/restaurants/[id]/branding` | Admin | Client form | Required | noindex | branding |
| `/admin/menus`, `/qr-codes`, `/nfc-products`, `/campaigns`, `/analytics`, `/enquiries`, `/media`, `/website`, `/templates`, `/packages`, `/faq`, `/legal`, `/team`, `/activity`, `/settings` | Admin | PendingPartTwoPage | Required | noindex | — (Part 2) |

Admin routes are forced `noindex` via `src/proxy.ts` header.
