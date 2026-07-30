# UWELL CRM Test Case And Checklist

## Test Principle

Testing must prove that the product rule still works after a change. Passing build alone is not enough.

## Required Checks After Development

- UI consistency
- Real page QA evidence for UI / experience changes
- Visual asset rendering, uniqueness, and broken-asset checks when images/videos changed
- Business logic
- Database impact
- Permission impact
- Exception cases
- Related tests
- Build if frontend code changed

## Standard Commands

From `frontend`:

```bash
npm test
npm run build
```

Do not run dependency installation commands unless the user explicitly approves.

## Fan App Checklist

- Fixed bottom nav is visible on main pages.
- Fixed bottom nav does not cover primary actions, cards, map controls, or the last visible content.
- Detail pages have a back button.
- Home is not text-heavy.
- UI changes are checked on the real fan route, not `/preview/fan`.
- Image/video slots are not empty placeholders unless the empty state is intentional.
- Repeated images are allowed only when the same object is intentionally repeated; unrelated cards/sections need distinct visuals.
- New visual assets use UWELL official or credible public sources first, and project-local mockups only when suitable real assets are unavailable.
- Visual QA records image count, unique source count, broken image count, horizontal overflow, and mobile/desktop screenshots.
- Check-in duplicate behavior is handled.
- Scan handles valid, invalid, duplicate, claimed, daily limit.
- Activities separate official and store activities.
- Store activities require verification before points.
- Community looks like a feed and respects daily point limits.
- Rewards deduct available points only.
- Redemption does not reduce lifetime level.
- Daily routine points cap is respected when implemented.
- Points source categories remain clear: check-in, scan, activity, community, invite, old fan, correction.
- Membership level is based on lifetime growth, not available points.
- Reward tiers are displayed without hiding locked rewards.
- Activities have current/fresh content states when campaign freshness is implemented.
- Stores page includes map/store discovery behavior.
- Stores page keeps the real map/store discovery behavior and does not replace it with cards only.
- Fan-facing S Stores appear as `UWELL Brand Store` and do not expose internal S Store operating fields.
- Me shows histories and secondary entries.

## Store App Checklist

- Fixed bottom nav is visible.
- Home is a practical workbench.
- Verify supports scan and manual fallback.
- Store cannot manually give points.
- Store activity submission shows UWELL cost/material reminder.
- Store photos distinguish storefront and display photos.
- Store only sees own data.

## Backend Checklist

- Dashboard is segmented by data area.
- Admin can access all modules.
- Manager is region-scoped.
- Field Rep is assigned-region/store scoped.
- Only Admin can create Manager/Rep accounts.
- Reviews and Risk Center are separate.
- Materials support warehouse/region concept.
- Audit Log records critical operations.
- Reviews V1 covers the confirmed high-impact review types when implemented.
- Risk Center V1 records scan, points, reward, and S Store data risks when implemented.
- High/Critical risk decisions write Audit Log when implemented.
- Forbidden actions are blocked even if called outside the visible UI.

## Database Checklist

- No schema change without confirmed migration.
- No rule duplicated in page state and database config.
- Supabase and local fallback behavior are clear.
- Seed data changes are documented.
- RLS impact is reviewed.

## Exception Checklist

- Empty state
- Loading state
- Network failure
- Permission denied
- Duplicate action
- Invalid input
- Mobile small screen
- Arabic/RTL future impact where relevant
