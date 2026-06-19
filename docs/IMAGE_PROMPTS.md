# YourPlatform — Gemini Image Generation Prompt Library

Detailed prompts to generate **every image** the project uses. Designed for **Gemini (Imagen 3 / Gemini 2.5 Flash Image "Nano Banana")** or any text-to-image model. Each entry gives a **target filename + path**, **aspect ratio / size**, and a **ready-to-paste prompt**.

> The app currently ships neutral SVG placeholders in `public/placeholders/`. Generated images should replace/augment those and live under `public/images/...` (then update the `src` paths or the placeholder components). Keep filenames lowercase-kebab. Prefer **WebP/PNG**; export at 2× the display size for retina.

---

## 0. How to use

1. **Always prepend the Global Style Block** (Section 1) to each prompt, then add the **per-image prompt**.
2. **Always append the Global Negative Prompt** (Section 1) if your tool supports negatives; otherwise the style block already discourages those traits.
3. Set the **aspect ratio** noted per image (Imagen supports `1:1`, `3:4`, `4:3`, `16:9`, `9:16`).
4. Generate 3–4 variants, pick the cleanest, and **keep lighting/background consistent across a set** (e.g. all 5 menu items, all 8 QR/NFC products) by reusing the same style block verbatim.
5. Food must look **real and appetizing**, never CGI/cartoon. People (if any) should be incidental and non-identifiable.

### Brand palette (reference for the model)
`Primary red-orange #F04424` · `Primary dark #C9341A` · `Navy #111827` · `Warm cream #FFF1EB` · `Light surface #F8FAFC` · `Yellow accent #FFC533`. Fonts in mockups: Manrope (headings), Inter (body) — but **do not render long fake text**; use short legible labels only.

---

## 1. Global Style Block (prepend to every prompt)

```
Professional commercial photography for a modern fast-food digital restaurant
brand called "Modern Fast Food". Bold, appetizing, energetic and trustworthy.
High dynamic range, crisp focus, natural soft studio lighting with gentle
shadows, vibrant but realistic colors, high contrast. Clean uncluttered
background. Color story built around red-orange (#F04424), deep navy (#111827),
warm cream (#FFF1EB) and a small amount of yellow accent (#FFC533). Premium,
magazine-quality, photorealistic. No text overlays unless explicitly requested.
```

### Global Negative Prompt (append everywhere)
```
Negative: cartoon, illustration, 3d render, CGI, plastic look, low resolution,
blurry, oversaturated, garish neon, cluttered background, messy table scene,
watermark, signature, logo text, lorem ipsum, distorted text, gibberish text,
extra fingers, deformed hands, stock-photo cheesiness, harsh flash, motion blur.
```

---

## 2. Brand & platform assets (YourPlatform)

> "YourPlatform" is a temporary brand name. Logo = a simple QR/NFC-inspired mark.

| File | Aspect | Use |
|---|---|---|
| `public/images/brand/logo-mark.png` | 1:1 (512²) | App/header mark |
| `public/images/brand/favicon.png` | 1:1 (512²) | Favicon source |
| `public/images/brand/og-default.png` | 16:9 (1200×630) | Default Open Graph/social card |

**Logo mark** (`logo-mark.png`, 1:1):
```
A minimal modern app icon / logo mark for a QR & NFC restaurant technology
platform. A rounded-square badge with a soft red-orange (#F04424) to deep
red (#C9341A) gradient, containing a simplified white QR-code-meets-NFC-wave
glyph (a small stylized QR square fused with a contactless tap wave). Flat
vector style, crisp edges, centered, generous padding, subtle depth. Solid
light background. No text.
```

**Favicon** (`favicon.png`, 1:1): same as logo mark but **simplified for tiny sizes** — bolder strokes, no fine detail:
```
A tiny-size-optimized version of the logo mark: a red-orange rounded square
with a single bold white QR/contactless glyph, very high contrast, no gradients
finer than two stops, legible at 32x32 pixels. No text.
```

**Open Graph default** (`og-default.png`, 16:9):
```
A clean marketing social-share banner for a managed QR/NFC restaurant platform.
Left: a floating smartphone showing a bright, appetizing restaurant menu app
screen (red-orange order button, food photo). Right: a small physical QR table
tent and a contactless NFC table stand on a warm cream surface. Deep navy and
warm cream background with a soft red-orange glow. Lots of negative space at the
top for an overlaid headline (leave it empty). Premium, modern, photorealistic.
```

---

## 3. Marketing website imagery

### 3.1 Hero phone-preview screens (homepage hero device stack)
Replaces `public/placeholders/restaurant.svg`, `food.svg`, `cover.svg` in the hero stack. Render **as phone screen content** (portrait UI), each on a transparent or light background, **9:16**.

| File | Aspect | Screen shown |
|---|---|---|
| `public/images/marketing/phone-landing.png` | 9:16 | Restaurant landing page |
| `public/images/marketing/phone-menu.png` | 9:16 | Digital menu |
| `public/images/marketing/phone-visit.png` | 9:16 | Visit / directions |

**phone-landing.png** (9:16):
```
A photorealistic mockup of a modern fast-food restaurant landing page on a
smartphone screen. Top: an appetizing burger/pizza hero photo. Below: a bold
restaurant name, an "Open now" green status pill, and a 2x2 grid of large
rounded action buttons — one solid red-orange "Call Order" with a phone icon,
one dark navy "Pick Your Meal" with a menu icon, plus two light cards. Clean
white/light-gray UI, Inter-style sans-serif, generous spacing. Only short
2-3 word button labels, no paragraphs. Crisp UI, high contrast.
```

**phone-menu.png** (9:16):
```
A photorealistic smartphone mockup of a digital restaurant menu screen. A
search bar, horizontal category chips ("Pizzas", "Burgers", "Sides"), and a
vertical list of menu item cards each with a small appetizing food photo, a
short name, and a clear price in dark navy. Red-orange accents. Clean light UI,
realistic, high contrast. Only short labels, no long text.
```

**phone-visit.png** (9:16):
```
A photorealistic smartphone mockup of a restaurant "Visit us" screen: a small
map snippet at the top, an address line, opening hours rows, and large rounded
"Call", "WhatsApp" and "Directions" action buttons with icons in red-orange and
navy. Clean light UI, short labels only, realistic.
```

### 3.2 Section / feature imagery (optional, marketing pages)
| File | Aspect | Use |
|---|---|---|
| `public/images/marketing/managed-service.jpg` | 4:3 | "How it works" / About supporting image |

```
A warm, professional behind-the-scenes photo evoking a fully managed service:
a clean modern workspace with a laptop showing a restaurant menu dashboard and,
beside it, a printed QR table tent and an NFC card on a warm cream desk. Soft
daylight, shallow depth of field, red-orange and navy accents. No readable
text on screens (blurred UI). Photorealistic, premium.
```

---

## 4. QR & NFC physical products (8)

> Page `/qr-nfc-products`. Shoot as a **consistent product set**: same lighting, same warm-cream seamless background, same camera angle. All **1:1** (square), product centered, soft shadow. Replaces `public/placeholders/qr.svg` / `nfc.svg`.

Folder: `public/images/products/`

The QR pattern and NFC wave should look **plausible but generic** (do NOT encode a real URL). Keep any printed label to a short word like "SCAN" or "TAP".

| File | Product |
|---|---|
| `qr-table-tent.png` | QR table tent |
| `nfc-table-stand.png` | NFC table stand |
| `nfc-card.png` | NFC card |
| `qr-sticker.png` | QR sticker |
| `nfc-sticker.png` | NFC sticker |
| `window-sticker.png` | Window sticker |
| `counter-display.png` | Counter display |
| `printed-card.png` | Printed card |

**Shared product prompt template** — replace `<PRODUCT>`:
```
A clean studio product shot of <PRODUCT> for a restaurant, branded in red-orange
(#F04424) and deep navy with a small yellow accent. A neat, generic QR code and/
or a contactless NFC tap-wave symbol printed on it (decorative, not a real code).
Centered on a smooth warm-cream (#FFF1EB) seamless background, soft realistic
shadow beneath, even soft studio lighting, slight top-down 3/4 angle. Premium,
photorealistic, e-commerce quality. Only a short label such as "SCAN" or "TAP",
no paragraphs.
```

Per-product `<PRODUCT>` values:
- **qr-table-tent** → `a folded A-frame acrylic table tent card standing upright with a QR code and a short "Scan to order" label`
- **nfc-table-stand** → `a small premium NFC table stand/pedestal with a contactless tap symbol and a "Tap to order" label`
- **nfc-card** → `a credit-card-sized matte NFC card with a contactless tap symbol`
- **qr-sticker** → `a round die-cut QR code sticker peeling slightly at one corner`
- **nfc-sticker** → `a slim circular NFC sticker with a tap-wave symbol`
- **window-sticker** → `a transparent window cling sticker with a QR code, shown on a glass surface`
- **counter-display** → `a small countertop display stand combining a QR code and an NFC tap zone`
- **printed-card** → `a stack of premium printed business-card-sized cards with a QR code on top`

---

## 5. Restaurant template gallery (5 visual directions)

> Page `/templates`. Each card needs a representative **hero food/scene** photo for that direction. **4:3**. Folder `public/images/templates/`.

| File | Direction | Prompt addition |
|---|---|---|
| `modern-fast-food.jpg` | Modern Fast Food | `a bold close-up of a gourmet cheeseburger and pizza with melting cheese, red-orange energetic mood, dark moody backdrop with a pop of warmth` |
| `warm-mediterranean.jpg` | Warm Mediterranean | `a charcoal-grilled mixed kebab and mezze spread on rustic stoneware, warm earthy terracotta tones, sunlit` |
| `premium-dining.jpg` | Premium Dining | `an elegant plated seafood fine-dining dish, minimalist, dark refined backdrop, soft moody spotlight, luxurious` |
| `fresh-healthy.jpg` | Fresh & Healthy | `a vibrant fresh grain-and-veg bowl with avocado and a green smoothie, bright airy white background, clean and crisp` |
| `cafe-bakery.jpg` | Café & Bakery | `artisan pastries, a flat-white coffee with latte art and fresh croissants on a marble café table, cozy warm light` |

**Template prompt template** — replace `<SCENE>`:
```
A high-end editorial food photograph: <SCENE>. Appetizing, photorealistic,
shallow depth of field, professional food styling, clean composition with room
at one side. No text.
```

---

## 6. Demo restaurant covers & logos (5 restaurants)

> Used on restaurant public pages (`cover` 16:9 / mobile cover) and admin. Folder `public/images/restaurants/<slug>/`. Each restaurant: **cover** (16:9, also works cropped to the 640×360 hero) + **logo** (1:1).

Pizza House is the primary demo (Modern Fast Food). The others mirror their template direction.

| Restaurant (slug) | Direction | Cover `<SCENE>` | Logo idea |
|---|---|---|---|
| Pizza House (`pizza-house`) | Modern Fast Food | `a dramatic close-up of a wood-fired pepperoni pizza with bubbling mozzarella, dark navy background with warm rim light` | bold circular badge, a stylized pizza slice + flame, red-orange & navy |
| Anatolia Grill (`anatolia-grill`) | Warm Mediterranean | `a sizzling charcoal grill with skewered kebabs and flames, warm terracotta tones` | a grill/ember emblem, warm earthy palette |
| Green Bowl (`green-bowl`) | Fresh & Healthy | `a fresh colorful salad bowl and cold-pressed juices on a bright white surface` | a leaf-in-a-bowl mark, fresh green & white |
| Café Mimoza (`cafe-mimoza`) | Café & Bakery | `a cozy café flatlay with coffee, croissants and pastries on marble` | a coffee cup + mimosa flower monogram, warm cream |
| Bosphorus Kitchen (`bosphorus-kitchen`) | Premium Dining | `an elegant plated seafood dish with a blurred waterfront view, refined dark tones` | an elegant wave/anchor monogram, navy & gold |

**Cover prompt template** (16:9):
```
A premium restaurant hero cover photo: <SCENE>. Photorealistic, appetizing,
cinematic lighting, space at the bottom-left kept darker/simpler for an overlaid
restaurant name (leave it empty). High contrast, magazine quality. No text.
```

**Logo prompt template** (1:1):
```
A clean modern restaurant logo emblem: <LOGO IDEA>. Flat vector style, simple,
high contrast, works on light and dark backgrounds, centered with padding,
no text or only a tiny monogram letter. Professional brand mark.
```

---

## 7. Pizza House menu — categories (4) + products (5)

> The flagship demo. Shoot the **5 product photos as one consistent set** (same angle, same warm/dark backdrop, same lighting) so the menu grid looks cohesive. Products **1:1** (square) for cards and detail; categories **4:3**. Folder `public/images/restaurants/pizza-house/`.

### 7.1 Category images (4) — `4:3`
| File | Category | `<SCENE>` |
|---|---|---|
| `category-pizzas.jpg` | Pizzas | `an overhead spread of several whole pizzas with varied toppings` |
| `category-burgers.jpg` | Burgers | `a row of stacked gourmet burgers with melting cheese` |
| `category-pasta.jpg` | Pasta | `creamy and tomato pasta dishes in white bowls, herbs on top` |
| `category-sides.jpg` | Sides & Drinks | `loaded fries, onion rings and soft drinks together` |

```
A vibrant fast-food category banner photo: <SCENE>. Appetizing, photorealistic,
warm inviting light, clean dark-to-warm background, high contrast. No text.
```

### 7.2 Product photos (5) — `1:1`
Use this shared template (keep identical lighting/background for all five):
```
A close-up hero food photograph of <DISH> for a fast-food menu. Photorealistic,
extremely appetizing, visible texture (melted cheese / grill marks / fresh
herbs / glossy sauce), professional food styling, centered on a dark moody
navy surface with a warm rim light and a hint of red-orange glow, shallow depth
of field, top 3/4 angle. Magazine quality. No text, no packaging branding.
```

| File | `<DISH>` |
|---|---|
| `product-margherita-pizza.jpg` | `a classic Margherita pizza with San Marzano tomato, fresh mozzarella and basil, drizzle of olive oil, slightly charred crust` |
| `product-pepperoni-pizza.jpg` | `a double-pepperoni pizza with bubbling mozzarella and crispy cupped pepperoni on a spicy tomato base` |
| `product-bbq-chicken-burger.jpg` | `a BBQ chicken burger with grilled chicken, melted cheddar, crispy onions, fresh lettuce and smoky BBQ sauce in a glossy brioche bun` |
| `product-creamy-chicken-pasta.jpg` | `creamy penne pasta with grilled chicken, parmesan and fresh herbs in a white bowl` |
| `product-loaded-fries.jpg` | `loaded fries topped with melted cheese sauce and chopped herbs in a paper tray` |

> These five map to the seed slugs `margherita-pizza`, `pepperoni-pizza`, `bbq-chicken-burger`, `creamy-chicken-pasta`, `loaded-fries` in `src/data/seed/index.ts`.

---

## 8. Campaign reward (Scan & Win)

> Campaign `/restaurants/pizza-house/campaigns/scan-and-win`, reward = free garlic bread. **1:1**. `public/images/campaigns/garlic-bread.jpg`.
```
A close-up appetizing photo of fresh garlic bread sticks with melted butter,
herbs and a small dipping sauce, on a dark moody navy surface with warm rim
light and a hint of red-orange and yellow festive glow. Photorealistic, premium,
celebratory but tasteful (no casino imagery). No text.
```

---

## 9. Avatars & misc

| File | Aspect | Prompt |
|---|---|---|
| `public/images/misc/avatar-default.png` | 1:1 | `A simple, friendly default user avatar: a flat geometric silhouette of a head and shoulders on a soft red-orange to cream gradient circle. Minimal, modern, no facial detail, no text.` |
| `public/images/misc/restaurant-placeholder.jpg` | 4:3 | `A neutral, tasteful generic restaurant interior — clean modern casual dining space, warm light, slightly out of focus, no people, no readable signage. Photorealistic.` |

---

## 10. Replacement map (generated file → where it is used)

| Generated image | Replaces / wire into |
|---|---|
| `brand/logo-mark.png`, `favicon.png` | `src/app/favicon.ico` + admin/login + header logo |
| `brand/og-default.png` | `metadata.openGraph.images` in `src/app/layout.tsx` |
| `marketing/phone-*.png` | homepage hero stack (`src/components/marketing/phone-preview.tsx` / `page.tsx` `phonePreviews`) |
| `products/*.png` | `/qr-nfc-products` (`ProductCard` images) — replace `/placeholders/{qr,nfc}.svg` |
| `templates/*.jpg` | `/templates` (`TemplateCard image`) |
| `restaurants/<slug>/cover.jpg`, `logo.png` | restaurant hero (`RestaurantHero` `cover.svg`) + `Branding.coverImage/logo` |
| `restaurants/pizza-house/category-*.jpg` | `MenuCategory.image` |
| `restaurants/pizza-house/product-*.jpg` | `MenuProduct.image` (menu cards + product detail) |
| `campaigns/garlic-bread.jpg` | `CampaignReward` / campaign page |
| `misc/avatar-default.png` | admin avatars, `placeholders/avatar.svg` |

### After generating
1. Drop files into the paths above.
2. Update `MenuProduct.image` / `MenuCategory.image` / `Branding.*` values in `src/data/seed/index.ts` to the new paths (they're currently `null` or `/placeholders/*`).
3. For static UI imagery (hero, products, templates), swap the `src` in the relevant component.
4. Keep `next/image` `width`/`height` matching each asset's aspect ratio to avoid layout shift.
5. Add real remote domains to `next.config.ts` `images.remotePatterns` only if you host images off-domain (local `/public` needs no config).
```
```
