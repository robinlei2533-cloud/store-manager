# UWELL CRM Cross-portal Rules

Date: 2026-07-11
Status: Confirmed working rules for implementation planning

## Purpose

This document centralizes rules shared by the fan app, store app, admin console, and field ops workflows. It should be used as the implementation reference when page-specific specs conflict or omit a rule.

## Portal Separation

The three portals are separate user experiences:

- Fan app
- Store app
- Admin / field ops backend

Users should not become trapped inside another portal. Fan, store, and admin entry/login surfaces are separate. Backend login shows only login and never public registration.

## Languages

Trial scope:

- English default
- Arabic as the only second language

Arabic must support RTL. Other languages remain hidden until global rollout.

## Fixed System Logic

These rules are not normal admin settings.

- Reward redemption deducts Available points.
- Reward redemption does not deduct Lifetime growth points.
- Fan level is based on Lifetime growth points.
- Redeeming rewards never downgrades fan level.
- Store users never manually give points.
- Stores verify participation or pickup; the system awards points according to rules.
- One unique UWELL product code can only be claimed once.
- Same fan cannot earn duplicate points from the same activity.
- Backend staff accounts are created only by Admin.
- Manager and Field Rep users cannot create backend accounts.
- Region-based access control is mandatory for managers and field reps.
- All critical operations write Audit Log entries.

## Configurable Operational Parameters

Admin can configure these values:

- Scan points
- Daily counted scan limit
- Daily check-in points
- Community like/comment/post points
- Community daily limits
- Fan level thresholds
- Reward point costs
- Reward level requirements
- Reward stock and region eligibility
- Campaign reward points
- Campaign start/end time
- Campaign eligible stores
- Material low-stock thresholds by warehouse
- High-value reward review thresholds

## Review-required Changes

These changes require review and Audit Log:

- Store-created campaign point support
- High-value reward approval
- Store level adjustment
- Manual point adjustment
- Suspicious scan decision
- Community abuse point reversal
- Material request approval or rejection
- Cross-region material transfer in later phase

## Fan Levels

Fan levels use Lifetime growth points.

| Level | Lifetime growth points | Positioning |
|---|---:|---|
| Bronze | 0 | New fan |
| Silver | 300 | Active fan |
| Gold | 1000 | Highly active fan |
| Diamond | 5000 | Core fan |

Premium Diamond rewards can use a 10000-point threshold without creating a new fan level.

## Point Sources

Initial point channels:

| Channel | Initial rule |
|---|---|
| Scan | UWELL unique product scan, +5 points, counted up to 3 per day |
| Check-in | Daily check-in, +5 points |
| Activities | Configured per activity, store activities require verification |
| Community | Like +1 up to 10/day, comment +2 up to 5/day, first valid post +10/day |
| Invite Friends | Optional campaign or Me entry reward |
| Existing Fan Verification | Optional one-time approval reward |

## Activity Verification

Offline store activity participation requires store verification.

Flow:

1. Fan joins activity.
2. Fan visits store.
3. Fan shows member or activity QR.
4. Store scans fan QR in Verify.
5. Store confirms participation.
6. System validates rule, duplicate, timing, store, and risk state.
7. System awards points or creates a review item.

Store users do not choose arbitrary point amounts.

## Scan Code Rules

Product scan code rules:

- Product codes are globally unique.
- First valid claim earns points.
- Re-scanning an already claimed code earns no points.
- Another fan scanning a claimed code creates a suspicious record.
- Each fan can earn product scan points at most 3 times per day.
- Recognition can still work after the daily limit, but points are not awarded.

Supported code classes:

- UWELL unique product code
- Store event code
- Official activity code
- Fan center entry code
- Official website/social/community code
- Non-UWELL code, no points

## Reward Catalog

Reward items are configurable. Redemption logic is fixed.

Initial reward point draft:

| Reward | Initial points | Level | Review |
|---|---:|---|---|
| UWELL lanyard | 100 | Bronze+ | No |
| Single pod | 150 | Bronze+ | Region compliance check |
| Stickers / small merchandise | 150-200 | Bronze+ | No |
| Cap | 300 | Silver+ | No |
| T-shirt | 350 | Silver+ | No |
| Waist bag | 400 | Silver+ | No |
| UKUUKU IP doll | 600 | Silver+ | No |
| Multi-pod pack | 700-1000 | Gold+ | Region compliance check |
| Limited merchandise set | 1200 | Gold+ | No |
| UWELL gift box | 2000-3000 | Gold+ | Optional review |
| Sample device / trial device | 3000-4000 | Gold+ | Required |
| Product bundle | 4000-5000 | Gold+ / Diamond | Required |
| Sample big bundle | 5000-7000 | Diamond | Required |
| UWELL full material / collector set | 6000-8000 | Diamond | Required |
| Premium headphones | 8000-10000 | Diamond | Required |
| Phone or high-value electronics | 12000-20000 | Diamond | Required |
| One-week China trip | 10000-20000 | Diamond | Required |

Fan app must show locked rewards instead of hiding them when level or points are insufficient.

Reward cards reserve fixed image areas. Missing images use typed UWELL default artwork until final assets are supplied.

## Store Rating

Store rating uses a 100-point model.

| Dimension | Points |
|---|---:|
| Monthly sales | 20 |
| Location / traffic | 15 |
| Store front / signboard image | 10 |
| UWELL display quality | 15 |
| Product coverage | 15 |
| Staff cooperation | 10 |
| Campaign readiness | 10 |
| Photo / data completeness | 5 |

Monthly sales initial score:

| Monthly sales | Score |
|---|---:|
| 0 units | 0 |
| 1-2 units | 5 |
| 2-3 units | 10 |
| 3-4 units | 15 |
| 4-6+ units | 20 |

Suggested level:

| Score | Suggested level |
|---:|---|
| 90-100 | S |
| 75-89 | A |
| 60-74 | B |
| Below 60 | C |

Field Rep submits score and evidence. Manager reviews. Admin confirms final level. Final changes require reason and Audit Log.

## Store Exposure

Fan-facing store level wording:

- S: Featured
- A: Recommended
- B/C: normal listing without negative wording

S/A stores receive better map and activity exposure. Risk records can downrank or hide a store even if its level is high.

Store app exposure metrics in the first version:

- Views
- Navigation
- Verified visits

Only these event groups are required first:

- store_view
- store_navigate
- store_verified_visit

## Store Photos

Store photos have two categories.

Store Front Photo:

- Shown to fans on map and store details.
- Helps fans recognize the store front or signboard.
- Supports fan trust and visit intent.

Display Photos:

- Used by UWELL backend, managers, and field reps for level review.
- Shows product display, UWELL materials, campaign execution, and store quality.

Missing photo reminder:

- Prompt during first store setup.
- Remind for first three logins if missing.
- After third login, only show missing status in Me > Store Profile.

## Materials And Warehouses

Materials supports multiple regional warehouses from the first version.

Initial warehouses:

- Riyadh
- Dammam
- Jeddah

Inventory is tracked by warehouse. Total stock alone is not enough.

Material requests include:

- Requester
- Store
- Region
- Warehouse
- Material item
- Quantity
- Reason
- Campaign relation
- Priority
- Status

Field reps only see inventory and requests for their assigned region.

## Region Permissions

Admin:

- All regions
- All warehouses
- All users
- All reviews

Manager:

- Assigned regions only
- Assigned-region stores, visits, materials, reviews
- Cannot create backend accounts

Field Rep:

- Assigned region only
- Own or assigned visits
- Assigned-region material visibility
- Cannot approve requests
- Cannot modify inventory
- Cannot set final store level

## Reviews

Unified Reviews handles:

- Store campaign reviews
- High-value reward reviews
- Store level reviews
- Field visit reviews
- Scan risk reviews
- Store photo reviews
- Material request reviews
- Community reports

Statuses:

- Pending
- Approved
- Rejected
- Need More Info
- Escalated
- Expired

## Risk Center

Risk Center detects abnormal behavior and sends high-priority items to Reviews.

Initial risk rules:

- Invalid scan attempts over 10/day
- Same store verifications over 30/hour
- Manual verification ratio over 50%
- Same fan same activity duplicate attempt
- Duplicate comments over 5/day
- High-value reward request
- New account earns over 100 points on first day

## Audit Log

Audit Log records critical actions:

- Staff account creation / disable
- Store level changes
- Store photo reviews
- Campaign reviews
- Reward reviews
- Manual point adjustments
- Scan risk decisions
- Material inventory changes
- Material request decisions
- Field visit reviews
- Rule changes

Minimum fields:

- Actor
- Role
- Region where relevant
- Time
- Action type
- Target
- Before
- After
- Reason / note

## Email Rules

All account creation and registration flows require real-looking email format.

Reject:

- `123@123`
- `123@123.`
- malformed addresses without valid domain suffix

Production can later add OTP or email verification links.
