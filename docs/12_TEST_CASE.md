# UWELL CRM Test Case And Checklist

## Test Principle

Testing must prove that the product rule still works after a change. Passing build alone is not enough.

## Required Checks After Development

- UI consistency
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
- Detail pages have a back button.
- Home is not text-heavy.
- Check-in duplicate behavior is handled.
- Scan handles valid, invalid, duplicate, claimed, daily limit.
- Activities separate official and store activities.
- Store activities require verification before points.
- Community looks like a feed and respects daily point limits.
- Rewards deduct available points only.
- Redemption does not reduce lifetime level.
- Stores page includes map/store discovery behavior.
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

