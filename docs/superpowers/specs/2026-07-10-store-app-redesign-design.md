# UWELL CRM Store App Redesign Design

Date: 2026-07-10
Status: Draft for user review

## Goal

Redesign the store app into a fast, practical operating tool for store owners and staff. The store app should help stores verify fan rewards, join UWELL activities, submit store-created events, maintain store status, and understand how better store levels bring more fan traffic.

The store app should feel lighter and more business-focused than the fan app. It should still use the UWELL yellow-green brand direction, but with clearer surfaces and less decorative motion.

## Core Principles

- Default language is English.
- Arabic is the only second language for the trial version and must support full RTL layout.
- Other languages are hidden for now.
- Store users should see the most important action first.
- Store users should not need to read long rules before completing routine operations.
- Reward verification must be faster than manual back-office workflows.
- Store level benefits must be clear and directly tied to fan exposure, reward pickup, and UWELL support.

## Main Navigation

The store app uses four fixed bottom navigation items:

1. Home
2. Verify
3. Activities
4. Me

Display upload is not a primary navigation item because it is important but low frequency. It appears as:

- A setup or status task on Home.
- A secondary entry under Me.

## Home

Home is the store workbench. It should answer: "What does this store need to do today?"

First screen order:

1. Store card
   - Store name
   - Store level: C, B, A, or S
   - Approval / status
   - City or address

2. Quick actions
   - Scan reward code
   - Create event
   - Upload display
   - Request materials

3. Core metrics
   - Today verified rewards
   - Active events
   - Display status
   - Pending tasks

4. Store status tasks
   - Display pending, approved, or needs update
   - Material request available or low material warning
   - Event feedback needed
   - Store profile incomplete

5. Recommended UWELL campaigns
   - Show one or two official campaigns with Join CTA.

Home should be practical and compact. Store owners should immediately know whether they need to verify rewards, complete setup, or join a campaign.

## Verify

Verify is the high-frequency reward pickup center.

Supported verification methods:

1. Scan code
   - Fan reward QR code.
   - Fan member QR / identity code.
   - Future activity check-in code.

2. Enter code
   - Manual reward code entry for camera failure, damaged QR code, or staff fallback.

Verification checks:

| Check | Purpose |
|---|---|
| Code exists | Reject invalid codes |
| Code unused | Prevent duplicate pickup |
| Fan matches code | Prevent using someone else's code |
| Fan level qualifies | Enforce level-specific rewards |
| Points were deducted or reserved | Prevent duplicate reward redemption |
| Store level qualifies | Normal rewards: A/S, premium rewards: S |
| Backend approval required | Diamond luxury rewards require review |
| Inventory available | Prevent pickup when stock is unavailable |
| Verification record saved | Store audit trail |

Suggested result states:

- Reward verified.
- Give item to customer.
- Already used.
- This store cannot fulfill this reward.
- Approval required.
- Out of stock.
- Invalid code.

Verify landing layout:

- Large Scan reward code button.
- Manual Enter code field.
- Today verified count.
- Recent 5 verification records.
- Pending or abnormal verification hints.

Staff account scope:

- Trial version uses one store owner login.
- Verification records should reserve operator fields for future expansion:
  - operator_id
  - operator_name
  - operator_role

Future roles:

- Owner
- Manager
- Staff

## Activities

Activities uses two tabs:

1. UWELL campaigns
2. My events

### UWELL campaigns

Official activities created by UWELL. Stores can join ready-made campaigns instead of creating everything themselves.

Examples:

- Product launch display.
- Store promotion.
- Offline check-in campaign.
- Product experience event.
- Store challenge.

Actions:

- Join
- View rules
- Submit feedback
- Upload proof

### My events

Store-created events submitted by the store and reviewed by UWELL.

Flow:

1. Store creates event.
2. Event is submitted for backend review.
3. If approved, event appears in the fan app under Activities > Store Events.
4. If changes are required or rejected, the store sees UWELL's reason and can edit or resubmit.

Initial event form:

- Activity title
- Date / time
- Reward: points or gift
- Short description
- Image optional
- Require check-in: yes/no

If no image is uploaded:

- Use a UWELL default campaign image.
- Or use a default image by activity type.

Store-created event reminder:

- Stores must be clearly told that not all materials, gifts, or costs are covered by UWELL.
- UWELL already provides official campaigns for stores to join.
- Store-created events require approval.

Suggested form hint:

`UWELL provides official campaigns you can join. Store-created events require approval, and materials or gifts may not always be covered by UWELL.`

Suggested confirmation modal:

Title:

`Submit store event for review?`

Body:

`UWELL will review your event. Some materials, gifts, or costs may need to be handled by the store. Official UWELL campaigns are available if you prefer ready-made activities.`

Actions:

- Submit for review
- View UWELL campaigns

Event statuses:

- Draft
- Pending review
- Approved
- Active
- Ended
- Changes required
- Rejected

## Display And Materials

Display upload is a secondary flow, not a bottom-nav item.

Entry points:

- Home setup task.
- Home display status card.
- Me > Store display & materials.

Display functions:

- Upload storefront photo.
- Upload shelf/display photo.
- Upload lightbox or counter display photo.
- Show review status.
- Show review note if rejected.
- Reupload after changes.

Materials functions:

- View material package by store level.
- Request materials.
- See request status.

Display upload is especially important for new stores and stores trying to upgrade level. After approval, it becomes a status item rather than a high-frequency navigation item.

## Me

Me is the store account and profile center.

Sections:

1. Store profile
   - Store name
   - Address
   - Contact
   - Phone

2. Store level & benefits
   - Current level
   - Next level
   - Remaining upgrade tasks
   - Fan exposure benefits
   - Reward verification permission

3. Store display & materials
   - Upload photos
   - View review state
   - Request materials

4. Policies
   - Reward pickup policy
   - Store-created event policy
   - S-level store policy

5. Settings
   - Language: English / Arabic
   - Logout

The level section should be short and practical:

- Your level: B
- Next: A
- Complete 2 more tasks to upgrade

## Store Levels

Use four store levels:

1. C
2. B
3. A
4. S

Store level is not based only on sales. It combines display quality, activity participation, fan interaction, reward verification quality, UWELL product coverage, and trust.

Use task-based upgrade rules plus backend review. Avoid complex automatic scoring in the trial version.

## Upgrade Rules

### C to B

Requirements:

- Complete store profile.
- Upload basic store photos.
- Have UWELL product display.
- No serious violation record.

### B to A

Requirements:

- Display photos approved.
- Clear UWELL product display area.
- Joined at least one UWELL official campaign.
- Has fan scan, store visit, or reward interaction record.
- Store profile complete.

### A to S

Requirements:

- High-quality display that meets core-store standard.
- Continuous participation in UWELL campaigns.
- Stable reward pickup verification ability.
- Good fan interaction data.
- Strong UWELL product coverage.
- No abnormal verification or abuse records.

## Violation Handling

Risk behaviors:

- Fake reward verification.
- Activity abuse.
- False display photos.
- Repeated fan complaints.
- Long-term refusal to cooperate with activities.

Possible actions:

- Suspend reward verification permission.
- Downgrade store level.
- Mark store as risky.
- Hide or reduce fan app exposure.
- Require backend review before further activity participation.

## Level Benefits

| Level | Store benefits |
|---|---|
| C | Basic partner listing, partial official campaign access |
| B | Basic material requests, most campaign access, normal map listing |
| A | Normal reward verification, higher fan map placement, more campaign exposure, better material support |
| S | Premium reward verification, Home and map priority exposure, priority official campaigns, core material support, featured partner identity |

Material support:

- C: posters, product catalog.
- B: posters, stickers, basic display stand.
- A: lightbox, acrylic display, more display materials.
- S: core display package, lightbox, storefront or premium event materials where approved.

Reward verification permission:

| Reward type | Store level |
|---|---|
| Normal rewards | A or S |
| Premium rewards | S |
| Diamond luxury rewards | Backend review and assigned pickup method |

## Fan App Exposure Link

Store level must directly affect fan app visibility and traffic.

Fan app exposure by level:

| Store level | Fan app exposure |
|---|---|
| C | Basic map listing, low priority |
| B | Normal map listing, can join some activities |
| A | Higher map placement, Home nearby recommendation eligibility, normal reward pickup |
| S | Highlighted / priority map placement, Home recommendation priority, Store Events priority, premium reward pickup |

Fan Home recommendation ranking should consider:

1. Distance.
2. Store level.
3. Active store event.
4. Reward pickup availability.
5. Recent approved display.
6. No risk or complaint flag.

Fan map should support filters:

- Nearby
- Reward pickup
- Store events
- S-level stores
- A/S recommended

Fan Rewards integration:

- Normal rewards show nearby A/S stores.
- Premium rewards show nearby S stores.
- Diamond luxury rewards use backend review and assigned pickup method.

Fan Store Events ranking should prefer:

1. S/A store events.
2. Nearby stores.
3. Clear reward.
4. Active or soon-starting events.
5. Admin recommended events.

Important store-facing value message:

`Better store level = more fan traffic and reward pickup opportunities.`

## Language And RTL

Trial language scope:

- English
- Arabic

Default:

- English.

Arabic RTL requirements:

- Page direction changes to rtl.
- Back buttons and navigation patterns adapt to RTL.
- Form labels and inputs align correctly.
- Cards and modals do not overflow Arabic text.
- Store operation copy remains short.

## Account And Email Rules

Store owner registration must require a valid email format and a real-looking email domain suffix.

Rules:

- Email must match normal email format.
- Email domain must include a valid suffix, such as `.com`, `.net`, `.org`, `.sa`, or another real TLD.
- Clearly fake formats such as `123@123`, `123@123.`, or malformed addresses are rejected.
- Trial validation can use format and suffix checks first.
- Later production validation can add email verification links or OTP.

## Visual Direction

Use the same UWELL yellow-green brand family as the fan app, but with a calmer operating-tool tone.

Store app style:

- Bright yellow for primary action.
- Green for active, approved, and growth states.
- White or dark charcoal surfaces depending on final theme variant.
- Cleaner layouts than the fan app.
- Strong icons for Verify, Activities, Store level, and Tasks.

The store app should not look like a marketing landing page. It should feel like a clean store operation tool.

## Out Of Scope For First Redesign

- Full multi-staff permission management.
- Complex automatic store scoring.
- Exact material reimbursement automation.
- Advanced fraud investigation dashboard.
- Full global language rollout.
- Accounting or payout workflows.

## Open Items For Review

- Exact S-level display standard.
- Exact material package for each store level.
- Whether store event rewards can include both points and gift in one event.
- Whether staff account management should enter phase two or phase three.
- Final Arabic translations and legal wording for store-created event cost responsibility.

## 2026-07-11 Confirmed Update

This section supersedes any earlier conflicting detail in this document.

### Home Final Structure

Store Home should show store status, light exposure performance, today tasks, and one active campaign.

First screen:

1. Store status card
   - Store name
   - Store level
   - Exposure status
   - Profile completion

2. Exposure this week
   - Views
   - Navigation
   - Verified visits

3. Today tasks
   - Verify fan participation
   - Review active campaigns
   - Upload store photos if missing

4. Active campaign
   - Show one most relevant active campaign.
   - CTAs: Verify Fan, View Activity.

Do not show complex exposure dashboards in the store app first version.

### Exposure Metrics

Store exposure metrics are intentionally lightweight in the first version.

Only three event groups are required:

- store_view
- store_navigate
- store_verified_visit

Definitions:

- Views: fan saw or opened the store in Stores.
- Navigation: fan clicked Navigate.
- Verified visits: store verified fan participation or visit through Store Verify.

Advanced metrics such as profile views, conversion rates, rankings, and trend charts are later-phase enhancements.

### Verify Permission Rule

Stores do not give points to fans.

Stores can:

- Scan fan QR.
- Confirm activity participation.
- Confirm reward pickup where allowed.
- Submit proof or notes if required.

Stores cannot:

- Enter arbitrary point amounts.
- Manually add points to fans.
- Change fan levels.
- Change campaign reward rules.
- Approve high-value rewards.

The system awards points after verification according to backend campaign rules. High-risk or high-value records go to backend review.

### Store Activity Verification

Offline store activity flow:

1. Fan joins the activity.
2. Fan visits the store.
3. Store scans fan member/activity QR.
4. Store confirms participation.
5. System validates duplicate, activity, store, time, and risk rules.
6. System awards points or marks Pending Review.

Manual fan search by email or Fan ID is only a fallback when scanning fails. Manual verification must be logged.

### Store-created Campaign Rule

Store-created campaigns are allowed, but points support and UWELL-funded materials are not automatic.

Required reminder:

`UWELL provides official campaigns you can join. Store-created campaigns require approval, and materials, gifts, or costs may need to be handled by the store.`

If a store-created campaign requests UWELL points support, it must be submitted for backend approval.

### Store Photo Types

Store photos are split into two categories.

#### Store Front Photo

Purpose:

- Shown to fans on the store map and store detail.
- Helps fans recognize the store front or signboard.
- Improves trust and visit intent.
- Can support exposure quality.

Suggested store-facing copy:

`This photo will be shown to fans on the store map. A clear storefront or signboard photo helps fans recognize your store and can improve trust and visit intent.`

#### Display Photos

Purpose:

- Used by UWELL backend, managers, and field reps for level review.
- Shows product display, UWELL materials, counter, shelf, lightbox, and campaign execution.
- Can affect S/A/B/C store rating.

Display photos should not be heavily exposed in the fan app by default.

### Store Photo Reminder Rule

If required store photos are missing:

- Show upload prompt during first store setup.
- Remind during the first three logins.
- After the third login, stop popup reminders and keep the missing status in Me > Store Profile.
- If backend rejects photos, show Needs update and rejection reason.

Reminder levels:

- First login: strong reminder.
- Second login: normal reminder.
- Third login: final reminder.

### Me / Store Profile Final Structure

Me is the store profile and settings center.

Sections:

1. Store profile card
   - Store name
   - Store level
   - Exposure status
   - Profile completion

2. Store photos
   - Store Front Photo: shown to fans on map
   - Display Photos: used for level review

3. Store information
   - Address
   - Business hours
   - Contact
   - Location pin

4. Level review
   - Current level
   - Review status
   - Last field visit
   - Improvement tips

5. Account and settings
   - Account email
   - Language: English / Arabic
   - Help
   - Logout

### Store Level Rating Update

Monthly sales is part of store rating and accounts for 20% of the total score.

Initial monthly sales ranges:

| Monthly sales | Rating signal | Sales score |
|---|---|---:|
| 0 units | No sales signal | 0 |
| 1-2 units | C-level sales range | 5 |
| 2-3 units | B-level sales range | 10 |
| 3-4 units | A-level sales range | 15 |
| 4-6+ units | S-level sales range | 20 |

Monthly sales is important but cannot alone decide the final store level. Poor display, missing photos, weak cooperation, or risk records can limit the final level even if sales are strong.
