# UWELL CRM Redesign Recovery Design

## Purpose

This document keeps the previous fan, store, admin, and cross-portal rule specs alive, but changes the implementation method.

The previous failure was not the product direction. The failure was mixing new UI, old tabs, old cards, old CSS, and new business rules inside the same live pages. The recovery approach is to isolate the new experience first, approve it visually, then migrate it into the real portals.

## Product Direction

UWELL CRM has three connected portals:

- Fan portal: a UWELL brand membership hub with young yellow-green energy, growth progress, rewards, activities, stores, and community.
- Store portal: a practical daily workbench for store owners, focused on verification, campaigns, photos, materials, and store status.
- Admin portal: an operational control center for managers and admins, focused on data, permissions, reviews, rules, inventory, visits, and risk.

The fan portal should feel like a brand private-domain membership center with game-like growth. It should not feel like a dense CRM page.

## Non-Negotiable UX Rules

- Fan and store primary navigation must stay fixed at the bottom of the screen.
- The fixed bottom navigation must remain visible while scrolling and while viewing secondary pages.
- Secondary pages must have a visible top-left back button.
- Old top tabs and the new bottom navigation must never appear together in the same portal shell.
- Page content must reserve enough bottom padding so the fixed navigation never covers content.
- Each screen must have one clear primary action.
- Long rules must be collapsed by default.
- Home screens must avoid dense text blocks.
- Cards must not be nested inside other cards.
- Normal body text must meet readable contrast.
- Mobile tap targets must be at least 44px high.

## Fan Portal Target Shape

Primary bottom navigation:

- Home
- Activities
- Community
- Rewards
- Stores
- Me

Home first screen:

- UWELL brand header with language and profile access.
- Membership identity card with fan level, points, progress, next level, and growth badge.
- Two primary actions: Scan and Check in.
- Featured activity card with image or image placeholder.
- Featured reward card with image placeholder.
- Nearby or recommended UWELL store card.

Secondary fan pages:

- Activity Detail: image area, reward, location, steps, collapsed rules, back button.
- Reward Detail: image placeholder, point cost, level requirement, pickup method, back button.
- Store Detail: storefront photo, store level, address, navigation action, exposure/trust cues, back button.
- Guide / Invite / Old Fan Verification: accessible from Home modal or Me, not primary navigation.

Fan visual style:

- Yellow-green as the brand energy color.
- White, black, and neutral gray as structure colors.
- Product and activity imagery used selectively, not wallpaper everywhere.
- Growth progress, badges, chips, and level states create the game-like feeling.
- Text stays short; icons and images carry more of the interface.

## Store Portal Target Shape

Primary bottom navigation:

- Home
- Verify
- Activities
- Me

Home first screen:

- Store status and level.
- Today tasks.
- Verify shortcut.
- Active UWELL campaign.
- Photo and material readiness.

Verify:

- Scan fan QR.
- Manual fan ID or email fallback.
- Recent verification records.
- Clear rule: store users verify participation or pickup only; the system awards points after validation.

Activities:

- UWELL official campaigns.
- Store-created events.
- Store-created event reminder: approval is required, and not all materials, gifts, or costs are covered by UWELL.

Me:

- Store profile.
- Storefront photo for fan map trust.
- Display photos for level review.
- Regional warehouse and material requests.
- Language, settings, and logout.

Store visual style:

- Operational, clean, and high-contrast.
- Less playful than fan portal.
- Task-first layout.
- Minimal long copy.

## Admin Portal Target Shape

Admin uses desktop-first layout:

- Fixed left sidebar.
- Top role, region, language, and account area.
- Dashboard only shows overview and urgent tasks.
- Complex rules move into separate modules.

Core modules:

- Dashboard
- Stores
- Fans
- Rewards
- Scan Codes
- Materials
- Field Visits
- Reviews
- Risk Center
- Rules / Settings

Admin rules:

- Backend login has no public registration.
- Only admin can create accounts.
- Account creation must choose manager or field rep role.
- Field reps only see assigned-region warehouse inventory.
- Managers cannot create accounts.

## Cross-Portal Business Rules To Preserve

- UWELL unique code scanning, with anti-cheat validation.
- Fan scan limit: 3 scans per day.
- Fan points channels: scan, check-in, activities, community.
- Community points: like +1 up to 10 per day, comment +2 up to 5 per day, first post +10 per day.
- Activity participation closes through store verification or approved system logic.
- Store users do not manually grant arbitrary fan points.
- Rewards require points, fan level, stock, and eligible pickup logic.
- Store levels affect fan map exposure.
- S and A stores get better fan-facing recommendations.
- Inventory is managed by region warehouse.
- Configurable reward items and point costs can change in backend; core validation logic should stay stable.

## Implementation Method

The live portals must not be redesigned directly first.

Phase 1: Static preview shells

- Build isolated preview screens for fan, store, and admin.
- Use realistic data but do not wire every operation.
- Confirm layout, visual tone, navigation behavior, and information density.

Phase 2: Fan portal migration

- Replace the fan portal shell only after preview approval.
- Keep existing business logic as data source.
- Remove old tabs and old shell when the new fan shell goes live.
- Verify mobile, tablet, and desktop screenshots.

Phase 3: Store portal migration

- Repeat the same method for store portal.
- Do not migrate before the fan portal is accepted.

Phase 4: Admin portal migration

- Split admin modules cleanly.
- Dashboard stays overview-only.
- Rules, reviews, materials, and risk move into dedicated modules.

## Preview Acceptance Checklist

Every preview screen must pass this checklist before live migration:

- Main navigation behavior is correct.
- Fixed bottom navigation stays visible on fan and store pages.
- Secondary pages have a back button.
- No old tabs mixed with new bottom navigation.
- First screen is not text-heavy.
- Main action is visible without reading a paragraph.
- Mobile 390px screenshot passes.
- Tablet 768px screenshot passes.
- Desktop 1440px screenshot passes.
- No horizontal overflow.
- No obvious low-contrast core text or buttons.
- No content hidden behind fixed navigation.

## Immediate Next Step

Start with the fan portal preview, not the live portal.

The first preview batch should include:

- Fan Home
- Activity Detail
- Reward Detail
- Store Detail
- Me

After these are visually approved, build the remaining fan pages and then migrate the real fan portal.
