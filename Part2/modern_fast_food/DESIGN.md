---
name: Modern Fast Food
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5c403a'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#906f69'
  outline-variant: '#e5beb6'
  surface-tint: '#b91e00'
  primary: '#b51d00'
  on-primary: '#ffffff'
  primary-container: '#db3516'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a5'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#765700'
  on-tertiary: '#ffffff'
  tertiary-container: '#946f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8e1500'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdf9e'
  tertiary-fixed-dim: '#f7be2b'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5b4300'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  canvas: '#FFFFFF'
  surface-warm: '#FFF1EB'
  text-primary: '#111827'
  text-secondary: '#667085'
  border: '#E5E7EB'
  success: '#16A34A'
  danger: '#DC2626'
  primary-dark: '#C9341A'
typography:
  display:
    fontFamily: Manrope
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  h1:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 35px
    letterSpacing: -0.01em
  h1-mobile:
    fontFamily: Manrope
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 19px
    fontWeight: '700'
    lineHeight: 25px
    letterSpacing: 0em
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  small:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 16px
  margin-mobile: 20px
  container-max-width: 1280px
  mobile-shell-max-width: 640px
---

# Modern Fast Food Design System

# Product Context

This design system is for an **admin-managed QR/NFC digital restaurant platform**.

- Restaurant owners do **not** register or manage accounts.
- The platform owner/client creates and maintains every restaurant profile.
- Customers open a restaurant's mobile page by scanning a QR code or tapping an NFC card, tag, sticker, or table stand.
- The same restaurant URL powers both QR and NFC entry.
- The platform will be developed in **Next.js**.
- The client must manage restaurant data, menus, links, public website content, SEO fields, QR/NFC settings, and publishing through a private CMS/admin panel without editing code.

## Product Surfaces

1. **Customer-facing restaurant experience**
   - Restaurant landing page
   - Menu categories
   - Menu/product list
   - Product detail
   - Contact, location, save-contact, and social links
   - Promotions or “Scan & Win”

2. **Public platform website**
   - Homepage
   - How it works
   - Features
   - QR/NFC products
   - Template gallery
   - Pricing/contact

3. **Private client CMS**
   - Login
   - Dashboard
   - Restaurants list
   - Add/edit restaurant
   - Menu manager
   - Media library
   - Theme/customization controls
   - Action-link configuration
   - QR/NFC management
   - Preview/publish
   - Website content and SEO settings

## Primary Customer Actions

The customer-facing restaurant page must prioritize these four actions:

1. **Call Order** — launches a phone call
2. **Pick Your Meal** — opens the digital menu
3. **Online Order with Pay** — opens a configured internal or external order URL
4. **Visit Us** — opens map, contact details, or save-contact options

These actions should be visible near the top of the mobile page and use large touch targets.

## Shared UX Principles

- Mobile-first; design customer pages around a 390 × 844 px viewport.
- Minimum touch target: 44 × 44 px.
- Body text should normally be at least 16 px on customer pages.
- Use clear text labels with icons; do not rely on icons alone.
- Keep the four primary actions easy to understand within three seconds.
- Use strong contrast and visible keyboard/focus states.
- Avoid unnecessary carousels, hidden navigation, dense forms, and decorative clutter.
- Use realistic restaurant content and food imagery placeholders.
- Public pages must feel fast, trustworthy, and easy to scan.
- Admin pages should favor clarity, consistency, bulk management, preview, draft, and publish states.
- Never add restaurant-owner signup, restaurant-owner login, or restaurant-owner billing screens.

# Design Intent

A bold, energetic, conversion-focused restaurant style for pizza, burgers, fried chicken, street food, and casual dining. It should feel fast and modern without looking cheap or visually chaotic.

# Brand Personality

Direct, energetic, appetizing, youthful, confident, easy, action-oriented.

# Color Tokens

| Token | Value | Use |
|---|---:|---|
| `canvas` | `#FFFFFF` | Main background |
| `surface` | `#F8FAFC` | Cards and grouped sections |
| `surface-warm` | `#FFF1EB` | Promotional background |
| `primary` | `#F04424` | Primary actions |
| `primary-dark` | `#C9341A` | Hover/pressed |
| `secondary` | `#111827` | Headings, nav, footer |
| `accent` | `#FFC533` | Promotions and small highlights |
| `text-primary` | `#111827` | Main text |
| `text-secondary` | `#667085` | Supporting text |
| `border` | `#E5E7EB` | Borders |
| `success` | `#16A34A` | Open status |
| `danger` | `#DC2626` | Closed/error state |

Use yellow only as an accent. Do not place long white text on yellow.

# Typography

- Headings: **Manrope**, weights 700–800
- Body/UI: **Inter**, weights 400–600
- Display: 38/42, weight 800
- H1: 30/35, weight 800
- H2: 24/30, weight 700
- H3: 19/25, weight 700
- Body: 16/24
- Small: 14/20
- Button: 15/20, weight 700

Use tight heading tracking around -1% to -2%. Do not use condensed novelty fonts.

# Spacing

Use:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

Keep top actions compact and above the fold. Use 12–16 px gaps in grids.

# Shape

- Buttons: 12 px
- Cards: 16 px
- Promotional panels: 20 px
- Image corners: 14 px
- Pills: 999 px

# Elevation

- Crisp 1 px borders
- Subtle shadow for action cards and sticky nav
- One elevation level only; avoid floating every card

# Component Styling

## Four Primary Actions
Use a bold 2 × 2 grid with strong filled and outlined variants. “Call Order” and “Pick Your Meal” should visually lead. Use large icons and short labels.

## Category Cards
Use strong food photos, dark gradient only at the bottom for label readability, and clear arrows or tap cues.

## Product Cards
Image-led, price clearly visible, compact description, strong “View Menu” or “Details” action. Avoid turning every card into a checkout widget.

## Promotion
Use orange/red with yellow details. Promotion copy should be short and high-impact.

## Bottom Navigation
White surface, dark labels, red-orange active state. Make the call action slightly more prominent while preserving balance.

## Admin CMS Adaptation
Use a dark sidebar or dark top navigation, white work surfaces, orange primary buttons, and yellow only for warnings/promotional content. Keep tables calm and businesslike.

# Iconography

- Bold rounded line or simple filled icons
- Consistent 2 px stroke
- High recognition
- No cartoon mascots unless the final brand specifically requires one

# Image Direction

- Close-up food photography
- Strong color and contrast
- Visible texture, cheese, crust, grill, sauces
- Clean backgrounds
- Avoid overly dark images and cluttered table scenes

# Motion

- Quick 150–200 ms transitions
- Small card lift on desktop hover
- Press feedback on mobile
- Section transitions should feel fast, not cinematic

# Do Not Use

- More than one bright accent color beyond the defined palette
- Random gradients
- Excessive badges
- Oversized shadows
- Comic fonts
- Constant animation
- Tiny action buttons
- Visual hierarchy where every element shouts equally

# Shared Component Requirements

## Customer Experience Components

- Restaurant identity header
- Cover image and logo
- Open/closed status badge
- Cuisine and location metadata
- Language selector
- Four-action 2 × 2 grid
- Category chips or category cards
- Menu item cards
- Price treatment
- Promotion/campaign banner
- Opening-hours block
- Address and map action
- Phone, WhatsApp, Instagram, and save-contact actions
- Sticky mobile bottom navigation: Home, Menu, Call, Location
- Loading, empty, unavailable, and closed states

## Public Website Components

- Responsive navigation
- Hero section with QR/NFC demonstration
- Trust indicators
- Feature cards
- How-it-works steps
- Physical product showcase
- Template previews
- Pricing/package cards
- FAQ accordion
- Lead/contact CTA
- Footer

## Admin CMS Components

- Desktop sidebar and mobile navigation
- Page header and breadcrumbs
- Search, filters, status chips, and bulk actions
- Data table and card-list alternatives
- Form sections with autosave feedback
- Media uploader
- Menu/category drag-and-drop
- Color/theme controls
- Phone-sized live preview
- QR download panel
- NFC assignment/status panel
- Draft, published, archived, and disabled states
- Confirmation dialogs and non-destructive warnings
- Toasts, inline validation, and empty states

# Accessibility and Interaction

- WCAG-minded contrast for text and controls.
- Visible hover, pressed, selected, disabled, loading, error, and focus states.
- Never encode status by color alone.
- Avoid text over complex images unless a strong overlay or solid text surface is provided.
- Respect reduced-motion preferences.
- Motion should be subtle: 150–250 ms for UI transitions.
- Use skeletons for menu and image loading.
- Do not use auto-playing video or motion that blocks interaction.

# Responsive Behavior

## Customer Pages
- 360–430 px: primary target
- 431–767 px: wider mobile
- 768 px and above: centered content shell, maximum width around 520–640 px unless a split layout adds real value

## Marketing Website
- Mobile-first stacking
- Tablet: 2-column cards where appropriate
- Desktop: 12-column grid, maximum content width 1200–1280 px

## Admin CMS
- Desktop-first working area
- Tablet-friendly
- Mobile supports urgent edits, preview, status changes, and contact updates
- Dense menu editing and advanced configuration may use desktop-optimized layouts
