# UWELL CRM Fan Navigation Implementation Plan

Date: 2026-07-15

## Purpose

This document defines the implementation plan for upgrading the real fan app navigation and page structure.

It does not change code. It is the confirmed plan that should be reviewed before coding.

## Baseline

Safe committed code baseline:

```text
Branch: codex/uwell-trial-ops-sync
Commit: eb87aae
Commit date: 2026-07-09 16:29:55 +0800
Commit subject: 优化粉丝活动展示内容
```

Real fan source:

```text
frontend/src/pages/fans
```

Not product baseline:

```text
frontend/src/pages/preview
```

## Goal

Upgrade the real fan app from the current mixed structure into the confirmed six-navigation structure:

```text
Home / Activities / Community / Rewards / Stores / Me
```

The work must preserve existing fan functions:

- Check-in
- Scan
- Official activities
- Store activities
- Community
- Rewards mall
- Store map
- Invite friends
- Old fan verification
- Help / new user guide
- Points, scan, reward, activity histories where available

## Product Rules

- Do not rebuild from the preview fan page.
- Do not remove old confirmed functions.
- Do not add new business logic during navigation cleanup.
- Do not change database schema.
- Do not change permissions.
- Do not modify store app or backend in this phase.
- Do not continue broad global CSS patching.
- Bottom navigation must remain fixed.
- Secondary pages must have a clear back button.

## Current Problem

Current real fan nav has:

```text
Home / Tasks / Rewards / Stores / Me
```

Problems:

- Activities is not a main navigation item.
- Community is not a main navigation item.
- Tasks should not be a main navigation item.
- Scan/check-in/invite/help/old fan verification are not consistently placed.
- Home contains too many explanations and cards.
- Reward rules appear in activity page.
- Preview page has caused confusion and should not guide product implementation.

## Target IA

### Home

Purpose:

Daily action hub.

Contains:

- Member growth card: level, available points, next level/progress.
- Quick actions: Check-in, Scan, Join Activity.
- One recommended activity.
- One recommended reward.
- Nearby/recommended store entry.

Does not contain:

- Full activity list.
- Full reward rules.
- Full community feed.
- Long campaign steps.
- Full map.

### Activities

Purpose:

Official tasks and store activities.

Contains:

- Top engagement tasks: read, like/comment/share, social/official tasks.
- Official activities section.
- Store activities section.
- Store activities empty state.
- Activity detail with image/placeholder, reward, location, steps, collapsed rules.
- Store activity verification explanation: store verifies, system awards points.

Source:

- `CampaignTab.jsx`

### Community

Purpose:

Real social feed.

Contains:

- Post composer.
- Official/fan post feed.
- Like/comment actions.
- Small point-rule hint.
- Daily point limit handling.

Source:

- `CommunityTab.jsx`

### Rewards

Purpose:

Point mall.

Contains:

- Category filters.
- Reward grid.
- Fixed image slots.
- Available / insufficient points / level locked / review required states.
- Redemption code modal.
- Store pickup rule helper.

Source:

- `MallTab.jsx`

### Stores

Purpose:

Store map and store discovery.

Contains:

- Real map.
- Store level filters.
- S/A Featured/Recommended logic.
- B/C normal listing.
- Store detail panel.
- Storefront photo where available.
- Navigation action later.

Source:

- `MapTab.jsx`

### Me

Purpose:

Account, progress, history, secondary tools.

Contains:

- Profile card.
- Level/growth.
- Available points and lifetime points where available.
- Points history.
- Reward history.
- Scan history.
- Activity history.
- Invite friends.
- Old fan verification.
- New user guide/help.
- Language/settings/logout.

Sources:

- `FanCenterPage.jsx`
- `InviteTab.jsx`
- `HowItWorksTab.jsx`
- old fan verification render function.

## File-level Implementation Plan

### Phase 1: Navigation Shell

Files:

- `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Replace current bottom nav items with:
  - `home`
  - `activities`
  - `community`
  - `rewards`
  - `stores`
  - `me`

Mapping:

| New key | Source view/component |
|---|---|
| `home` | `renderHome()` |
| `activities` | `CampaignTab` |
| `community` | `CommunityTab` |
| `rewards` | `MallTab` |
| `stores` | `MapTab` or `renderStores()` using `MapTab` |
| `me` | `renderProfile()` / new account center composition |

Keep:

- Fixed bottom nav.
- Active nav state.
- Secondary back behavior.

Remove from main nav:

- `tasks`
- `mall` as key name, replaced by `rewards`
- `profile` as key name, replaced by `me`

Do not remove underlying functions.

### Phase 2: Home Cleanup

Files:

- `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Keep Home light and action-first.
- Reduce repeated cards and long step explanations.
- Use existing handlers:
  - check-in opens `checkin` secondary or triggers current check-in flow.
  - scan opens scan secondary.
  - activity opens Activities.
  - reward opens Rewards.
  - store opens Stores.

Do not:

- Add new business rules.
- Add long text.
- Add large marketing banner stack.

### Phase 3: Activities Main Page

Files:

- `frontend/src/pages/fans/tabs/CampaignTab.jsx`
- possibly `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Use `CampaignTab` as the new `activities` main page.
- Make page structure match:
  - engagement tasks top
  - Official Activities
  - Store Activities
  - empty state
  - details modal/page

Move later:

- Reward tier guide should move out of Activities into Rewards/help.

Do not:

- Remove official tasks.
- Remove store activities.
- Remove 10-second task logic unless separately confirmed.

### Phase 4: Community Main Page

Files:

- `frontend/src/pages/fans/tabs/CommunityTab.jsx`
- `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Promote `CommunityTab` from secondary view to bottom nav main page.
- Keep post composer, posts, likes, comments, point actions.
- Reduce rule explanation density.

Do not:

- Remove daily limits.
- Remove duplicate/self-like prevention.

### Phase 5: Rewards Main Page

Files:

- `frontend/src/pages/fans/tabs/MallTab.jsx`
- `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Use `MallTab` as `rewards`.
- Keep category filters and redemption code logic.
- Keep pickup/review rule.
- Later UI should move toward mall/grid layout with image slots.

Do not:

- Remove redemption modal.
- Remove session-stored redemption result until reviewed.
- Change points deduction logic.

### Phase 6: Stores Main Page

Files:

- `frontend/src/pages/fans/tabs/MapTab.jsx`
- `frontend/src/pages/fans/FanCenterPage.jsx`

Change:

- Use real `MapTab` as `stores`.
- Ensure Stores is map-first, not recommendation-card-only.
- Keep S/A/B/C store filtering and selected store detail.

Do not:

- Replace map with cards only.
- Remove S/A/B/C visibility logic.

### Phase 7: Me Page

Files:

- `frontend/src/pages/fans/FanCenterPage.jsx`
- `frontend/src/pages/fans/tabs/InviteTab.jsx`
- `frontend/src/pages/fans/tabs/HowItWorksTab.jsx`

Change:

- Make `me` the account center.
- Keep:
  - profile
  - level
  - points records
  - invite
  - old fan verification
  - guide/help
  - settings/language/logout

Do not:

- Put invite/help/old fan verification in bottom nav.
- Hide old fan verification if fan is not verified.

## Styling Plan

Primary rule:

- Do not continue broad global patching in `frontend/src/index.css`.

Preferred:

- Reuse existing fan classes where possible.
- If new fan styles are needed, use clearly scoped `.fan-...` selectors.
- Avoid changing admin/store global surfaces.

High-risk file:

- `frontend/src/index.css`

Any change to this file must be reviewed separately.

## Database Impact

Expected:

- No database schema change.
- No Supabase migration.
- No RLS change.
- No local DB version change.

Existing tables/functions continue to be used:

- `fans`
- `fan_points_log`
- `fan_checkins`
- `scan_records`
- `qr_codes`
- `mall_redemptions`
- `community_posts`
- `community_comments`
- `community_point_actions`
- `fan_engagement_tasks`
- `campaigns`
- `store_display_uploads`
- `stores`
- `old_fan_verifications`

## Other Page Impact

Expected:

- Only `/fan-center` should change.

Must not affect:

- `/preview/fan`
- `/store-owner`
- `/admin`
- `/app/*`

Risk:

- Global CSS changes can affect all portals.
- Route changes in `App.jsx` can affect page entry.

Avoid:

- Route changes.
- Global theme changes.
- Store/backend file edits.

## Acceptance Criteria

### Functional

- Six bottom nav items exist:
  - Home
  - Activities
  - Community
  - Rewards
  - Stores
  - Me
- Bottom nav is fixed and visible on main pages.
- Home opens clearly.
- Activities opens official/store activity functions.
- Community opens real feed.
- Rewards opens category mall and redemption.
- Stores opens real map.
- Me opens profile/account center.
- Check-in and Scan remain accessible from Home.
- Invite, old fan verification, and help remain accessible from Me.
- No old function is removed.
- `/preview/fan` is not used as the real app.

### UI

- Home is lighter and action-first.
- Text density is lower.
- Detail/secondary views have a back button.
- No duplicate main nav functions.
- No obvious mixed old/new navigation.

### Safety

- No database migration.
- No permission change.
- No store/backend UI change.
- No global CSS overhaul.

## Test Plan

After implementation, run:

```bash
cd "C:\Users\陈木木的\Documents\Uwell CRM网站\uwell-crm\frontend"
npm test
npm run build
```

Suggested focused checks:

- Fan center static tests.
- CheckInTab tests.
- ScanTab tests.
- CampaignTab tests.
- CommunityTab tests.
- MallTab tests.
- MapTab tests.

Manual browser checks:

- Mobile 390px.
- Tablet 768px.
- Desktop 1440px.

Required screenshots:

- Home
- Activities
- Community
- Rewards
- Stores
- Me

## Development Order Recommendation

Do not implement everything in one massive edit.

Recommended code tasks:

1. Fan nav shell only.
2. Home cleanup only.
3. Activities page structure only.
4. Community promotion only.
5. Rewards preservation and layout only.
6. Stores map preservation only.
7. Me secondary entries only.
8. Screenshot/test pass.

Each task should be reviewable separately.

## Next Step

If the user confirms implementation, start with:

```text
Task-006: Fan Navigation Shell Implementation
```

Task-006 should modify only:

- `frontend/src/pages/fans/FanCenterPage.jsx`

Potentially:

- focused tests under `frontend/src/pages/fans`

Task-006 should not modify:

- database files
- store app
- backend app
- preview fan page
- global CSS unless confirmed

