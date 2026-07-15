# UWELL CRM Fan Real Module Baseline Map

Date: 2026-07-15

## Purpose

This document maps the real existing fan app functions to the confirmed future fan information architecture.

It prevents future redesign work from deleting old functions or using the rejected preview page as the product baseline.

No code, page, database, or permission behavior is changed by this document.

## Current Fan Version

Safe committed baseline:

```text
Branch: codex/uwell-trial-ops-sync
Commit: eb87aae
Commit date: 2026-07-09 16:29:55 +0800
Commit subject: 优化粉丝活动展示内容
```

Current real fan app route:

```text
/fan-center
```

Current experimental fan preview route:

```text
/preview/fan
```

Decision:

- Real product baseline is `frontend/src/pages/fans`.
- `frontend/src/pages/preview` is not the product baseline.
- Future fan redesign must preserve real functions from `frontend/src/pages/fans` and reorganize them into the confirmed six navigation structure.

## Real Fan Source Files

| File | Role | Baseline Decision |
|---|---|---|
| `frontend/src/pages/fans/FanCenterPage.jsx` | Real fan shell, home, profile, secondary views, current bottom nav | Primary shell source, but needs IA cleanup |
| `frontend/src/pages/fans/tabs/CheckInTab.jsx` | Daily check-in and points | Keep function |
| `frontend/src/pages/fans/tabs/ScanTab.jsx` | Scan UWELL codes, manual input, scan records | Keep function, review uncommitted scan-rule changes carefully |
| `frontend/src/pages/fans/tabs/CampaignTab.jsx` | Activities, official tasks, store activities, reward rules copy | Keep function, redesign structure |
| `frontend/src/pages/fans/tabs/CommunityTab.jsx` | Community posts, likes, comments, point actions | Keep function, redesign into real feed |
| `frontend/src/pages/fans/tabs/MallTab.jsx` | Rewards mall, categories, redemption code, pickup/review rules | Keep function, redesign visual layout |
| `frontend/src/pages/fans/tabs/MapTab.jsx` | Store map, S/A/B/C filters, store details, storefront/display photos | Keep function, make it the Stores page |
| `frontend/src/pages/fans/tabs/InviteTab.jsx` | Invite friends, referral points summary | Keep as Me secondary entry, not main nav |
| `frontend/src/pages/fans/tabs/HowItWorksTab.jsx` | Help / guide | Keep as Me secondary entry or onboarding, not main nav |
| `frontend/src/pages/fans/ComplaintReplyPage.jsx` | Fan complaint/admin-related support page | Keep as backend/fan support reference, not fan main nav |
| `frontend/src/pages/fans/FanRulesPage.jsx` | Fan rules/admin operations | Backend/Admin reference, not fan-facing main nav |
| `frontend/src/pages/fans/ScanCenterPage.jsx` | Backend fan scan center | Backend/Admin reference, not fan-facing main nav |
| `frontend/src/pages/fans/FanGrowthPage.jsx` | Backend fan growth analytics | Backend/Admin reference, not fan-facing main nav |
| `frontend/src/pages/fans/FanListPage.jsx` | Backend fan list | Backend/Admin reference |
| `frontend/src/pages/fans/FanDetailPage.jsx` | Backend fan detail | Backend/Admin reference |

## Current Real Fan Navigation

Current `FanCenterPage.jsx` bottom navigation contains:

| Current Key | Current Label | Issue |
|---|---|---|
| `home` | Home | Keep, but simplify |
| `tasks` | Tasks | Should not be primary nav; merge into Home/Activities |
| `mall` | Rewards | Keep, rename route concept to Rewards |
| `stores` | Stores | Keep, must use real map/store page |
| `profile` | Me | Keep |

Current secondary views include:

| View Key | Function |
|---|---|
| `scan` | ScanTab |
| `mall` | MallTab |
| `invite` | InviteTab |
| `community` | CommunityTab |
| `campaigns` | CampaignTab |
| `oldfan` | Old fan verification |
| `map` | Store recommendations |
| `help` | HowItWorksTab |
| `checkin` | CheckInTab |
| `member` | Member/level section |

## Confirmed Future Fan Navigation

Future fixed bottom navigation:

1. Home
2. Activities
3. Community
4. Rewards
5. Stores
6. Me

Important:

- Daily Tasks is not a bottom nav item.
- Invite is not a bottom nav item.
- Help / How it works is not a bottom nav item.
- Old fan verification is not a bottom nav item.
- Scan is not a bottom nav item in the confirmed six-nav structure; it is a primary Home action and may also appear inside activity flows.

## Function Mapping

### Home

Home should contain daily entry points only.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Member level/points card | `FanCenterPage.jsx`, `CheckInTab.jsx` | Home top growth card | Yes |
| Daily check-in | `CheckInTab.jsx` | Home quick action and detail/secondary page | Yes |
| Scan UWELL Code | `ScanTab.jsx` | Home quick action and secondary scan page | Yes |
| Recommended activity | `CampaignTab.jsx` / `campaigns` localDb | Home one recommended activity | Yes |
| Recommended reward | `MallTab.jsx` / `MALL_ITEMS` | Home one small reward preview | Yes |
| Nearby/recommended stores | `MapTab.jsx` / stores localDb | Home small store entry | Yes |
| Long rules / steps | Current Home and Campaign copy | Remove from Home; move to details/collapsed rules | No as Home content |

Home should not contain:

- Long campaign steps.
- Full reward rules.
- Full map.
- Full community feed.
- Too many equal-weight cards.

### Activities

Activities should combine official engagement tasks and store activities.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Official article/website tasks | `CampaignTab.jsx` | Activities top quick tasks | Yes |
| Instagram/social task | `CampaignTab.jsx` | Activities top quick tasks | Yes |
| Like/comment/share official task | `CampaignTab.jsx` | Activities top quick tasks | Yes |
| Official campaigns | `CampaignTab.jsx` | Activities > Official | Yes |
| Store activities | `CampaignTab.jsx`, `filterFanVisibleStoreActivities` | Activities > Store Activities | Yes |
| Store activities empty state | `CampaignTab.jsx` | Activities > Store Activities | Yes |
| Reward tier guide currently in CampaignTab | `CampaignTab.jsx` | Move to Rewards or Help; not Activities main content | Move |

Activities UI rule:

- Top area: reading / like / comment / share point tasks.
- Main area: Official Activities and Store Activities as distinct sections or tabs.
- Store activity must support empty state.
- Store activities must clearly explain that points require store verification.

### Community

Community should look like a real feed.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Fan posts | `CommunityTab.jsx`, `community_posts` | Community feed | Yes |
| Official/seed posts | `CommunityTab.jsx` | Community feed, with official tag later | Yes |
| Publish post | `CommunityTab.jsx` | Community top composer | Yes |
| Like points | `CommunityTab.jsx`, `community_point_actions` | Community interactions | Yes |
| Comment points | `CommunityTab.jsx`, `community_comments` | Community interactions | Yes |
| First post points | `CommunityTab.jsx` | Community composer | Yes |
| Daily point limit explanation | `CommunityTab.jsx` | Small hint only, not main content | Yes, reduced |

Community UI rule:

- Most of the page should be posts and publishing.
- Points rules should be a small helper, not the main page.

### Rewards

Rewards should remain a point mall.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Category filters | `MallTab.jsx`, `MALL_ITEMS` | Rewards category/grid layout | Yes |
| Reward cards | `MallTab.jsx` | Rewards grid | Yes |
| Redeem action | `MallTab.jsx`, `addFanPoints`, `createRewardRedemptionRemote` | Rewards | Yes |
| Redemption code modal | `MallTab.jsx` | Rewards result modal | Yes |
| Available points display | `MallTab.jsx`, fan data | Rewards header | Yes |
| Pickup/review rules | `MallTab.jsx` | Collapsed or small helper | Yes, reduced |
| Reward tier guide from CampaignTab | `CampaignTab.jsx` | Rewards guide/helper, not Activities | Move |

Rewards UI rule:

- Use category or Amazon-like mall grid.
- Reserve image slots for every reward.
- Show level lock / points insufficient / review required / stock state.
- Do not overuse tier cards as the primary layout.

### Stores

Stores should use the real map module.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Leaflet/OpenStreetMap display | `MapTab.jsx` | Stores main map | Yes |
| Store level filters | `MapTab.jsx` | Stores filters | Yes |
| S/A/B/C store level behavior | `MapTab.jsx`, `uwellLaunchRules` | Stores ranking/exposure | Yes, review rules |
| Store details | `MapTab.jsx` | Stores detail panel | Yes |
| Storefront photo | `MapTab.jsx`, `store_display_uploads` | Stores detail | Yes |
| Display photos | `MapTab.jsx` | Backend/store review context; fan detail only if useful | Review |
| Store recommendation cards from Home | `FanCenterPage.jsx` | Home shortcut into Stores | Yes |

Stores UI rule:

- Store map must not be replaced by recommendation cards only.
- S/A stores show as Featured/Recommended.
- B/C stores can be listed normally without negative wording.
- Store detail should support navigation action later.

### Me

Me is the account and secondary-function center.

| Existing Function | Source | Future Placement | Keep? |
|---|---|---|---|
| Profile card | `FanCenterPage.jsx` | Me | Yes |
| Level and benefits | `FanCenterPage.jsx`, `FAN_LEVELS` | Me | Yes |
| Points history | `FanCenterPage.jsx`, `fan_points_log` | Me | Yes |
| Reward history | `mall_redemptions` | Me secondary section | Needed, may need UI |
| Scan history | `ScanTab.jsx`, `scan_records` | Me secondary section or Scan detail | Yes |
| Activity history | `fan_engagement_tasks`, campaign records | Me secondary section | Needed |
| Invite friends | `InviteTab.jsx` | Me secondary entry / Home popup when campaign active | Yes |
| Old fan verification | `FanCenterPage.jsx` oldfan view | Me secondary entry if not verified | Yes |
| New user guide/help | `HowItWorksTab.jsx` | Me secondary entry/onboarding | Yes |
| Language | `languageStore`, LanguageSwitcher | Me settings | Yes |

Me should not become a large marketing page. It should be account, progress, histories, and secondary utilities.

## Features That Must Not Be Lost

These functions existed in the real app and must be preserved during redesign:

- Fan login/registration entry.
- Fan profile recovery or login redirect.
- Level and points display.
- Daily check-in and duplicate check prevention.
- Scan with camera/manual fallback.
- UWELL unique code / invalid / duplicate / claimed / daily limit handling.
- Recent scan records.
- Rewards category mall.
- Reward redemption.
- Redemption pickup code display.
- A/S or S store pickup rule.
- High-value reward review concept.
- Invite friends and invite points summary.
- Community post, like, comment.
- Community daily point limits.
- Official engagement tasks.
- Store activities.
- Store activity empty state.
- Store map with S/A/B/C store visibility.
- Storefront photo support.
- Old fan verification.
- Help/new user guide.
- English default and future Arabic support.

## Current Conflicts To Fix Later

| Conflict | Current Evidence | Required Direction |
|---|---|---|
| Bottom nav has only five items | `Home / Tasks / Rewards / Stores / Me` | Six nav: Home / Activities / Community / Rewards / Stores / Me |
| Tasks is a main nav item | `tasks` current nav | Remove Tasks from main nav; merge into Home/Activities |
| Community is secondary only | `community` in secondary view | Promote to main nav |
| Activities is secondary only | `campaigns` in secondary view | Promote to main nav as Activities |
| Scan is not in bottom nav | Current secondary/Home action | Keep as Home primary action, not bottom nav |
| Reward rules appear in Activities | `CampaignTab.jsx` reward tier guide | Move to Rewards/help |
| Home has too many equal cards/steps | `FanCenterPage.jsx` task/campaign/steps sections | Simplify Home |
| Preview page exists as separate fan UI | `/preview/fan` | Do not use as baseline |
| Global CSS may override all portals | `frontend/src/index.css` large diff | Scope future styles |

## File Risk Classification For Fan Work

### Primary files to review first

- `frontend/src/pages/fans/FanCenterPage.jsx`
- `frontend/src/pages/fans/tabs/CheckInTab.jsx`
- `frontend/src/pages/fans/tabs/ScanTab.jsx`
- `frontend/src/pages/fans/tabs/CampaignTab.jsx`
- `frontend/src/pages/fans/tabs/CommunityTab.jsx`
- `frontend/src/pages/fans/tabs/MallTab.jsx`
- `frontend/src/pages/fans/tabs/MapTab.jsx`
- `frontend/src/pages/fans/tabs/InviteTab.jsx`
- `frontend/src/pages/fans/tabs/HowItWorksTab.jsx`

### Files to avoid as baseline

- `frontend/src/pages/preview/FanPreviewPage.jsx`
- `frontend/src/pages/preview/fan-preview.css`
- `frontend/src/pages/preview/fan-preview-data.js`

### Files to touch only after explicit task confirmation

- `frontend/src/index.css`
- `frontend/src/services/db/localDb.js`
- `frontend/src/services/db/seedData.js`
- `frontend/src/utils/fanPointsRules.js`
- `frontend/src/utils/uwellLaunchRules.js`
- `frontend/src/utils/uwellClosedLoop.js`
- `frontend/src/utils/constants.js`
- `frontend/src/utils/translations.js`

Reason:

- These files affect global UI, database, business rules, store exposure, or language.

## Recommended Next Task

Task-005 should be:

```text
Fan Navigation And Function Preservation Plan
```

Goal:

- Define exact fan navigation state model.
- Decide which current views become main tabs.
- Decide which views become secondary pages.
- Decide which current code changes should be kept before implementation.
- Produce a file-by-file implementation plan for the fan app only.

Task-005 should still wait for user confirmation before changing code.

## Final Baseline Decision

Future fan redesign must:

1. Start from real fan modules under `frontend/src/pages/fans`.
2. Preserve all old confirmed functions.
3. Reorganize them into Home / Activities / Community / Rewards / Stores / Me.
4. Keep fixed bottom navigation.
5. Keep back behavior on secondary pages.
6. Avoid using preview fan code as the product base.
7. Avoid broad global CSS changes until the fan structure is confirmed.

