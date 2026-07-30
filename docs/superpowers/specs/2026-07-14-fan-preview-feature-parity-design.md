# UWELL Fan Preview Feature Parity Design

## Goal

The fan preview is an upgrade of the existing fan website, not a replacement demo. Existing fan-side functions must stay available while the layout, UI hierarchy, fixed bottom navigation, and operation logic are improved.

## Locked Bottom Navigation

| Navigation | Purpose |
|---|---|
| Home | Daily high-frequency actions and recommendations |
| Activities | Official campaigns and store events |
| Community | Posts, likes, comments, and community points |
| Rewards | Reward mall, redemption, locks, and pickup status |
| Store Map | Map, nearby stores, recommended S/A stores, navigation |
| Me | Account, records, invite, verification, guide, help, language |

## Existing Function Placement

| Existing fan function | Current source | New placement | Required treatment |
|---|---|---|---|
| Daily check-in | `CheckInTab.jsx` | Home primary action, Me records | Home shows the action clearly as Daily Check-in; details keep streak, week calendar, points, and level progress. |
| Product scan | `ScanTab.jsx` | Home primary action, Scan secondary page, Me scan history | Scan must keep camera/manual entry, UWELL code recognition, duplicate handling, suspicious scan, and 3 counted scans per day. |
| Rewards mall | `MallTab.jsx` | Rewards, Home recommended rewards, Me redemption history | Keep categories, inventory, pickup code, pickup rules, pending review for luxury rewards, and available-points spending only. |
| Invite friends | `InviteTab.jsx` | Me secondary entry, optional Home campaign popup later | Keep referral code/link, invite count, copied link feedback, and +50 point campaign rule. |
| Community | `CommunityTab.jsx` | Community | Keep posting, likes, comments, and counted point limits. |
| Help / how it works | `HowItWorksTab.jsx` | Me secondary entry and first-use guide | Keep scan, check-in, activities, community, levels, invite, and existing fan verification explanations, but show them as short guide cards or accordions. |
| Store map | `MapTab.jsx` | Store Map | Keep real map area, S/A/B/C filters, recommended exposure order, navigate links, storefront photo, display photos, and reward/activity store tags. |
| Campaigns / activities | `CampaignTab.jsx` | Activities, Home featured activity | Keep official campaigns, store activities, engagement tasks, activity details, rewards, location, and store verification flow. |
| Existing fan verification | `FanCenterPage.jsx` oldfan view | Me secondary entry | Keep proof upload/review entry. Do not put it in bottom navigation. |
| Points history | `FanCenterPage.jsx`, `fan_points_log` | Me | Keep all earning and spending records visible. |
| Member level / growth rules | `CheckInTab.jsx`, rules files | Home and Me | Home shows level/progress; Me keeps benefits and rule details. |
| Complaint / feedback | `ComplaintReplyPage.jsx` | Me secondary entry | Keep entry if enabled in current fan flow; do not expose as a main tab. |

## Progress.md Confirmed Functions

`PROGRESS.md` is the source of truth for what already existed before the preview rebuild. The preview must not lose these items:

| Confirmed progress item | New placement | Required treatment |
|---|---|---|
| UWELL Knowledge Hub activity module | Activities | Official activity area must include article reading, Instagram viewing, and like/comment/share tasks. |
| Official article task | Activities, Home featured task | Opens `https://www.myuwell.com/news/all`, requires a 10-second visible stay, then allows points claim once per day. |
| Instagram viewing task | Activities | Opens `https://www.instagram.com/uwell.tech/`, requires a 10-second visible stay, then allows points claim once per day. |
| Like/comment/share engagement task | Activities or Community bridge | Keeps points logic and duplicate prevention; do not replace it with vague campaign steps. |
| Store activity applications | Activities | Approved store activities from Store Center must appear to nearby fans by city; pending/rejected activities stay hidden. |
| Campaign detail copy simplification | Activities | Activity cards/details show concrete facts: time range, organizer, location, reward/benefit, and status. Do not show invented Step 1/2/3 copy for official campaigns. |
| Reward pickup closure | Rewards, Store Map, Me history | Redemption code must stay visible, reward pickup requires eligible store verification, and S-level pickup rules remain explicit. |
| Local fallback for point grants | Check-in, Activities, Rewards | Check-in and activity point grants must keep working in local trial even if remote point writes fail. |
| Mobile scan guidance | Scan secondary page | Scan explains camera support on mobile and manual code entry on desktop/unsupported browsers. |
| Fan registration country/city, age, privacy/terms | Fan entry, Me profile | Keep as part of real migration; not necessary inside the isolated preview shell except as account profile signals. |

## Implementation Priority From Progress.md

1. Store Map parity: bring the map-first mental model back into the preview, not just store cards.
2. Home clarity: rename and group old high-frequency actions so fans understand what each entry does.
3. Activities parity: restore the Knowledge Hub, official links, 10-second claim logic, and approved store activity visibility.
4. Rewards parity: restore the pickup-code and S-level store verification story as a clear fan-facing flow.
5. Me parity: expose records, invite, old fan verification, guide/help, and language/account controls.

## Home Layout Correction

Home must be clear to a first-time fan. It should not read as a set of anonymous cards.

Required Home sections:

1. Member growth: level, available points, lifetime progress, next level.
2. Today actions: Daily Check-in, Scan Code, Join Activity.
3. Featured activity: one campaign with image, reward, and CTA.
4. Nearby store: one S/A or nearby store, clearly linked to Store Map.
5. Popular rewards: 2-3 rewards, clearly linked to Rewards.

Home must avoid long rule copy. Rules move into detail pages, Me guide, or collapsed sections.

## Acceptance Checks

- Every existing fan function above has a visible home, tab, or Me entry.
- The bottom navigation label is `Store Map`, not `Stores`.
- Home action names are explicit: `Daily Check-in`, `Scan Code`, `Join Activity`.
- Store Map is not only a list; it must represent map, filters, nearby stores, and navigation.
- New preview pages must not mix old tabs with the new bottom navigation.
- Feature additions must be preview-first until the user approves migration into the real fan center.
