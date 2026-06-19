# Design System

Tokens live in `src/app/globals.css` (`@theme`). Names mirror the Stitch design exports so designs port with minimal renaming.

## Color (canonical — master spec §9)

| Token | Hex |
|---|---|
| `primary` | #F04424 |
| `primary-dark` | #C9341A |
| `navy` / `text-primary` / `on-surface` | #111827 |
| `navy-deep` | #0B1220 |
| `canvas` | #FFFFFF |
| `surface` | #F8FAFC |
| `surface-muted` | #F1F5F9 |
| `surface-warm` | #FFF1EB |
| `text-secondary` | #667085 |
| `text-tertiary` | #98A2B3 |
| `border` | #E5E7EB |
| `input-border` | #D0D5DD |
| `accent` | #FFC533 |
| `success` | #16A34A · `warning` #D97706 · `danger` #DC2626 · `info` #2563EB |

Use yellow as accent only; never long white text on yellow.

## Typography

Manrope (headings/display 700–800), Inter (body/UI 400–600). Sizes: `text-display` 38/42·800, `text-h1` 30/35·800, `text-h2` 24/30·700, `text-h3` 19/25·700, `text-body` 16/24, `text-small` 14/20, `text-button` 15/20·700. Tight heading tracking (−1% to −2%).

## Shape

Buttons/inputs 10–12px (`rounded-[12px]`), small cards 14–16px, large sections 16–20px, preview panels 20px, pills full. Crisp 1px borders. One elevation level (`shadow-card`, `shadow-lift`).

## Personality

- **Public**: bold, appetizing, energetic, mobile-first. 2×2 primary action grid; strong food imagery; red-orange CTAs; dark navy text; yellow accents.
- **Admin**: calm, structured, operational. Dark sidebar, white work surfaces, orange primary buttons, yellow for warnings only. Calm tables.

## Components

UI primitives in `src/components/ui` (Button, Badge, Card, Input, …). Shared in `src/components/shared` (Container, SectionHeading, StatusBadge, Icon, states, Skeleton, PermissionGate). Don't ship default un-customized shadcn styling.

## Motion

150–200ms transitions; press feedback; respect reduced motion. No parallax, bouncing CTAs, flashing alerts, spinning reward wheels, auto-playing carousels, or admin confetti.

## Accessibility

Visible focus, semantic landmarks, correct heading order, visible labels, text validation errors, accessible dialogs/menus/tables, SR labels for icon-only actions, 44×44 targets, status never color-only, RTL ready.
