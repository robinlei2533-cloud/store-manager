# UWELL CRM Admin And Field Ops Redesign Design

Date: 2026-07-10
Status: Draft for user review

## Goal

Update the admin and field management backend so it can operate the redesigned fan app and store app. The backend must manage fan points, reward rules, scan codes, store levels, store exposure, store-created activities, and field visit scoring.

The backend should become a practical UWELL operations console, not only a CRM list view.

## Core Principles

- Default language is English.
- Arabic is the only second language for the trial version and must support full RTL layout.
- Other languages are hidden for now.
- Admin and manager users need clear review queues and rule controls.
- Field reps need visit workflows, not just a store list.
- Store levels shown to fans and stores must be reviewed and controllable by the backend.
- Suggested levels from field visits are not final until backend review.

## Main Admin Navigation

Recommended main navigation:

1. Dashboard
2. Stores
3. Fans
4. Campaigns
5. Rewards
6. Scan Codes
7. Materials
8. Field Visits
9. Reviews
10. Risk Center
11. Settings

Rewards and Scan Codes must be independent modules.

Rewards is not a materials module because it controls fan redemption, levels, pickup rules, store verification permission, and luxury reward approval.

Scan Codes is not a fan or product sub-page because it controls anti-fraud, product unique codes, campaign codes, scan records, and suspicious scan review.

## Dashboard

Dashboard should be an operations to-do center plus data overview.

First screen:

1. Pending review queue
   - Pending store event reviews
   - Pending display reviews
   - Pending Diamond reward approvals
   - Suspicious scan codes
   - Fan complaints
   - Store level review requests
   - Field visit rating reviews

2. Today metrics
   - Today scans
   - Today check-ins
   - Today reward verifications
   - Today community actions
   - Active campaigns

3. Store operations
   - A/S stores
   - Stores needing display review
   - Stores with low exposure
   - Stores with risk flags
   - New stores awaiting level confirmation

4. Fan operations
   - Active fans
   - New fans
   - Diamond fans
   - Suspicious fans

5. Exposure performance
   - Fan Home recommended store clicks
   - Map navigation clicks
   - Store event joins
   - Reward pickup conversions

## Stores Module

Tabs:

1. Store list
2. Level review
3. Display review
4. Exposure control

### Store list

Manage store basics:

- Store name
- Address / city
- Contact
- Store owner account
- Current level
- Status
- Assigned field rep
- Recent visit
- Recent display status
- Recent reward verification status

### Level review

Review and confirm C / B / A / S store levels.

Inputs:

- Field rep suggested level
- Field visit score
- Store profile completeness
- Display photos
- Campaign participation
- Fan scan / visit / reward interaction
- Verification record
- Risk record

Actions:

- Approve suggested level
- Change level
- Downgrade
- Reject upgrade
- Add review note

Every level change must keep an audit record:

- Previous level
- New level
- Field suggested level
- Reviewer
- Review time
- Reason

### Display review

Review store display evidence:

- Storefront photo
- Shelf photo
- Counter display
- Lightbox
- UWELL product area
- Competitor display if submitted

Actions:

- Approve
- Reject
- Request update
- Add review note
- Count toward level upgrade task

### Exposure control

Control how stores appear in the fan app.

Settings:

- Recommended on fan Home
- Highlighted on fan map
- Eligible for reward pickup recommendation
- Eligible for Store Events display
- Exposure weight
- Risk downrank
- Hidden from fan app

Important rule:

An A/S store can still be downranked or hidden if it has complaints, suspicious activity, inventory issues, or poor service.

## Fans Module

Tabs:

1. Fan list
2. Level & points
3. Community review
4. Old fan verification
5. Risk flags

### Fan list

Manage fan profiles:

- Name / nickname
- Phone / email
- City
- Source store
- Current level
- Available points
- Lifetime growth points
- Recent activity

### Level & points

Manage fan level and point history:

- Bronze / Silver / Gold / Diamond
- Available points
- Lifetime growth points
- Point logs
- Manual point adjustment
- Adjustment reason
- Abnormal point records

### Community review

Moderate community content:

- Posts
- Comments
- Likes
- Official picks
- Hidden posts
- Deleted posts
- Abuse flags

### Old fan verification

Review old fan or profile-completion submissions:

- Submitted evidence
- Fan profile
- Review result
- +100 point award when approved
- Rejection reason

### Risk flags

Review risky fan behavior:

- High-frequency scans
- Repeated claimed-code scans
- Community point abuse
- Abnormal redemption
- Multi-account behavior
- Manual risk flags

Actions:

- Limit points
- Limit redemption
- Mark suspicious
- Clear risk
- Add note

## Campaigns Module

Tabs:

1. Official campaigns
2. Store event reviews
3. Activity rules

### Official campaigns

Manage UWELL official campaigns:

- Campaign title
- Campaign image
- Campaign time
- Points or reward
- Participation method
- Display in fan app Official tab
- Recommend to fan Home
- Allow stores to join

### Store event reviews

Review store-created events:

- Store
- Event title
- Reward
- Time
- Description
- Optional image
- Store cost / UWELL cost note
- Approval status

Actions:

- Approve and publish to fan app Store Events
- Reject with reason
- Request changes
- Mark whether materials, gifts, or costs are store-covered or UWELL-supported

Required reminder:

Store-created events are not automatically funded by UWELL. UWELL already provides official campaigns that stores can join.

### Activity rules

Configure activity defaults:

- Activity type
- Default points
- Requires store check-in
- Requires scan
- Requires external stay time
- Repeatability
- Daily limits
- Home recommendation eligibility

## Rewards Module

Rewards is an independent module.

Functions:

- Reward list
- Reward image
- Required points
- Required fan level
- Reward type: normal, premium, Diamond luxury
- Eligible pickup store level: A/S or S
- Inventory display status
- Redemption records
- Store verification records
- Abnormal redemption review
- Diamond luxury reward approval
- Assigned pickup store or official handling method

Reward pickup rules:

| Reward type | Pickup rule |
|---|---|
| Normal rewards | A or S stores |
| Premium rewards | S stores only |
| Diamond luxury rewards | Backend approval and assigned pickup method |

Diamond luxury rewards should never be auto-approved in the first version.

## Scan Codes Module

Scan Codes is an independent anti-fraud and growth module.

Functions:

- Global unique product codes
- Product code batches
- SKU binding
- Campaign QR codes
- Fan center entry QR codes
- Official website / Instagram / private community code rules
- Scan records
- Suspicious scans
- Claimed codes
- Blocked codes
- Daily scan limit rules
- Code validity period
- Reward points by code type

Code statuses:

| Status | Meaning |
|---|---|
| Unused | Not claimed |
| Claimed | Validly claimed |
| Suspicious | Repeated or abnormal scan |
| Blocked | Disabled |
| Expired | Out of valid period |

Scan records should show:

- Fan
- Code
- Code type
- Scan time
- Points awarded or not
- Points amount
- Daily limit result
- Suspicious flag
- Product / campaign / store relation

## Materials Module

Materials remains focused on store display and channel support.

Functions:

- Display materials
- Posters
- Lightboxes
- Acrylic stands
- Stickers
- Product catalogs
- Store material requests
- Material inbound / outbound
- Material package by store level

Materials should not manage fan rewards.

## Field Visits Module

Field Visits replaces the idea of a simple "My Stores" page for field reps. Field reps work through visits, evidence, scoring, and follow-up.

Tabs:

1. New Store Visit
2. Repeat Visit
3. Visit Records
4. Rating Review
5. Display Data

### New Store Visit

Used when a field rep visits a new store.

Workflow:

1. Create store profile.
2. Fill store basics.
3. Upload visit evidence.
4. Fill store display data.
5. Score store with standard rating form.
6. System generates suggested level: S / A / B / C.
7. Submit for backend review.

Store basics:

- Store name
- Country / city
- Address or map link
- Contact person
- Phone
- Store type
- Field rep

Visit evidence:

- Storefront photo
- Shelf photo
- Counter photo
- UWELL product display photo
- Competitor display photo
- Optional activity / crowd photo
- Visit time
- Optional location record in a later phase

### Repeat Visit

Used for already-created stores.

Workflow:

1. Select existing store.
2. View previous visit summary.
3. Update store display photos.
4. Update stock / SKU / competitor information.
5. Record campaign execution.
6. Record problems and next action.
7. Optionally trigger level reassessment.

Repeat visit data:

- Visit purpose
- Store condition
- UWELL display update
- Product coverage update
- Competitor pressure
- Activity execution
- Material needs
- Store owner feedback
- Next action

### Visit Records

List all visits with filters:

- New visits
- Repeat visits
- Rep
- City
- Store level
- Suggested level
- Final level
- Pending review
- Visit date

Each record should keep the original field submission.

### Rating Review

Manager/Admin review queue for field-submitted ratings.

This is where inconsistent field standards are corrected.

Review data:

- Field rep score
- Suggested level
- Uploaded evidence
- Store profile
- Display data
- Previous visit history if any
- Reviewer final level
- Reviewer reason

Actions:

- Approve suggested level
- Change level
- Request more evidence
- Reject submission

### Display Data

Store display data collected by field reps, especially during new store visits.

Data points:

- UWELL products currently available
- UWELL SKU list
- Display location: counter, shelf, storefront, corner, other
- Display area or shelf layers
- Lightbox / poster / stand presence
- Competitor brands present
- Competitor display strength
- Whether material support is needed
- Suggested display upgrade
- Photo evidence

This data helps managers understand where UWELL products are placed and whether a store deserves A/S exposure.

## Store Rating Rules

Use a simple 100-point rating model for the first version.

Suggested scoring:

| Dimension | Points |
|---|---:|
| Location / traffic | 20 |
| Store size | 15 |
| UWELL display | 20 |
| Product coverage | 15 |
| Store owner cooperation | 15 |
| Activity / reward pickup potential | 15 |

Suggested level:

| Score | Suggested level |
|---:|---|
| 85+ | S |
| 70-84 | A |
| 50-69 | B |
| 0-49 | C |

Important rule:

The system level is only a suggested level. Backend Manager/Admin confirms the final level.

Audit fields:

- Raw score
- Field rep suggested level
- Backend final level
- Reviewer
- Review time
- Modification reason

## Permissions

### Admin

Can access all modules and:

- Configure rules
- Review and change levels
- Adjust points
- Approve Diamond rewards
- Manage scan codes
- Manage users
- Handle risk

Admin is the only role that can create backend staff accounts.

Staff account creation is available only under:

- Settings > Users > Create staff account

The create form must include:

- Name
- Email
- Temporary password
- Role: Manager or Rep
- Region / city
- Assigned area
- Assigned stores, optional
- Status: Active or Disabled

The public backend login page must only show login. It must not show Register, Create account, Manager registration, or Rep registration.

### Manager

Can access operations and review workflows:

- Store reviews
- Display reviews
- Store event reviews
- Reward reviews
- Fan reviews
- Field visit rating reviews
- Exposure control

Cannot manage system users or deep technical settings unless granted.

### Rep / Field user

Focuses on visit execution:

- New Store Visit
- Repeat Visit
- Visit Records for own visits or assigned area
- Store Rating submission
- Display Data submission
- Material request support
- Fan complaints related to assigned area or visited stores

Rep should not directly set final store level, fan exposure, reward rules, scan rules, or fan point rules.

## Account And Email Rules

All account creation and registration flows must require a valid email format and a real-looking email domain suffix.

Applies to:

- Fan registration.
- Store owner registration.
- Admin-created Manager accounts.
- Admin-created Rep accounts.

Rules:

- Email must match normal email format.
- Email domain must include a valid suffix, such as `.com`, `.net`, `.org`, `.sa`, or another real TLD.
- Clearly fake formats such as `123@123`, `123@123.`, or malformed addresses are rejected.
- Trial validation can use format and suffix checks first.
- Later production validation can add email verification links or OTP.

## Language And RTL

Trial language scope:

- English
- Arabic

Default:

- English.

Arabic RTL requirements:

- Admin layout direction changes to rtl.
- Sidebar or drawer adapts to RTL.
- Tables remain readable.
- Forms align correctly.
- Review modals do not overflow Arabic copy.
- Labels stay short where possible.

## Visual Direction

Admin should use the UWELL yellow-green brand family in a restrained operations-console style.

Guidelines:

- Higher information density than fan and store apps.
- Clear review queues and status tags.
- Yellow for key actions and high-priority notices.
- Green for approved, active, growth, and healthy states.
- Red/orange for risk, rejected, suspicious, or overdue states.
- Avoid marketing-style landing layouts.

## Out Of Scope For First Redesign

- Fully automated store level decisions.
- Advanced fraud investigation graphs.
- Multi-country language expansion.
- Full financial reimbursement workflow.
- Deep staff permission matrix for store staff.
- Offline field visit mode.

## Open Items For Review

- Exact field visit form fields.
- Whether GPS location should be required for visits in phase one.
- Final display evidence categories.
- Final material package per store level.
- Whether rating score thresholds should be adjusted after trial data.
- Arabic review wording and policy wording.

## 2026-07-11 Confirmed Update

This section supersedes any earlier conflicting detail in this document.

### Dashboard Final Structure

Dashboard is a segmented operations cockpit, not a simple KPI row.

Sections:

1. Core KPI overview
   - Total fans
   - New fans this week
   - Total stores
   - New stores this week
   - Verified visits
   - Pending reviews

2. Fan analytics
   - Total fans
   - New fans today / this week
   - Active fans
   - Bronze / Silver / Gold / Diamond fan counts

3. Store analytics
   - Total stores
   - New stores this week
   - S / A / B / C store counts
   - Stores missing photos
   - Stores pending review

4. Field visit analytics
   - Total visits
   - New store visits
   - Repeat visits
   - Visits this week
   - Pending visit reviews
   - Stores suggested for upgrade
   - Rep performance by region where permitted

5. Campaign and verification
   - Active campaigns
   - Fan joins
   - Store verifications
   - Pending verification reviews
   - Rejected / duplicate verifications

6. Material inventory alerts
   - Low stock by warehouse
   - Out of stock by warehouse
   - Pending material requests
   - Recent shipments where available

Default range is This Week. Filters:

- Today
- This Week
- This Month
- Custom

Use KPI cards, level distribution bars, pending review lists, inventory alerts, and rep performance tables. Do not create a decorative big-screen dashboard.

### Reviews Module

Reviews is a unified backend pending-work center.

Review types:

- Store-created campaigns
- High-value reward requests
- Store level changes
- Field visit rating submissions
- Suspicious scans
- Store front photos
- Display photos
- Material requests
- Community reports

Top filters:

- All
- Campaigns
- Rewards
- Store Levels
- Visits
- Scan Risks
- Photos
- Materials
- Community

Review statuses:

- Pending
- Approved
- Rejected
- Need More Info
- Escalated
- Expired

Review actions:

- Approve
- Reject
- Request More Info
- Escalate
- Add note

High-priority items include high-value rewards, suspicious scans, S/A level changes, abnormal store verification, and repeated community abuse.

### Risk Center

Risk Center finds abnormal behavior. Reviews handles manual decisions for high-risk items.

Risk categories:

1. Scan Risks
   - Invalid scan attempts over 10 per day
   - Repeated claimed-code scans
   - Same code attempted by multiple fans
   - Daily scan limit exceeded with many further attempts

2. Store Verification Risks
   - Same store verifications over 30 per hour
   - Manual verification ratio over 50%
   - Same fan/activity duplicate attempts
   - Non-business-hour spikes

3. Community Risks
   - Duplicate comments over 5 per day
   - Very short comments
   - Same group mutual likes
   - Reported posts
   - Post and delete abuse

4. Reward Risks
   - High-value reward request
   - Abnormal point source before redemption
   - Repeated high-value requests

5. Account Risks
   - New account earns over 100 points on first day
   - Multiple accounts on same device
   - Store account excessive manual verification
   - Field rep abnormal visit submissions

Risk statuses:

- Open
- Under Review
- Resolved
- Dismissed
- Escalated

Initial actions:

- Mark Resolved
- Reject Related Points
- Add Note
- Send to Reviews

Account suspension and point freezing can be later-phase actions.

### Materials Multi-warehouse Update

Materials must support multi-region and multi-warehouse inventory from the first version.

Initial warehouses:

- Riyadh Warehouse
- Dammam Warehouse
- Jeddah Warehouse

Inventory should be tracked by warehouse, not only total stock.

Inventory table:

- Material name
- Riyadh stock
- Dammam stock
- Jeddah stock
- Total stock
- Low-stock threshold by warehouse
- Status by warehouse

Material request fields:

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

Statuses:

- Pending
- Approved
- Rejected
- Packed
- Shipped
- Delivered
- Cancelled

If a regional warehouse is insufficient, the system should show a warning and suggest checking another warehouse. Inter-warehouse transfer can be later phase.

### Region-based Access Control

Backend data visibility must follow role and region.

Admin:

- Can see all regions and warehouses.
- Can manage all inventory, users, rules, and reviews.

Manager:

- Can see assigned regions only.
- Can review assigned-region stores, visits, material requests, and inventory.
- Cannot create Manager or Rep accounts.

Field Rep:

- Can see only assigned-region data.
- Can see only assigned-region warehouse inventory.
- Can submit material needs for assigned-region stores.
- Cannot modify inventory.
- Cannot approve material requests.
- Cannot view other regions such as Dammam or Jeddah if assigned to Riyadh only.

Region filtering applies to:

- Dashboard
- Stores
- Field Visits
- Materials
- Material Requests
- Visit records
- Region-specific alerts

### Audit Log

Audit Log must record all critical backend operations.

Record these operations:

- Staff account creation or disable
- Store level change
- Store photo review
- Campaign creation, review, or modification
- Reward creation, review, or redemption handling
- Manual point adjustment
- Scan risk handling
- Material inventory modification
- Material request approval or rejection
- Field visit review
- Rule setting changes

Log fields:

- Actor
- Role
- Region where relevant
- Time
- Action type
- Target object
- Before value
- After value
- Reason / note
- IP / device in later phase

Permissions:

- Admin can view all audit logs.
- Manager can view assigned-region logs.
- Field Rep can only see status history for own submissions where needed.

First version should record logs and provide a simple list with filters. Advanced export and anomaly analysis can be later.

### Rule Settings Boundary

Rules are split into fixed system logic and configurable operational parameters.

Fixed system logic:

- Reward redemption deducts Available points.
- Redemption does not deduct Lifetime growth points.
- Fan level is based on Lifetime growth points.
- Redemption never downgrades fan level.
- Stores cannot manually give points.
- Stores only verify; system awards points.
- One unique product code can only be claimed once.
- Same fan cannot earn duplicate points for the same activity.
- Backend login page has no public registration.
- Only Admin can create Manager and Rep accounts.
- Region-based access control is mandatory.

Admin-configurable operational parameters:

- Scan points
- Daily scan counted limit
- Check-in points
- Community like/comment/post points and daily limits
- Level thresholds
- Reward point costs
- Reward level requirements
- Reward stock
- Campaign reward points
- Campaign validity period
- Eligible stores
- Material low-stock thresholds
- High-value reward review threshold

Requires review/log before effect:

- Store-created campaign points support
- High-value reward approval
- Store level S/A/B/C adjustment
- Manual point adjustment
- Suspicious scan handling
- Cross-region material transfer in later phase
- Community abuse point reversal

### Store Rating Rules Update

Store rating uses a 100-point model with monthly sales included at 20%.

Suggested scoring:

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

Monthly sales is important but cannot alone decide final level. Missing photos, poor display, weak cooperation, or risk records can cap the final level.

Field Rep submits score and suggested level. Manager reviews. Admin confirms or adjusts final level with reason and Audit Log entry.

### Reward Catalog Governance

Reward catalog values are configurable, but redemption logic is fixed.

Backend reward fields:

- Reward name
- Reward image
- Reward type
- Required points
- Required fan level
- Stock
- Region eligibility
- Compliance note where needed
- Review required
- Pickup method
- Status

High-value rewards such as China trip, phones, headphones, product bundles, sample big bundles, and sample devices require review.
