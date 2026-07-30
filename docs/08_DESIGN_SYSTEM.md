# UWELL CRM Design System

## Design Direction

The confirmed direction is **UWELL yellow-green, youthful, energetic, and game-growth oriented** for fan-facing surfaces.

The store app uses the same brand family but must feel more practical and work-focused.

The backend uses the same brand accents but must remain an operations console.

## Color Principles

| Role | Usage |
|---|---|
| UWELL Yellow | Primary actions, rewards, points, key highlights |
| Neon/Active Green | Growth, progress, approved, active, success |
| Charcoal/Black | Brand contrast, text, premium weight |
| White/Light Gray | Readable surfaces |
| Orange/Red | Warning, rejected, risk, overdue |

## Typography

- Keep English-first copy short.
- Arabic is the only second language and must support RTL.
- Do not use oversized hero text inside compact panels.
- Body text must be readable and high contrast.

## Layout Rules

- Fan and store apps must have fixed bottom navigation.
- Fixed bottom navigation must not cover primary actions, maps, cards, or the last meaningful content.
- Secondary/detail pages must have a clear back button.
- Mobile core buttons must be at least 44px high.
- Cards cannot be nested inside other cards.
- One screen should not contain more than three major explanation blocks.
- Long rules should be collapsed.
- Home pages must prioritize actions, not documentation.

## Visual Asset Rules

- UI upgrades must be based on real page QA before design changes.
- Every planned image/video must have a named page slot, purpose, source, final file path, and fallback.
- Use UWELL official website, official download/material pages, official social channels, or credible public references before creating mockups.
- Project-local mockups are allowed only when suitable real assets are unavailable, and they must not pretend to be official product photography.
- Do not fill unrelated cards or sections with the same repeated image.
- Every visual upgrade must name the exact slot, the exact asset source, and a distinct fallback per slot. One asset may not silently serve multiple unrelated slots unless the user explicitly approves that reuse.
- Empty placeholders should be temporary only; if a page is being visually upgraded, concrete assets must be added or the slot should be removed.
- After asset changes, verify rendered asset count, unique asset count, broken assets, mobile fit, desktop fit, and horizontal overflow.

## Fan Visual Slot Discipline

Every fan-facing UI task that adds, replaces, removes, resizes, or repositions media must include a visual slot table before implementation. Each slot must be written separately with:

- page and region, such as `Community hero`, `Stores result card`, or `Rewards product card`;
- purpose, such as product education, store discovery, reward browsing, or account support;
- primary source and source type: UWELL official, official social/download material, credible public reference, or project-local mockup;
- final project path when the asset is local;
- distinct fallback asset for that exact slot;
- intended desktop and mobile aspect ratio or fixed size;
- placement rule explaining what the image must not cover.

Fan media rules:

- Images and videos must support the page task. They are not decoration for filling empty space.
- Product pages should use official product or campaign visuals when available.
- Store discovery should use real store, display, shelf, storefront, or credible vape retail references before local mockups.
- If no suitable real store asset is available, create at least two local mockup directions: storefront/exterior and shelf/interior.
- Do not reuse a previous task's image pool as the default answer for a new page upgrade. Reuse is allowed only when the slot, purpose, and user approval are explicit.
- A visual cannot cover, crowd, or sit under text, CTAs, forms, maps, bottom navigation, avatars, status chips, or store trust labels.
- Mobile images must have stable dimensions. Large banner media must become short strips or thumbnails when the page's primary job is an action, feed, map, or account tool.
- Full-width media is allowed only when it is the primary page story. It is not allowed above maps, task buttons, forms, or account summaries if it pushes the real workflow below the first screen.
- Final QA must count total rendered media, unique media sources, broken media, navigation overlap, text overlap, horizontal overflow, and mobile/desktop fit.

## Fan UI Rules

- Use visual hierarchy: level, points, next action.
- Use images/icons where they clarify, not as decoration.
- Home should show check-in, scan, activity, rewards, nearby stores clearly.
- Activities should separate official tasks and store activities.
- Community should look like a real feed.
- Rewards should use category/grid mall layout with image slots.
- Stores must include map/store discovery behavior.
- S Stores should be presented to fans as `UWELL Brand Store`, with concise trust signals such as official display, trained staff, reward pickup, and new product experience.
- Fan-facing store labels should avoid negative wording for lower store levels.

## Store UI Rules

- Home is a workbench.
- Verify must be fast and obvious.
- Activities must explain UWELL official campaigns vs store-created events.
- Store photo upload should be a setup/status flow, not a main nav item.
- S Store reporting should be lightweight and work-focused: sell-through, inventory, material inventory, and submission history.

## Backend UI Rules

- Dashboard must be segmented.
- Tables, filters, status tags, review queues must be consistent.
- Do not create decorative big-screen dashboard visuals.
- Review and risk status must be easy to scan.
- S Store Management should feel like an operations module, not a marketing page. It should prioritize S Store health, sell-through, inventory risk, replenishment, field visits, and contribution data.

## Contrast Rule

Core text and buttons must meet readable contrast. Avoid:

- White text on pale yellow/green
- Black panels with low-contrast gray text
- Transparent text fields with unreadable placeholder text
