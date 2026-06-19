# Part 2 Integration Map

> **Designs now available.** Part 2 visual designs are in `Part2/<page>/code.html` + `screen.png`, and the authoritative per-page specs are in `All44Prompts.md` (pages **27–44**; pages 1–26 are Part 1). The shared visual system in `All44Prompts.md` matches `docs/DESIGN_SYSTEM.md`. Build Part 2 by replacing each `PendingPartTwoPage` with a real implementation against these designs, reusing the existing admin shell, workspace tabs, repository contracts, status/permission systems, forms, tables and tokens (do not rewrite them). Part 2 pages → specs: Contact/Location Editor (27), Opening Hours (28), Page Builder (29), Menu Manager (30), Category Editor (31), Product Editor (32), Media Library (33), Customer Actions (34), QR Management (35), NFC Management (36), Campaigns List (37), Campaign Editor (38), Analytics (39), Website CMS (40), Leads/Enquiries (41), Global SEO & Settings (42), Team Management (43), Audit/Activity Log (44).


Part 2 adds feature routes/components on top of the Part 1 foundation. Do **not** rewrite: admin shell, restaurant context header, workspace tabs, repository contracts, status system, permission system, forms, tables, preview components, or design tokens.

Unimplemented admin routes currently render the reusable `PendingPartTwoPage` (admin shell + breadcrumb + title + "Design will be added in Part 2" + back action).

| Future page | Route | Parent layout | Reusable components ready | Repos needed | Permissions | Placeholder | Remaining design |
|---|---|---|---|---|---|---|---|
| Contact & Location Editor | `/admin/restaurants/[id]/contact` | admin + workspace | forms, StickyActionBar, PreviewPanel | restaurants | restaurant.edit | yes (link) | full editor UI |
| Opening Hours Editor | `/admin/restaurants/[id]/hours` | admin + workspace | forms | restaurants | restaurant.edit | yes | full editor |
| Restaurant Page Builder | `/admin/restaurants/[id]/page` | admin + workspace | PreviewPanel | restaurants, media | restaurant.edit | yes | builder |
| Menu Manager / Category / Product | `/admin/menus`, `/admin/restaurants/[id]/menu` | admin | AdminDataTable, forms | menus | menu.edit/publish | yes | full |
| Media Library | `/admin/media` | admin | image placeholders | media | branding.view | yes | full |
| Customer Actions Editor | `/admin/restaurants/[id]/actions` | admin + workspace | forms | menus | restaurant.edit | yes | full |
| QR Management | `/admin/qr-codes` | admin | AdminDataTable, StatusBadge | qr | qr.manage | yes | full |
| NFC Management / Assignment | `/admin/nfc-products` | admin | AdminDataTable, StatusBadge | nfc | nfc.manage | yes | full |
| Campaigns List / Editor / Reward verify | `/admin/campaigns` | admin | AdminDataTable, forms | campaigns | campaign.edit | yes | full |
| Full Analytics | `/admin/analytics` | admin | charts | analytics | analytics.view | yes | full |
| Website CMS | `/admin/website` | admin | forms | (website) | website.edit | yes | full |
| Enquiries Management | `/admin/enquiries` | admin | AdminDataTable | enquiries | enquiry.edit | yes | full |
| Global Settings | `/admin/settings` | admin | forms | — | admin.manage | yes | full |
| Team Access | `/admin/team` | admin | AdminDataTable | auth | admin.manage | yes | full |
| Activity Log | `/admin/activity` | admin | ActivityFeed | activity | activity.view | yes | full |

## Data contracts already prepared

All repositories above already have contracts in `src/domain/repositories` and mock implementations. Part 2 wires UIs to them and adds write methods (e.g. menu/category/product CRUD, campaign CRUD) following the same pattern + Zod schemas.
