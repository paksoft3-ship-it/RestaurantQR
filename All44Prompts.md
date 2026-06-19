# YourPlatform — Complete Google Stitch Production Prompt Library

**Project:** Admin-managed multi-restaurant QR/NFC platform  
**Design direction:** Modern Fast Food  
**Prompt count:** 44  
**Primary sample restaurant:** Pizza House, Kadıköy, Istanbul  
**Placeholder platform brand:** YourPlatform  
**Document date:** 18 June 2026

> Consolidation note: This master file combines the complete 44-page prompt scope into one normalized, copy-ready Markdown document. Repeated platform, access, visual, security, and accessibility rules have been standardized so every prompt can be used independently without contradictory instructions.

---

# Shared Product Context

YourPlatform is an admin-managed QR/NFC restaurant platform.

- Platform staff create and manage every restaurant profile.
- Restaurant owners do not self-register, log in, edit menus, configure QR/NFC, manage campaigns, view analytics, manage billing, or create staff accounts.
- Customers open a restaurant page by scanning a QR code or tapping an NFC product.
- QR and NFC usually open the same approved public restaurant destination but are managed as separate operational records.
- Customer-facing restaurant actions are:
  1. Call Order
  2. Pick Your Meal
  3. Online Order with Pay
  4. Visit Us
- The platform does not include an internal cart, checkout, waiter call, kitchen display, POS, restaurant-owner portal, or restaurant subscription dashboard.
- Public pages are mobile-first, fast, appetizing, trustworthy, and accessible.
- Admin pages are desktop-first, calm, structured, permission-aware, auditable, and safe for operational use.

# Shared Visual System

Use the approved **Modern Fast Food** visual direction.

## Colors

- Primary: `#F04424`
- Primary dark: `#C9341A`
- Navy: `#111827`
- Deeper navy: `#0B1220`
- White: `#FFFFFF`
- Light background: `#F8FAFC`
- Warm surface: `#FFF1EB`
- Gray text: `#667085`
- Secondary gray: `#98A2B3`
- Border: `#E5E7EB`
- Yellow accent: `#FFC533`
- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`
- Information: `#2563EB`

Use yellow only as a restrained accent. Do not rely on color alone for status.

## Typography

- Headings: Manrope, 700–800
- Body and UI: Inter, 400–700
- Public mobile H1: 30–38 px
- Admin H1: 30–36 px
- Body: normally 16 px on customer pages
- Small metadata: 12–14 px
- Buttons: 14–16 px, 700

## Shape and Motion

- Buttons: 10–12 px radius
- Cards: 14–20 px radius
- Pills: fully rounded
- Crisp 1 px borders
- One restrained shadow level
- Motion: 150–200 ms
- Respect reduced motion
- Do not use excessive gradients, huge shadows, confetti, flashing statuses, decorative parallax, casino-style animation, or constant movement.

# Shared Accessibility Rules

- Minimum interactive target: 44 × 44 px.
- Use semantic headings, forms, tables, tabs, and dialogs.
- Provide visible keyboard focus.
- Do not rely on hover.
- Do not rely on color alone.
- Dialogs trap focus and restore it correctly.
- Toasts and dynamic status changes are announced.
- Charts require text summaries.
- Turkish, English, and Arabic must be supportable.
- Arabic interfaces and public content support RTL.
- URLs, emails, phone numbers, dates, codes, and technical identifiers remain readable left-to-right where appropriate.

# Shared Admin Security Rules

- Enforce authorization server-side.
- Hide unavailable actions in the UI.
- Preserve version history.
- Use draft, review, approval, publication/application, archive, and restore workflows.
- Do not permanently delete operational records.
- Do not expose secrets, tokens, passwords, keys, raw credentials, security payloads, or infrastructure internals.
- Record meaningful changes in the audit history.
- Use generic actor roles in mock data rather than invented employee names.
- Label all illustrative data clearly.

---


# Table of Contents

1. [Customer-Facing Restaurant Homepage](#page-01--customer-facing-restaurant-homepage)
2. [Customer-Facing Digital Menu](#page-02--customer-facing-digital-menu)
3. [Customer-Facing Product Detail](#page-03--customer-facing-product-detail)
4. [Restaurant Contact and Location](#page-04--restaurant-contact-and-location)
5. [Scan & Win Campaign Detail](#page-05--scan-win-campaign-detail)
6. [Public Platform Marketing Homepage](#page-06--public-platform-marketing-homepage)
7. [How It Works Page](#page-07--how-it-works-page)
8. [Platform Features Page](#page-08--platform-features-page)
9. [QR & NFC Products Page](#page-09--qr-nfc-products-page)
10. [Restaurant Examples Page](#page-10--restaurant-examples-page)
11. [Restaurant Templates Gallery](#page-11--restaurant-templates-gallery)
12. [Packages and Pricing Page](#page-12--packages-and-pricing-page)
13. [About YourPlatform Page](#page-13--about-yourplatform-page)
14. [Frequently Asked Questions Page](#page-14--frequently-asked-questions-page)
15. [Contact and Restaurant Enquiry Page](#page-15--contact-and-restaurant-enquiry-page)
16. [Privacy Policy Page](#page-16--privacy-policy-page)
17. [Cookie Policy and Consent Preferences](#page-17--cookie-policy-and-consent-preferences)
18. [Terms of Service Page](#page-18--terms-of-service-page)
19. [Campaign Terms and Reward Rules Page](#page-19--campaign-terms-and-reward-rules-page)
20. [Admin Login and Secure Access](#page-20--admin-login-and-secure-access)
21. [Admin Dashboard](#page-21--admin-dashboard)
22. [Restaurants Management List](#page-22--restaurants-management-list)
23. [Add Restaurant Page](#page-23--add-restaurant-page)
24. [Restaurant Detail Workspace](#page-24--restaurant-detail-workspace)
25. [Restaurant General Information Editor](#page-25--restaurant-general-information-editor)
26. [Restaurant Branding Editor](#page-26--restaurant-branding-editor)
27. [Restaurant Contact and Location Editor](#page-27--restaurant-contact-and-location-editor)
28. [Restaurant Opening Hours Editor](#page-28--restaurant-opening-hours-editor)
29. [Restaurant Page Builder](#page-29--restaurant-page-builder)
30. [Digital Menu Manager](#page-30--digital-menu-manager)
31. [Menu Category Editor](#page-31--menu-category-editor)
32. [Menu Product Editor](#page-32--menu-product-editor)
33. [Restaurant Media Library](#page-33--restaurant-media-library)
34. [Restaurant Customer Actions Editor](#page-34--restaurant-customer-actions-editor)
35. [Restaurant QR Code Management](#page-35--restaurant-qr-code-management)
36. [Restaurant NFC Product Management and Assignment](#page-36--restaurant-nfc-product-management-and-assignment)
37. [Restaurant Campaigns Management List](#page-37--restaurant-campaigns-management-list)
38. [Restaurant Campaign Editor](#page-38--restaurant-campaign-editor)
39. [Restaurant Analytics Dashboard](#page-39--restaurant-analytics-dashboard)
40. [Public Website CMS](#page-40--public-website-cms)
41. [Leads and Quote Requests Management](#page-41--leads-and-quote-requests-management)
42. [Global SEO and Platform Settings](#page-42--global-seo-and-platform-settings)
43. [Admin Users and Team Management](#page-43--admin-users-and-team-management)
44. [Audit Log and Activity History](#page-44--audit-log-and-activity-history)


---



# Page 01 — Customer-Facing Restaurant Homepage

## Reusable Google Stitch Production Prompt

Create Page 1 of the final production QR/NFC restaurant platform:

# Customer-Facing Restaurant Homepage
## Final Modern Fast Food Mobile Design

Generate only this page.

## Route

Use:

`/restaurants/pizza-house`

## Purpose

Give customers an immediate, appetizing overview of Pizza House and fast access to the four essential restaurant actions after a QR scan or NFC tap.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design mobile-first around a 390 × 844 px viewport. On wider screens, center the public experience in an appropriate content shell.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Compact restaurant identity header with logo, Pizza House name, cuisine, Kadıköy location, language selector, open/closed status, and optional share action.
- High-impact cover image with readable overlay, clear status, short restaurant summary, and no obstructive text.
- Four-action 2 × 2 grid placed above the fold: Call Order, Pick Your Meal, Online Order with Pay, and Visit Us.
- Featured menu categories with image cards or chips.
- Featured menu products with image, name, short description, availability, and price where configured.
- Scan & Win promotional banner with campaign status and clear terms link.
- Opening-hours summary, address, map action, phone, WhatsApp, Instagram, and save-contact actions.
- Sticky mobile bottom navigation: Home, Menu, Call, Location.
- Footer with platform attribution, privacy, cookies, terms, and language access.

## Primary and Secondary Actions

- Call restaurant
- Open digital menu
- Open approved external ordering destination
- Open directions/contact
- Open campaign
- Change language
- Share restaurant

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Open
- Closed
- Temporarily unavailable
- Menu unavailable
- External ordering unavailable
- Campaign ended
- Loading
- Offline or partial data
- 404

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Keep the first screen extremely clear. Customers must understand the restaurant identity and four primary actions within three seconds. Do not add cart, checkout, table ordering, waiter call, account login, or loyalty wallet.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Customer-Facing Restaurant Homepage — Final Modern Fast Food Mobile Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 02 — Customer-Facing Digital Menu

## Reusable Google Stitch Production Prompt

Create Page 2 of the final production QR/NFC restaurant platform:

# Customer-Facing Digital Menu
## Final Modern Fast Food Mobile Design

Generate only this page.

## Route

Use:

`/restaurants/pizza-house/menu`

## Purpose

Let customers browse Pizza House categories and products quickly after choosing Pick Your Meal.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design mobile-first around a 390 × 844 px viewport. On wider screens, center the public experience in an appropriate content shell.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Compact sticky restaurant header with back action, restaurant name, language selector, search, and open/closed status.
- Category navigation using horizontally scrollable chips or a sticky category rail.
- Optional featured category or promotion panel without blocking normal browsing.
- Product list grouped by category with image, name, short description, dietary labels, availability, and price.
- Search field with recent or popular terms only when implemented.
- Filtering for supported dietary or availability attributes without excessive complexity.
- Unavailable and seasonal products shown clearly without deceptive ordering controls.
- Sticky bottom navigation with Home, Menu active, Call, and Location.
- Footer or compact legal links where appropriate.

## Primary and Secondary Actions

- Search menu
- Jump to category
- Open product detail
- Call restaurant
- Open external ordering link where configured
- Change language

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Loading
- Empty category
- No search results
- Product unavailable
- Category hidden
- Restaurant closed
- Menu temporarily unavailable
- Partial translation

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

This is a browsing menu, not an internal ordering system. Do not add quantity controls, cart, checkout, table number, order submission, kitchen status, or payment fields.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Customer-Facing Digital Menu — Final Modern Fast Food Mobile Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 03 — Customer-Facing Product Detail

## Reusable Google Stitch Production Prompt

Create Page 3 of the final production QR/NFC restaurant platform:

# Customer-Facing Product Detail
## Final Modern Fast Food Mobile Design

Generate only this page.

## Route

Use:

`/restaurants/pizza-house/menu/[productSlug]`

## Purpose

Present one menu product with appetizing imagery, ingredients, price, availability, dietary information, and a safe next action.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design mobile-first around a 390 × 844 px viewport. On wider screens, center the public experience in an appropriate content shell.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Back navigation to the digital menu and compact restaurant identity.
- Large product image with accessible alt text and fallback image.
- Product name, category, short description, full description, price, and availability.
- Ingredient list and supported dietary labels.
- Allergen information with a clear caution that customers should confirm directly with the restaurant when necessary.
- Optional variants or sizes only when they are informational and configured.
- Related products from the same category.
- Primary action to call, return to menu, or open an approved external ordering destination.
- Share action and language selector.

## Primary and Secondary Actions

- Return to menu
- Call restaurant
- Open external ordering destination
- Share product
- View related product

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Available
- Temporarily unavailable
- Sold out
- Seasonal
- Archived shared link
- Missing image
- Translation incomplete
- Loading
- Not found

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add an internal cart, add-to-cart button, quantity stepper, internal checkout, customer reviews, fake ratings, or unsupported nutrition claims.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Customer-Facing Product Detail — Final Modern Fast Food Mobile Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 04 — Restaurant Contact and Location

## Reusable Google Stitch Production Prompt

Create Page 4 of the final production QR/NFC restaurant platform:

# Restaurant Contact and Location
## Final Modern Fast Food Mobile Design

Generate only this page.

## Route

Use:

`/restaurants/pizza-house/contact`

## Purpose

Give customers reliable contact details, opening hours, directions, save-contact support, and approved social links.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design mobile-first around a 390 × 844 px viewport. On wider screens, center the public experience in an appropriate content shell.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Restaurant identity and location title.
- Address card with map preview or static location visual.
- Primary actions: Get Directions, Call, WhatsApp where configured, Save Contact.
- Opening-hours table with today highlighted and special-hours notices.
- Phone, email, website, social links, and external ordering link where approved.
- Accessible location details including district, city, landmark, and optional parking or accessibility notes.
- vCard or contact-download explanation and action.
- Multiple-location selector when the restaurant has more than one public location.
- Compact legal and platform footer.

## Primary and Secondary Actions

- Open maps
- Call
- Open WhatsApp
- Save contact
- Open website
- Switch location
- Copy address

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Open now
- Closed now
- Special hours
- Temporary closure
- Map unavailable
- Contact source missing
- Location disabled
- Loading

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not claim that opening directions proves an in-person visit. Do not expose internal location notes, private contacts, staff details, or exact analytics identities.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Contact and Location — Final Modern Fast Food Mobile Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 05 — Scan & Win Campaign Detail

## Reusable Google Stitch Production Prompt

Create Page 5 of the final production QR/NFC restaurant platform:

# Scan & Win Campaign Detail
## Final Modern Fast Food Mobile Design

Generate only this page.

## Route

Use:

`/restaurants/pizza-house/campaigns/scan-and-win`

## Purpose

Present a controlled restaurant promotion with transparent eligibility, participation, reward, claim rules, dates, terms, and responsible consent behavior.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design mobile-first around a 390 × 844 px viewport. On wider screens, center the public experience in an appropriate content shell.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Restaurant-branded campaign header and campaign image.
- Campaign title, short explanation, current status, participation period, claim deadline, and eligible location.
- Reward summary with availability state and no guaranteed-win wording unless the approved rules guarantee it.
- Simple participation steps.
- Eligibility and entry-limit summary.
- Primary participation action shown only during the approved active state.
- Separate consent for participation and optional marketing.
- Terms summary with full campaign terms link.
- Claim instructions and support contact.
- Public states for coming soon, active, paused, participation ended, claim period open, completed, cancelled, reward unavailable, and location unavailable.

## Primary and Secondary Actions

- Join campaign
- Review terms
- Confirm consent
- Start participation
- View claim instructions
- Return to restaurant
- Contact support

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Coming soon
- Active
- Paused
- Participation ended
- Claim period open
- Claim period closed
- Reward exhausted
- Cancelled
- Completed
- Invalid or duplicate entry
- Loading

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Avoid casino visuals, prize wheels, slot-machine effects, false scarcity, paid entry, betting, hidden eligibility, preselected marketing consent, automatic winner manipulation, or misleading countdowns.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Scan & Win Campaign Detail — Final Modern Fast Food Mobile Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 06 — Public Platform Marketing Homepage

## Reusable Google Stitch Production Prompt

Create Page 6 of the final production QR/NFC restaurant platform:

# Public Platform Marketing Homepage
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/`

## Purpose

Explain YourPlatform clearly, build trust, demonstrate the QR/NFC restaurant experience, and convert restaurant enquiries.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Responsive public header with logo, navigation, language selector, Request a Quote CTA, and View Demo Restaurant secondary action.
- Hero: Turn Every QR Scan and NFC Tap Into a Modern Restaurant Experience.
- Supporting copy explaining that YourPlatform creates and manages restaurant pages, menus, QR codes, NFC products, links, and ongoing updates.
- Hero demonstration showing a phone restaurant experience beside QR and NFC touchpoints.
- Trust indicators and a clear statement that the platform team handles setup and management.
- Problem-versus-solution section.
- One Page. Four Essential Actions section featuring Call Order, Pick Your Meal, Online Order with Pay, and Visit Us.
- Customer journey demonstration.
- How It Works five-step summary.
- Platform feature grid.
- Physical QR/NFC product showcase.
- Restaurant style/template preview.
- Restaurant examples.
- Packages/pricing teaser without checkout.
- FAQ teaser.
- Strong enquiry CTA and complete footer.

## Primary and Secondary Actions

- Request a quote
- View demo restaurant
- Explore features
- Explore QR/NFC products
- View templates
- View pricing
- Open contact page

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Navigation open
- Form CTA loading
- Image fallback
- Language switch
- Partial CMS content

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add restaurant-owner signup, login, self-service onboarding, checkout, subscription payment, account dashboard, or claims that setup is automatic.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Public Platform Marketing Homepage — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 07 — How It Works Page

## Reusable Google Stitch Production Prompt

Create Page 7 of the final production QR/NFC restaurant platform:

# How It Works Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/how-it-works`

## Purpose

Explain the complete managed service from restaurant information collection through page creation, QR/NFC delivery, launch, and ongoing updates.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with concise managed-service explanation.
- Step 1: Restaurant information and project requirements.
- Step 2: Branded restaurant page and design setup.
- Step 3: Menu, contact, action-link, and language configuration.
- Step 4: QR code and NFC product connection.
- Step 5: Review, delivery, launch, and ongoing management.
- Customer journey example from scan/tap to action.
- Roles and responsibilities: restaurant provides approved information; YourPlatform staff build and manage the digital experience.
- Expected inputs such as logo, menu, contact details, locations, ordering link, and languages.
- Operational support and update process.
- FAQ and enquiry CTA.

## Primary and Secondary Actions

- Request a quote
- View demo
- Explore features
- Contact YourPlatform

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Accordion open
- CMS content missing
- Language fallback

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not imply that restaurant owners receive a self-service editor or that physical QR/NFC production, shipping, installation, or launch happens automatically.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**How It Works Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 08 — Platform Features Page

## Reusable Google Stitch Production Prompt

Create Page 8 of the final production QR/NFC restaurant platform:

# Platform Features Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/features`

## Purpose

Present every major YourPlatform capability in a structured, credible, conversion-focused format.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with feature overview and managed-service positioning.
- Branded mobile restaurant page.
- Digital menu with categories and products.
- Four essential customer actions.
- Contact, location, opening hours, social links, and save-contact.
- Multiple languages including RTL support.
- QR code management.
- NFC product assignment and lifecycle management.
- Campaign and Scan & Win capability.
- Public website and restaurant examples.
- Content updates and media management.
- Aggregated privacy-aware analytics.
- SEO-friendly public pages.
- Draft, review, publication, and operational support.
- Feature comparison grouped by Customer Experience, Physical Touchpoints, Content Operations, Campaigns, and Reporting.
- CTA to request information.

## Primary and Secondary Actions

- Request quote
- View demo
- Explore products
- View templates
- Contact

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Feature anchor selected
- FAQ expanded
- Language switch

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not advertise unsupported restaurant-owner accounts, internal ecommerce, POS, kitchen tools, guaranteed analytics accuracy, payment processing, or automatic NFC encoding.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Platform Features Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 09 — QR & NFC Products Page

## Reusable Google Stitch Production Prompt

Create Page 9 of the final production QR/NFC restaurant platform:

# QR & NFC Products Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/qr-nfc-products`

## Purpose

Show the physical QR and NFC product range, explain where each product is used, and clarify the managed setup and assignment process.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with physical product photography and mobile destination preview.
- Difference between QR scanning and NFC tapping.
- Product showcase: table stand, table card, sticker, window sticker, counter display, card, menu cover, campaign display, and approved custom products.
- Use-case sections for tables, counters, entrances, windows, printed menus, packaging, and campaigns.
- Tap or Scan customer journey.
- Branding and artwork options.
- Managed destination and fallback explanation.
- Production, testing, installation, replacement, and maintenance overview.
- QR/NFC alignment explanation.
- Compatibility and limitations section.
- FAQ and quote-request CTA.

## Primary and Secondary Actions

- Request product quote
- View restaurant demo
- Explore templates
- Contact team

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Product filter
- Image fallback
- FAQ expanded

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not claim universal browser NFC writing, automatic chip programming, contactless payment functionality, guaranteed device compatibility, automatic printing/shipping/installation, or public access to encoding tools.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**QR & NFC Products Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 10 — Restaurant Examples Page

## Reusable Google Stitch Production Prompt

Create Page 10 of the final production QR/NFC restaurant platform:

# Restaurant Examples Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/restaurant-examples`

## Purpose

Build trust through realistic restaurant examples that demonstrate how different businesses use the managed QR/NFC experience.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero explaining that examples demonstrate layouts and use cases.
- Filter by restaurant type, design style, language, features, and physical touchpoint.
- Example cards with restaurant image, cuisine, location, style, features, and View Demo action.
- Featured Pizza House example using Modern Fast Food.
- Examples for café, bakery, premium dining, fresh/healthy, and Mediterranean concepts.
- Before-and-after or challenge/solution summaries.
- Use-case highlights such as digital menu, QR tables, NFC stands, campaign, contact, and external ordering.
- Disclaimer that examples may be illustrative or demo content.
- CTA to request a similar project.

## Primary and Secondary Actions

- View demo restaurant
- Filter examples
- Open template
- Request quote

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Loading
- No results
- Illustrative demo
- External demo unavailable
- Language fallback

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not present fabricated businesses, results, reviews, revenue, scan counts, or conversion claims as real. Clearly label illustrative examples.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Examples Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 11 — Restaurant Templates Gallery

## Reusable Google Stitch Production Prompt

Create Page 11 of the final production QR/NFC restaurant platform:

# Restaurant Templates Gallery
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/templates`

## Purpose

Let prospective clients compare approved restaurant visual directions without turning the platform into a freeform self-service builder.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with template-system explanation.
- Template filters by restaurant type, tone, layout, color direction, and supported features.
- Template cards for Modern Fast Food, Warm Mediterranean Heritage, Premium Dining, Fresh and Healthy, Café and Bakery, plus future approved designs.
- Large preview for selected template across homepage, menu, product, contact, and campaign surfaces.
- Mobile, tablet, and desktop preview toggles.
- Feature compatibility and recommended business types.
- Color, typography, imagery, and component summaries.
- Request This Style CTA that opens an enquiry rather than creating an account.
- FAQ about customization and managed implementation.

## Primary and Secondary Actions

- Preview template
- Change preview device
- Open demo restaurant
- Request this style
- Contact

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Selected template
- No preview
- Image loading
- Language preview
- RTL preview

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add restaurant-owner editing, drag-and-drop page building, instant theme installation, checkout, or claims that every template supports every feature.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Templates Gallery — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 12 — Packages and Pricing Page

## Reusable Google Stitch Production Prompt

Create Page 12 of the final production QR/NFC restaurant platform:

# Packages and Pricing Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/pricing`

## Purpose

Explain service packages transparently and guide prospects to an enquiry without implementing subscription checkout.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with transparent managed-service positioning.
- Package cards with clear inclusions, exclusions, and Request a Quote actions.
- Possible package groups: Digital Menu, QR Experience, NFC Experience, Campaign Add-On, Full Restaurant Experience, Multi-Location Project.
- One-time setup versus ongoing-management explanation where applicable.
- Physical product quantity and custom-production note.
- Comparison table covering pages, menu, customer actions, languages, QR, NFC, campaigns, analytics, media, support, and updates.
- Custom project and multi-location section.
- Pricing assumptions, taxes, shipping, installation, and external-service exclusions only when confirmed.
- FAQ and contact CTA.

## Primary and Secondary Actions

- Request quote
- Compare packages
- Contact sales
- View demo

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Currency display
- Package highlighted
- Pricing unavailable
- CMS value missing

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add checkout, card payment, subscription purchase, fake discounts, invented prices, hidden fees, guaranteed delivery dates, or automatic account creation. Unconfirmed prices must be clearly marked as starting, illustrative, or quote-based.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Packages and Pricing Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 13 — About YourPlatform Page

## Reusable Google Stitch Production Prompt

Create Page 13 of the final production QR/NFC restaurant platform:

# About YourPlatform Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/about`

## Purpose

Explain the platform mission, managed operating model, values, process, and trust principles.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with mission statement.
- Why YourPlatform exists.
- Managed-service model and clear role boundaries.
- Core values: clarity, reliability, accessible design, responsible data use, operational support, and honest communication.
- How the platform connects public restaurant pages with physical QR/NFC products.
- Design and operations principles.
- Team or capability section using role groups rather than fabricated personal biographies.
- Milestones or statistics only when verified; otherwise use capability statements.
- Trust, privacy, security, and accessibility commitments.
- CTA to discuss a restaurant project.

## Primary and Secondary Actions

- Request information
- View how it works
- Explore features
- Contact

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- CMS content missing
- Language fallback

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not invent founders, awards, offices, years of experience, customer counts, press coverage, partnerships, or certifications.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**About YourPlatform Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 14 — Frequently Asked Questions Page

## Reusable Google Stitch Production Prompt

Create Page 14 of the final production QR/NFC restaurant platform:

# Frequently Asked Questions Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/faq`

## Purpose

Answer common questions about setup, menus, QR, NFC, updates, pricing, languages, campaigns, analytics, and support.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero and searchable FAQ introduction.
- Category navigation: General, Restaurant Setup, Digital Menu, QR Codes, NFC Products, Campaigns, Languages, Pricing, Updates, Analytics, Privacy, Support.
- Accessible accordion list with deep-linkable questions.
- Questions clarifying that platform staff manage content and restaurants do not receive self-service accounts.
- Questions about external ordering links and the absence of internal checkout.
- Questions about NFC compatibility and physical encoding limitations.
- Questions about timelines, physical products, shipping, installation, and ongoing updates without unsupported promises.
- Contact CTA for unanswered questions.

## Primary and Secondary Actions

- Search questions
- Open accordion
- Copy question link
- Contact team
- Request quote

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- No search results
- Loading
- Category selected
- Deep-linked question
- Content unavailable

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not use FAQ content as legal advice, guarantee hardware compatibility, invent service terms, or conceal important limitations.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Frequently Asked Questions Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 15 — Contact and Restaurant Enquiry Page

## Reusable Google Stitch Production Prompt

Create Page 15 of the final production QR/NFC restaurant platform:

# Contact and Restaurant Enquiry Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/contact`

## Purpose

Collect restaurant project enquiries with clear expectations, minimal necessary data, separate consent, and strong confirmation states.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Hero with contact purpose and response expectation wording that avoids unsupported guarantees.
- Restaurant enquiry form.
- Fields: enquiry type, restaurant/project name, contact name, work email, phone, preferred contact method, language, city/country, number of locations, requested services, project timeline, message.
- Service selectors for restaurant page, digital menu, QR, NFC, campaigns, website, media, languages, analytics, multi-location, and full package.
- Optional file-upload placeholder only through secure approved workflow.
- Separate privacy acknowledgment and optional marketing consent.
- Public contact information and business hours where approved.
- Alternative contact methods.
- FAQ or next-step summary.
- Success confirmation that does not create an account or promise approval.

## Primary and Secondary Actions

- Submit enquiry
- Call
- Email
- Open WhatsApp where approved
- Review privacy policy

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Submitting
- Success
- Validation error
- Spam review
- Server error
- Duplicate submission
- Offline

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not preselect marketing consent, request unnecessary sensitive data, create an owner account, start billing, promise a quote instantly, or expose internal routing.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Contact and Restaurant Enquiry Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 16 — Privacy Policy Page

## Reusable Google Stitch Production Prompt

Create Page 16 of the final production QR/NFC restaurant platform:

# Privacy Policy Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/privacy-policy`

## Purpose

Present the approved platform privacy policy in a readable, navigable, multilingual format.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Legal-document header with title, effective date, version, language selector, and print/download options where implemented.
- Sticky table of contents.
- Sections covering data controller information, categories of data, sources, purposes, legal bases, recipients, international transfers where applicable, retention, security, rights, cookies, analytics, restaurant enquiries, campaign participation, QR/NFC operational events, children or age restrictions where relevant, and contact details.
- Clear distinction between public website, restaurant pages, campaign participation, enquiries, and admin operations.
- Version history and previous-version access where appropriate.
- Related legal links.

## Primary and Secondary Actions

- Navigate section
- Change language
- Print
- Open cookie settings
- Contact privacy team

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Current version
- Archived version
- Translation unavailable
- Loading
- Print view

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Use approved legal content only. Do not fabricate legal bases, retention periods, company details, international-transfer mechanisms, certifications, or compliance claims.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Privacy Policy Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 17 — Cookie Policy and Consent Preferences

## Reusable Google Stitch Production Prompt

Create Page 17 of the final production QR/NFC restaurant platform:

# Cookie Policy and Consent Preferences
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/cookie-policy`

## Purpose

Explain cookie and similar-technology categories and provide a transparent preference-center experience.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Policy header with version, effective date, and language selector.
- Explanation of necessary, preferences, analytics, and marketing categories.
- Service table with provider, purpose, category, duration, first/third party, and policy link where confirmed.
- Consent preference center with necessary always clearly identified and optional categories disabled until chosen.
- Save preferences, reject optional, and accept selected controls.
- Withdrawal and change-preference explanation.
- Relationship to Privacy Policy.
- Regional and implementation limitations.

## Primary and Secondary Actions

- Accept selected
- Reject optional
- Save preferences
- Open service details
- Open privacy policy

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- No consent yet
- Saved
- Changed
- Consent unavailable
- Script blocked
- Error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not preselect optional categories, use dark patterns, block essential content unnecessarily, claim that every cookie is known before implementation, or allow consent bypass.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Cookie Policy and Consent Preferences — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 18 — Terms of Service Page

## Reusable Google Stitch Production Prompt

Create Page 18 of the final production QR/NFC restaurant platform:

# Terms of Service Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/terms-of-service`

## Purpose

Present the approved terms governing use of the public platform and managed restaurant services.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Document header with title, version, effective date, language selector, and print option.
- Sticky table of contents.
- Sections for service description, eligibility, acceptable use, restaurant information responsibilities, public content, external links, QR/NFC physical products, campaigns, intellectual property, fees or quote-based services where applicable, third-party services, availability, disclaimers, liability, suspension, termination, changes, governing law, and contact.
- Clear distinction between public users, prospective restaurant clients, campaign participants, and internal admins.
- Version history and related policies.

## Primary and Secondary Actions

- Navigate section
- Change language
- Print
- Open privacy policy
- Contact

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Current version
- Archived version
- Translation unavailable
- Loading

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Use approved legal wording only. Do not invent jurisdiction, liability limits, warranty language, company registration details, or binding commercial terms.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Terms of Service Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 19 — Campaign Terms and Reward Rules Page

## Reusable Google Stitch Production Prompt

Create Page 19 of the final production QR/NFC restaurant platform:

# Campaign Terms and Reward Rules Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/campaign-terms`

## Purpose

Provide platform-level campaign and reward-rule guidance with links to campaign-specific terms.



## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use realistic Pizza House content and food imagery placeholders. Label any example metrics or operational values as **Illustrative Data**.

## Required Content and Sections

- Document header and version information.
- Explanation that campaign-specific terms control each promotion.
- General sections for organizer, eligibility, participation period, claim period, entry limits, rewards, reward availability, randomized mechanics requiring review, claims, expiration, cancellation, fraud or abuse review, privacy, technical failures, support, and dispute handling where approved.
- Campaign-specific terms finder or list.
- Clear distinction between participation and optional marketing consent.
- Accessible language and print view.

## Primary and Secondary Actions

- Open campaign-specific terms
- Navigate section
- Change language
- Print
- Contact campaign support

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Current
- Campaign not found
- Archived campaign terms
- Translation unavailable
- Loading

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not create gambling, paid lottery entry, hidden conditions, guaranteed prizes, winner manipulation, unsupported legal claims, or final legal text without review.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Campaign Terms and Reward Rules Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 20 — Admin Login and Secure Access

## Reusable Google Stitch Production Prompt

Create Page 20 of the final production QR/NFC restaurant platform:

# Admin Login and Secure Access
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/login`

## Purpose

Provide secure sign-in for internal YourPlatform administrators only.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- YourPlatform admin brand panel.
- Work-email and password fields where password authentication is used.
- SSO or approved authentication-method options where implemented.
- Remember-device option only when policy allows.
- Forgot-password flow.
- MFA challenge state.
- Invitation acceptance and first-time setup state.
- Security notice and authorized-use statement.
- Help and support link.
- Non-public noindex behavior.

## Primary and Secondary Actions

- Sign in
- Continue with approved SSO
- Reset password
- Complete MFA
- Accept invitation
- Contact support

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Default
- Loading
- Invalid credentials
- MFA required
- Account suspended
- Invitation expired
- Password reset sent
- Rate limited
- Service unavailable

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add public registration, restaurant-owner login, customer login, social signup, password reveal in logs, security secrets, or detailed reasons that help bypass authentication.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Admin Login and Secure Access — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 21 — Admin Dashboard

## Reusable Google Stitch Production Prompt

Create Page 21 of the final production QR/NFC restaurant platform:

# Admin Dashboard
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin`

## Purpose

Give authorized staff a high-level operational overview of restaurants, menus, QR/NFC products, campaigns, enquiries, website content, and issues.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Persistent admin sidebar and top header.
- Welcome and environment status.
- Summary metrics: restaurants, published pages, menu products, active QR, active NFC, campaigns, new enquiries, website issues.
- Operational alerts grouped by severity.
- Recent restaurants and setup progress.
- QR/NFC health summary.
- Campaign timeline summary.
- Lead and follow-up summary.
- Website CMS draft and publication summary.
- Recent admin activity.
- Quick-create actions based on permission.
- Illustrative data labels.

## Primary and Secondary Actions

- Add restaurant
- Create campaign
- Create QR
- Assign NFC
- Open enquiries
- Open CMS
- Review issues

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Loading
- Partial data
- No restaurants
- No issues
- Permission-limited dashboard
- Error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not include restaurant-owner data access, revenue, sales, payment, subscription, personal customer tracking, or fabricated performance claims.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Admin Dashboard — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 22 — Restaurants Management List

## Reusable Google Stitch Production Prompt

Create Page 22 of the final production QR/NFC restaurant platform:

# Restaurants Management List
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants`

## Purpose

Let staff search, filter, review, create, archive, and open restaurant records.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Restaurant metrics and status alerts.
- Search and filters for public status, setup stage, location, language, menu readiness, QR/NFC status, campaign status, issue status, and assigned team.
- Table and card views.
- Columns for restaurant, ID, locations, public status, setup progress, menu, QR, NFC, campaigns, issues, updated, actions.
- Bulk selection with safe limited actions.
- Right-side restaurant summary panel.
- Archived restaurant view.
- Export controls.
- Pagination.

## Primary and Secondary Actions

- Add restaurant
- Open workspace
- Preview public page
- Assign staff
- Validate setup
- Archive
- Restore
- Export

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Empty
- Loading
- No results
- Partial data
- Permission denied
- Version conflict
- Error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not permanently delete restaurants, create owner accounts, expose private contacts, publish automatically, or bulk-activate unreviewed records.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurants Management List — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 23 — Add Restaurant Page

## Reusable Google Stitch Production Prompt

Create Page 23 of the final production QR/NFC restaurant platform:

# Add Restaurant Page
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/new`

## Purpose

Create a restaurant draft through a structured setup workflow.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Guided stepper: Identity, Locations, Contact, Hours, Branding, Languages, Menu, Customer Actions, QR/NFC Needs, Review.
- Restaurant name, internal name, cuisine, business type, public summary, and identifiers.
- Primary location and optional additional-location plan.
- Public and internal contacts separated.
- Opening-hours setup.
- Logo and cover-image references.
- Language selection.
- Menu-source and data-entry plan.
- Customer-action source configuration.
- QR and NFC requirements.
- Internal assignment, tags, and notes.
- Readiness checklist and create-draft action.

## Primary and Secondary Actions

- Save draft
- Create restaurant draft
- Preview
- Validate
- Cancel

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- New
- Autosaving
- Validation errors
- Duplicate restaurant suspected
- Save failed
- Success

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Creating a restaurant must not create an owner account, publish a page, generate QR codes, program NFC products, start billing, or send public communication automatically.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Add Restaurant Page — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 24 — Restaurant Detail Workspace

## Reusable Google Stitch Production Prompt

Create Page 24 of the final production QR/NFC restaurant platform:

# Restaurant Detail Workspace
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]`

## Purpose

Provide the central operational workspace for one restaurant and connect every editor and management area.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Restaurant context header with logo, name, ID, location, public status, setup progress, and issue count.
- Workspace tabs: Overview, General Information, Branding, Contact and Location, Opening Hours, Page Builder, Menu, Media, Customer Actions, QR Codes, NFC Products, Campaigns, Analytics, Activity.
- Setup-readiness checklist.
- Public preview card.
- Menu summary.
- Customer-action summary.
- QR/NFC summary.
- Campaign summary.
- Analytics summary.
- Assigned team and internal notes.
- Recent activity and quick actions.

## Primary and Secondary Actions

- Edit section
- Preview restaurant
- Validate
- Submit for review
- Publish approved version
- Archive restaurant

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Draft
- In review
- Approved
- Published
- Paused
- Archived
- Issues
- Loading
- Partial data

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not make this a restaurant-owner dashboard. Do not expose customer identities, payment data, or unsafe one-click publication.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Detail Workspace — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 25 — Restaurant General Information Editor

## Reusable Google Stitch Production Prompt

Create Page 25 of the final production QR/NFC restaurant platform:

# Restaurant General Information Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/general`

## Purpose

Manage restaurant identity, public description, cuisine, languages, slugs, internal references, and publication readiness.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Restaurant identity fields.
- Public title, short name, internal name, business type, cuisine, and tags.
- Public short summary and full description.
- Primary language and supported languages.
- Public slug with availability and change-impact review.
- Internal restaurant ID and status.
- SEO preview summary.
- Current versus draft comparison.
- Readiness checklist.
- Validation and review workflow.

## Primary and Secondary Actions

- Save draft
- Validate
- Preview
- Submit for review
- Reset draft

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Draft
- Published with changes
- Validation issue
- Slug conflict
- Version conflict
- Save error
- Success

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not alter the live restaurant on save, silently break public links, automatically translate, or expose internal notes publicly.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant General Information Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 26 — Restaurant Branding Editor

## Reusable Google Stitch Production Prompt

Create Page 26 of the final production QR/NFC restaurant platform:

# Restaurant Branding Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/branding`

## Purpose

Manage approved restaurant logos, colors, typography treatment, imagery, and public preview within controlled design-system limits.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Logo variants and icon mark.
- Cover image and fallback imagery.
- Approved template selection.
- Controlled brand-color fields with contrast checks.
- Typography treatment based on platform fonts.
- Image style and crop settings.
- Customer-action visual preview.
- Menu-card preview.
- Campaign and social preview.
- Artwork references for QR/NFC products.
- Current versus draft and impact summary.
- Brand readiness checklist.

## Primary and Secondary Actions

- Select template
- Choose media
- Save draft
- Preview
- Validate
- Submit for review

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Complete
- Missing logo
- Low contrast
- Image issue
- Draft changes
- Version conflict
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not provide arbitrary CSS, custom JavaScript, unrestricted fonts, freeform page design, or automatic changes to printed QR/NFC artwork.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Branding Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 27 — Restaurant Contact and Location Editor

## Reusable Google Stitch Production Prompt

Create Page 27 of the final production QR/NFC restaurant platform:

# Restaurant Contact and Location Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/contact-location`

## Purpose

Manage public and internal contact sources, locations, map behavior, social links, and save-contact information.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Primary and additional locations.
- Public address and structured address fields.
- Coordinates or map reference with verification status.
- Public phone, email, WhatsApp, website, and external ordering URL.
- Internal contact separated and clearly marked private.
- Social profiles.
- Directions behavior.
- Save-contact/vCard fields.
- Location-specific customer-action sources.
- Map and mobile public preview.
- Validation for links, phone formats, duplicate locations, and private-data exposure.
- Current versus draft.

## Primary and Secondary Actions

- Add location
- Verify map
- Test links
- Save draft
- Preview
- Validate

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Verified
- Review required
- Map unavailable
- Invalid link
- Duplicate location
- Disabled location
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not expose private contacts, infer exact coordinates without review, silently change related customer actions, or confirm physical visits through analytics.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Contact and Location Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 28 — Restaurant Opening Hours Editor

## Reusable Google Stitch Production Prompt

Create Page 28 of the final production QR/NFC restaurant platform:

# Restaurant Opening Hours Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/opening-hours`

## Purpose

Manage normal hours, split shifts, special dates, temporary closures, and public closed-state behavior.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Weekly opening-hours grid.
- Closed-day controls.
- Split-shift support.
- 24-hour option where appropriate.
- Location-specific schedules.
- Special dates and holiday overrides.
- Temporary closure with public message.
- Campaign and claim-hours compatibility.
- Current open/closed preview.
- Validation for overlaps, invalid ranges, missing time zone, and contradictory overrides.
- Current versus draft and readiness.

## Primary and Secondary Actions

- Copy hours
- Apply to days
- Add special date
- Set closure
- Save draft
- Preview
- Validate

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Open
- Closed
- Special hours
- Temporary closure
- Invalid schedule
- Time-zone review
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not overwrite location-specific schedules silently, infer holidays automatically as final, or change campaign dates from this editor.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Opening Hours Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 29 — Restaurant Page Builder

## Reusable Google Stitch Production Prompt

Create Page 29 of the final production QR/NFC restaurant platform:

# Restaurant Page Builder
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/page-builder`

## Purpose

Arrange approved restaurant homepage sections and content references without freeform code or arbitrary design.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Controlled section inventory: Hero, Customer Actions, Featured Categories, Featured Products, Campaign, About, Hours, Contact and Location, Social, Final CTA.
- Drag-and-drop section ordering with keyboard alternative.
- Section visibility and language controls.
- Content-source references to restaurant, menu, campaigns, media, and customer actions.
- Per-section layout variants from approved options.
- Mobile-first public preview.
- Published versus draft comparison.
- Broken-reference and hidden-content warnings.
- Page readiness checklist.
- Review and publication handoff.

## Primary and Secondary Actions

- Add approved section
- Reorder
- Hide/show
- Open source editor
- Save draft
- Preview
- Validate

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Empty builder
- Draft changes
- Broken source
- Hidden section
- Language incomplete
- Version conflict
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not allow raw HTML, arbitrary CSS, JavaScript, unsupported embeds, full freeform positioning, or direct editing of source menu/campaign data.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Page Builder — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 30 — Digital Menu Manager

## Reusable Google Stitch Production Prompt

Create Page 30 of the final production QR/NFC restaurant platform:

# Digital Menu Manager
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/menu`

## Purpose

Manage menu categories, products, ordering, visibility, availability, translations, and publication readiness.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Menu summary metrics and issues.
- Category sidebar or tree.
- Product table and card views.
- Search and filters.
- Drag-and-drop category and product order with keyboard alternatives.
- Bulk availability and visibility actions.
- Language completeness.
- Menu preview.
- Current published menu versus draft changes.
- Import/export placeholder with validation.
- Menu readiness checklist.
- Archived category/product access.

## Primary and Secondary Actions

- Add category
- Add product
- Reorder
- Bulk update
- Import
- Export
- Preview
- Validate
- Submit for review

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Empty menu
- No results
- Draft
- Published with changes
- Import errors
- Broken media
- Translation incomplete
- Save conflict

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add cart, order management, POS, kitchen workflow, payment, restaurant-owner editing, or unsafe bulk deletion.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Digital Menu Manager — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 31 — Menu Category Editor

## Reusable Google Stitch Production Prompt

Create Page 31 of the final production QR/NFC restaurant platform:

# Menu Category Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/menu/categories/[categoryId]`

## Purpose

Create or edit one menu category, its identity, translations, imagery, visibility, ordering, SEO, and dependencies.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Category name and internal name.
- Slug and public route.
- Short description.
- Category image and alt text.
- Language tabs.
- Visibility and schedule.
- Product count and empty-category behavior.
- Homepage and campaign references.
- SEO metadata.
- Fallback behavior when hidden or archived.
- Mobile preview.
- Current versus draft.
- Validation and review.

## Primary and Secondary Actions

- Save draft
- Preview
- Validate
- Duplicate structure
- Archive
- Restore

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Visible
- Hidden
- Scheduled
- Empty
- Archived
- Slug conflict
- Translation incomplete
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not silently archive products, break QR/NFC destinations, change product data, or permanently delete the category.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Menu Category Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 32 — Menu Product Editor

## Reusable Google Stitch Production Prompt

Create Page 32 of the final production QR/NFC restaurant platform:

# Menu Product Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/menu/products/[productId]`

## Purpose

Create or edit one menu product with controlled content, availability, imagery, pricing, dietary information, SEO, and references.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Product name, internal name, category, slug, short description, full description.
- Price display and optional variants.
- Availability, seasonal state, and schedule.
- Images, crops, and alt text.
- Ingredients.
- Dietary labels and allergen information with review caution.
- Language tabs and fallback behavior.
- External ordering destination where approved.
- Homepage, campaign, QR, and NFC references.
- SEO metadata.
- Mobile product preview.
- Current versus draft, impact summary, validation, and review.

## Primary and Secondary Actions

- Save draft
- Preview
- Validate
- Duplicate product
- Mark unavailable
- Archive
- Restore

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Available
- Unavailable
- Seasonal
- Scheduled
- Archived
- Price missing
- Image missing
- Translation incomplete
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add inventory management, cart, checkout, nutrition claims without source, medical claims, customer reviews, or permanent deletion.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Menu Product Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 33 — Restaurant Media Library

## Reusable Google Stitch Production Prompt

Create Page 33 of the final production QR/NFC restaurant platform:

# Restaurant Media Library
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/media`

## Purpose

Manage approved restaurant images and documents with usage references, accessibility metadata, rights review, and safe archival.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Media summary metrics and storage-status summary without raw credentials.
- Search and filters by type, usage, language, status, rights, dimensions, and missing alt text.
- Grid and table views.
- Upload area with safe file-type validation.
- Asset detail panel with title, alt text, caption, focal point, crop variants, rights/source, language, usage, dimensions, and file size.
- Usage references across restaurant page, menu, products, campaigns, QR/NFC artwork, and website examples.
- Duplicate detection.
- Replace asset workflow.
- Archive/restore and broken-reference warnings.
- Bulk metadata actions and exports.

## Primary and Secondary Actions

- Upload
- Select asset
- Edit metadata
- Replace
- Review usage
- Archive
- Restore

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Uploading
- Processing
- Ready
- Low resolution
- Missing alt text
- Rights review
- Broken asset
- Duplicate
- Archived
- Error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not allow executable files, public storage credentials, unsafe HTML/SVG execution, permanent deletion of referenced assets, or restaurant-owner uploads.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Media Library — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 34 — Restaurant Customer Actions Editor

## Reusable Google Stitch Production Prompt

Create Page 34 of the final production QR/NFC restaurant platform:

# Restaurant Customer Actions Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/customer-actions`

## Purpose

Configure the four primary customer actions and approved optional actions using safe source references, validation, previews, and fallback behavior.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Primary actions: Call Order, Pick Your Meal, Online Order with Pay, Visit Us.
- Optional actions: WhatsApp, Email, Save Contact, Share, Campaign, Social.
- Action order and visibility.
- Language-specific labels.
- Destination source selection.
- Phone, menu, external-ordering, map, contact, campaign, and social validation.
- External-link safety and HTTPS checks.
- Open/closed behavior.
- Location-specific behavior.
- Mobile homepage preview.
- Current versus draft.
- Customer-action readiness checklist.
- Destination testing.

## Primary and Secondary Actions

- Enable action
- Change label
- Select destination
- Reorder
- Test
- Save draft
- Preview
- Validate

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Connected
- Draft
- Missing source
- Broken destination
- Redirected
- Disabled
- Location conflict
- Save error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add internal ordering, cart, checkout, payment processing, arbitrary scripts, unsafe protocols, hidden redirects, or automatic changes to QR/NFC records.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Customer Actions Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 35 — Restaurant QR Code Management

## Reusable Google Stitch Production Prompt

Create Page 35 of the final production QR/NFC restaurant platform:

# Restaurant QR Code Management
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/qr-codes`

## Purpose

Create, assign, validate, test, export, monitor, replace, pause, archive, and restore restaurant QR records.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- QR summary metrics: total, active, draft, installed, issues, scans, last scan.
- Table, grid, placement, and batch views.
- Search and filters by QR ID, placement, destination, status, artwork, production, installation, campaign, and activity.
- QR record fields: internal ID, public label, type, restaurant, location, area, table, destination, fallback, artwork, production, installation, analytics, version.
- Create QR wizard.
- Approved internal and HTTPS external destinations.
- Managed redirect versus direct/static destination explanation.
- Destination safety and health tests.
- Artwork preview and export formats.
- Production and installation tracking.
- Damage, loss, replacement, pause, archive, and restore workflows.
- Related NFC record panel without automatic mutation.
- Scan analytics with privacy limits.
- Current versus draft and readiness checklist.

## Primary and Secondary Actions

- Create QR
- Bulk create
- Test destination
- Download artwork
- Export production package
- Mark installed
- Pause
- Replace
- Archive
- Restore

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Draft
- Active
- Paused
- Disabled
- Production pending
- Installed
- Damaged
- Lost
- Replacement required
- Broken destination
- Archived

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not use unsafe URLs, admin/private destinations, auto-activation, automatic printing/shipping/installation, permanent deletion, raw redirect secrets, or customer identity tracking.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant QR Code Management — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 36 — Restaurant NFC Product Management and Assignment

## Reusable Google Stitch Production Prompt

Create Page 36 of the final production QR/NFC restaurant platform:

# Restaurant NFC Product Management and Assignment
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/nfc-products`

## Purpose

Register, assign, configure, validate, test, monitor, replace, pause, retire, archive, and restore physical NFC products.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- NFC metrics: total, assigned, active, unassigned, encoding required, installed, issues, taps, last tap.
- Table, product-grid, placement, and inventory/batch views.
- Search and filters by NFC ID, masked UID fragment, product type, assignment, location, destination, encoding, production, installation, issue, and activity.
- Core record: internal NFC ID, public label, product type, hardware technology, vendor/batch, masked UID, capacity, read/write capability, lock state, custody, restaurant/location assignment, destination, fallback, artwork, production, encoding, testing, installation, replacement relationship, notes, and history.
- Assignment wizard that creates a draft only.
- Approved internal and safe HTTPS external destinations.
- Managed redirect strategy and direct/static URL warning.
- Encoding workflow separating software configuration, instructions, physical encoding, verification, optional irreversible locking, and activation.
- Lock-state warning and irreversible confirmation.
- Physical placement and installation tracking.
- Related QR panel with alignment warnings but no automatic mutation.
- Artwork/product preview.
- Production, damage, loss, and replacement workflows.
- Import inventory with row-level validation.
- Aggregated tap analytics and privacy limitations.
- Current versus draft and readiness checklist.

## Primary and Secondary Actions

- Register product
- Assign NFC
- Bulk assign
- Prepare encoding
- Generate instructions
- Mark encoded
- Verify tag
- Export production package
- Mark installed
- Pause
- Replace
- Archive
- Restore

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Inventory
- Reserved
- Assigned
- Active
- Paused
- Encoding pending
- Encoded
- Verified
- Failed
- Locked
- Installed
- Damaged
- Lost
- Replaced
- Archived

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not claim universal browser encoding, expose raw keys/PACK/passwords, provide a public writer, support contactless payments, auto-encode, auto-produce, auto-install, auto-activate, automatically change QR records, or permanently delete records.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant NFC Product Management and Assignment — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 37 — Restaurant Campaigns Management List

## Reusable Google Stitch Production Prompt

Create Page 37 of the final production QR/NFC restaurant platform:

# Restaurant Campaigns Management List
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/campaigns`

## Purpose

Monitor, filter, review, schedule, pause, resume, duplicate, complete, archive, and open restaurant campaigns.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Campaign metrics: total, active, scheduled, draft, in review, ended, participants, pending claims.
- Campaign alerts for terms, reward availability, deadlines, entry points, and translations.
- Search and filters by status, type, date, location, reward, terms, entry points, and readiness.
- Table, card, timeline, and calendar-summary views.
- Columns for campaign, type, participation period, claim period, location, reward, lifecycle, terms, entry points, participants, claims, issues, updated, actions.
- Campaign summary side panel.
- Campaign readiness checklist.
- QR/NFC alignment summary.
- Campaign health check.
- Starting-soon, ending-soon, and claim-deadline monitoring.
- Pause, resume, end participation, cancel, archive, restore-structure workflows.
- Aggregated activity only.

## Primary and Secondary Actions

- Create campaign
- Open campaign
- Preview
- Duplicate structure
- Submit for review
- Pause
- Resume
- End participation
- Archive
- Export

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Draft
- In review
- Approved
- Scheduled
- Active
- Paused
- Participation ended
- Claim period open
- Completed
- Cancelled
- Archived
- Publication blocked

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add gambling, betting, paid lottery, casino visuals, automatic winner selection, reward payment, personal participant rows, auto-publication, or permanent deletion.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Campaigns Management List — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 38 — Restaurant Campaign Editor

## Reusable Google Stitch Production Prompt

Create Page 38 of the final production QR/NFC restaurant platform:

# Restaurant Campaign Editor
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/campaigns/[campaignId]`

## Purpose

Create or update one campaign with dates, locations, participation rules, rewards, claims, terms, privacy, entry-point references, previews, validation, and approval workflow.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Campaign type and identity.
- Public title, summary, description, internal name, slug, and language content.
- Participation period and claim period.
- Eligible locations and opening-hours compatibility.
- Participation method and flow.
- Minimal participant-data requirements.
- Eligibility, age rules where approved, entry limits, and high-level anti-abuse controls.
- Reward type, linked menu product, availability, quantity limits, exhausted behavior, and outcome method.
- Claim method and claim-code behavior at a high level.
- Structured campaign terms with review status.
- Campaign media and controlled page presentation.
- QR, NFC, customer-action, and homepage references.
- Post-campaign and pause behavior.
- Consent and privacy.
- Internal notes and restaurant confirmation.
- Sticky public preview.
- Readiness checklist, timeline, reward, terms, entry-point, current-versus-draft, impact, validation, and review panels.

## Primary and Secondary Actions

- Create/save draft
- Preview
- Validate
- Submit for content/rules/terms review
- Approve version
- Continue to scheduling
- Reset draft

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- New draft
- Draft changes
- Incomplete
- In review
- Approved
- Scheduled
- Active
- Paused
- Participation ended
- Claim period open
- Save failed

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add paid entry, casino mechanics, automatic winner selection, payment, customer wallet, mass marketing, preselected marketing consent, automatic legal approval, automatic QR creation, automatic NFC programming, or auto-publication.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Campaign Editor — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 39 — Restaurant Analytics Dashboard

## Reusable Google Stitch Production Prompt

Create Page 39 of the final production QR/NFC restaurant platform:

# Restaurant Analytics Dashboard
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/restaurants/[restaurantId]/analytics`

## Purpose

Review aggregated, privacy-aware restaurant-page, menu, customer-action, QR, NFC, campaign, location, language, device, destination-health, and data-quality analytics.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Date range, comparison, location, channel, language, and data-mode controls.
- Primary metrics: public page views, menu views, customer-action interactions, QR scans, NFC taps, campaign interactions.
- Metric definitions and coverage status.
- Engagement trend chart with operational annotations.
- Channel performance and attribution limitations.
- Interaction funnel.
- Customer-actions performance with precise outcome disclaimers.
- Digital-menu engagement, top categories, top products, low-engagement content, search, and unavailable-product views.
- QR overview, top QR records, placement analysis, and operational insights.
- NFC overview, top NFC products, QR-versus-NFC comparison, companion analysis, and operational insights.
- Campaign overview, funnel, entry-channel, reward, and issue summaries.
- Location, opening-hours, day/time, language, broad device, and public-experience health summaries.
- Destination-success and broken-destination reports.
- Operational insights with confidence labels.
- Data quality, consent-aware reporting, privacy thresholds, external-ordering limitations, saved views, and exports.

## Primary and Secondary Actions

- Change filters
- Compare period
- Open source record
- Review data quality
- Save report view
- Export report
- Refresh

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Data current
- Processing
- Consent limited
- Partial coverage
- No data
- No comparison
- Partial source failure
- Export error

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not expose customer identities, exact personal locations, device fingerprints, confirmed calls/messages/visits/orders from click data, revenue without verified integration, employee scoring, or unsupported causal claims.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Restaurant Analytics Dashboard — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 40 — Public Website CMS

## Reusable Google Stitch Production Prompt

Create Page 40 of the final production QR/NFC restaurant platform:

# Public Website CMS
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/website`

## Purpose

Manage the public YourPlatform website page inventory, shared content, translations, SEO readiness, navigation references, links, forms, accessibility, and publication workflow.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Website metrics and content alerts.
- CMS tabs: Pages, Shared Content, Navigation, Translations, SEO, Redirects, Legal Pages, Forms, Activity.
- Search and filters by status, page type, language, SEO, link health, navigation, and review.
- Table, card, sitemap, and publication-calendar views.
- Page inventory with route, language, SEO, navigation, publication, draft, link health, and actions.
- Create-page-draft wizard and approved template library.
- Right-side page summary with preview, core info, publication, language, SEO, navigation, shared content, forms, links, accessibility, comparison, version history, and actions.
- Shared-content impact warnings.
- Legal-page summary.
- Navigation, header/footer, CTA, pricing, FAQ, contact, and forms summaries.
- Validation, website health check, broken-link, SEO, and translation issue panels.
- Review, approval, schedule, publish, unpublish, archive, restore, and export workflows.

## Primary and Secondary Actions

- Create page draft
- Open editor
- Preview
- Validate
- Run health check
- Submit for review
- Approve
- Schedule
- Publish approved version
- Archive
- Export

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Draft
- In review
- Approved
- Scheduled
- Published
- Unpublished
- Publication blocked
- Archived
- Link issue
- Translation issue
- SEO issue

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add raw HTML, arbitrary CSS/JavaScript, plugins, restaurant-page editing, automatic translation, automatic legal approval, unrestricted bulk publication, permanent deletion, or private preview tokens in public navigation.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Public Website CMS — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 41 — Leads and Quote Requests Management

## Reusable Google Stitch Production Prompt

Create Page 41 of the final production QR/NFC restaurant platform:

# Leads and Quote Requests Management
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/enquiries`

## Purpose

Review, qualify, assign, follow up, prepare proposal handoffs, convert, archive, restore, and securely manage restaurant enquiries.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Lead metrics and operational alerts.
- Tabs: All, Assigned to Me, Unassigned, Follow-Ups, Qualified, Proposals, Ready to Convert, Spam Review, Archived, Activity.
- Search and filters by stage, owner, type, services, priority, follow-up, source, data quality, and location.
- Table, pipeline, compact-card, and follow-up-calendar views.
- Columns for enquiry, contact, services, location, stage, priority, owner, follow-up, source, data quality, dates, actions.
- Right-side enquiry panel with contact, restaurant, services, qualification, message, source, consent, assignment, follow-up, proposal, duplicate review, activity, and actions.
- Manual enquiry creation with lawful contact context.
- Qualification checklist and manual priority.
- Assignment, contact-attempt, follow-up, information-request, and proposal handoff workflows.
- Duplicate detection and controlled merge.
- Spam review.
- Consent, privacy, retention, and role-based masking.
- Conversion readiness and controlled conversion to a restaurant draft.
- Not-suitable, no-response, archive, restore, export, and aggregate summary.

## Primary and Secondary Actions

- Add enquiry
- Assign
- Change stage
- Record contact
- Schedule follow-up
- Request information
- Mark qualified
- Prepare quote
- Convert to restaurant project
- Archive
- Export

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- New
- Assigned
- Contacted
- Qualification
- Qualified
- Waiting
- Proposal
- Ready to convert
- Converted
- Not suitable
- Spam review
- Archived

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add public CRM, restaurant-owner account, subscription checkout, payment, invoices, mass email/calling, automatic scoring/rejection, employee leaderboards, automatic restaurant publication, or unrestricted personal-data export.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Leads and Quote Requests Management — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 42 — Global SEO and Platform Settings

## Reusable Google Stitch Production Prompt

Create Page 42 of the final production QR/NFC restaurant platform:

# Global SEO and Platform Settings
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/platform-settings`

## Purpose

Configure platform identity, branding, domains, languages, regional defaults, global SEO, social metadata, consent, legal references, public defaults, and controlled application.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Settings section navigation: General, Branding, Domains, Languages and Region, SEO, Social, Contact and Email, Analytics and Consent, Legal, Public Experience, Restaurant Defaults, Campaign Defaults, QR/NFC Defaults, Integrations, Review and Apply.
- Platform identity and public contact references.
- Brand assets, colors, typography, and previews.
- Primary, canonical, preview, and tracking-domain summaries.
- Language, route strategy, RTL, region, time-zone, date, number, and currency-display defaults.
- SEO title templates, meta defaults, canonical, indexing, structured robots, sitemap, hreflang, and structured-data defaults.
- Social profiles and social-sharing preview.
- Enquiry routing and email-template references.
- Analytics and consent categories.
- Cookie and legal-page references.
- Public error, maintenance, preview, and fallback behavior.
- Restaurant, menu, campaign, QR, NFC, redirect, and form defaults.
- High-level integrations and security summaries without credentials.
- Retention, accessibility, and notification defaults.
- Draft preview, readiness, high-impact changes, public impact, current-versus-draft, validation, review, approval, apply, post-check, and rollback.

## Primary and Secondary Actions

- Save draft
- Validate
- Preview
- Compare
- Submit for review
- Approve version
- Schedule application
- Apply approved settings
- Rollback

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Applied
- Draft changes
- Validation required
- In review
- Approved
- Applying
- Partially applied
- Failed
- Rollback required

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not expose environment variables, DNS credentials, API secrets, raw robots/JSON, server controls, database controls, automatic application on save, silent restaurant overrides, automatic QR regeneration, NFC reprogramming, or legal/SEO compliance claims.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Global SEO and Platform Settings — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 43 — Admin Users and Team Management

## Reusable Google Stitch Production Prompt

Create Page 43 of the final production QR/NFC restaurant platform:

# Admin Users and Team Management
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/team`

## Purpose

Invite, organize, secure, scope, review, suspend, deactivate, restore, and audit internal YourPlatform administrator access.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Team/access metrics and security alerts.
- Tabs: Users, Teams, Invitations, Roles and Permissions, Access Reviews, Security Status, Deactivated, Activity.
- Search and filters by account status, role, team, scope, authentication, review, and activity.
- User table, team view, permission matrix, invitation view, and access-review view.
- User columns: identity, role, team, scope, status, MFA, last sign-in, review, temporary access, updated, actions.
- Invite-user workflow with identity, team, role, scope, additional permissions, security, duration, and review.
- Secure invitation lifecycle.
- Right-side user detail panel.
- Plain-language effective-permission calculation and source.
- Separation-of-duties and role-conflict review.
- Temporary permissions with mandatory expiration.
- High-level authentication, MFA, password-reset, session, and force-sign-out controls.
- Access reviews, inactivity review, suspension, restoration, deactivation, responsibility transfer, and restored-access draft.
- Current-versus-proposed access, validation, approval, application, exports, and activity.

## Primary and Secondary Actions

- Invite admin user
- Edit access
- Change role/team/scope
- Require MFA
- Start access review
- Force sign-out
- Suspend
- Restore
- Deactivate
- Export

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Invited
- Pending setup
- Active
- MFA required
- Review due
- Temporary access
- Suspended
- Access expired
- Deactivated
- Invitation expired/revoked

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Do not add restaurant-owner/staff accounts, customer accounts, public registration, shared credentials, password/MFA-secret display, impersonation, employee productivity scoring, automatic privilege escalation, self-approval, automatic temporary extension, or permanent deletion.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Admin Users and Team Management — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---


# Page 44 — Audit Log and Activity History

## Reusable Google Stitch Production Prompt

Create Page 44 of the final production QR/NFC restaurant platform:

# Audit Log and Activity History
## Final Modern Fast Food Desktop Design

Generate only this page.

## Route

Use:

`/admin/audit-log`

## Purpose

Provide an immutable, searchable, permission-aware history of important platform, restaurant, content, campaign, QR/NFC, enquiry, settings, access, authentication, export, and publication events.

## Access Model

This page is for authorized YourPlatform staff only. Restaurant owners and customers do not access this interface. Apply role-based permissions, server-side authorization, version history, activity logging, and non-destructive archive/restore behavior. Hide actions the current role cannot perform.

## Visual Direction

Use the shared Modern Fast Food system:

- Primary red-orange `#F04424`
- Primary dark `#C9341A`
- Navy `#111827`
- White `#FFFFFF`
- Light background `#F8FAFC`
- Warm surface `#FFF1EB`
- Gray text `#667085`
- Border `#E5E7EB`
- Yellow accent `#FFC533`
- Success `#16A34A`
- Warning `#D97706`
- Error `#DC2626`
- Manrope headings
- Inter body and UI

The page must feel production-ready, clear, trustworthy, responsive, and consistent with all previous YourPlatform pages.

## Viewport and Layout

Design desktop-first around a 1440 × 1024 px viewport. Preserve clear tablet and mobile responsive intent without generating separate screens.

Use Pizza House / `RST-00024` as the sample restaurant where relevant. Use generic administrator roles and label mock metrics as **Illustrative Admin Data**.

## Required Content and Sections

- Audit summary metrics: events, high-risk changes, failed actions, exports, access changes, publication changes, unresolved review items.
- Tabs or views: All Activity, Security and Access, Restaurants, Menus, QR, NFC, Campaigns, Website CMS, Enquiries, Platform Settings, Exports, Archived Records.
- Search by event ID, actor, role, affected record, restaurant, campaign, QR/NFC ID, page, enquiry, user, action, reason, or correlation ID.
- Filters for date/time, actor role, event category, action, result, severity, environment, affected scope, restaurant, IP visibility level, approval workflow, and export type.
- Table columns: timestamp, event, actor, role, affected record, scope, result, severity, source area, correlation/reference, actions.
- Right-side event detail panel with plain-language summary, before/after differences, actor role, affected records, approval chain, reason, system result, related events, and retention status.
- Before-and-after comparison with field-level masking.
- Event-chain and correlation timeline.
- Security and access event summaries.
- Publication, settings-application, QR/NFC operational, campaign, enquiry, and export event summaries.
- Saved audit views and restricted export.
- Integrity and retention status at a high level.
- Investigation notes and review workflow without altering original events.
- Loading, empty, no-results, partial, permission-denied, and export-error states.

## Primary and Secondary Actions

- Open event
- Compare before/after
- View related record
- View correlated events
- Add investigation note
- Mark review complete
- Save audit view
- Export approved report

Actions must have clear labels, visible focus states, loading/disabled behavior, and permission checks where relevant.

## Required States

- Successful
- Failed
- Partially completed
- Blocked
- Pending approval
- Applied
- Rolled back
- Suspicious or review required
- Archived record event
- Retention protected

Also support:

- Loading skeletons
- Empty states
- No-results states where relevant
- Section-level errors
- Network or partial-data errors
- Permission-denied states on admin pages
- Success confirmations
- Version-conflict handling on editable admin pages

## Interaction Requirements

- Use 150–200 ms transitions.
- Do not hide essential actions behind hover.
- Use confirmation dialogs for destructive, high-impact, publication, activation, archival, suspension, or access-change actions.
- Preserve current public/applied data when a draft is saved.
- Do not auto-publish, auto-activate, auto-apply, or auto-delete.
- Show current-versus-draft comparison where the page edits operational or public data.
- Record meaningful admin changes in activity history.

## Accessibility and Internationalization

- Minimum 44 × 44 px targets.
- Semantic headings, forms, tables, tabs, and dialogs.
- Visible keyboard focus.
- Readable status text in addition to color.
- Announced validation errors and status changes.
- Turkish, English, and Arabic support.
- Arabic RTL support.
- Keep identifiers, URLs, emails, phone numbers, dates, and codes readable.
- Respect reduced motion.

## Privacy, Security, and Data Rules

- Use only the minimum data required for the page purpose.
- Do not expose private notes publicly.
- Do not expose secrets, tokens, keys, raw credentials, or infrastructure details.
- Apply field masking and role-based visibility where needed.
- Use aggregated analytics rather than personal customer tracking.
- Preserve audit and version history.
- Use archive and restore instead of permanent deletion.

## Critical Page-Specific Rules

Audit events must be append-only and non-editable. Do not permit deletion, rewriting, actor impersonation, secret display, raw tokens, full passwords, MFA secrets, recovery codes, full session tokens, unrestricted IP/device data, customer identity profiling, or export beyond permission and privacy rules.

## Explicit Exclusions

Do not add unrelated features, unsupported integrations, restaurant-owner self-service, customer accounts, subscription checkout, billing, payment collection, internal POS/kitchen operations, or fake verified metrics.

## Output

Generate only:

**Audit Log and Activity History — Final Modern Fast Food Desktop Design**

Do not generate adjacent pages, separate responsive screens, alternative themes, or additional product surfaces.

---
